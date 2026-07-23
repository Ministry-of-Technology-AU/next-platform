/**
 * Builder editor state + reducer. All schema mutations funnel through here so
 * dirty-tracking, undo, and save are centralized (spec §8.2). No external state
 * library — plain useReducer (spec §16).
 */

import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';
import { createBlock, createPage } from '@/lib/forms/defaults';
import type {
  FormBlock,
  FormBlockType,
  FormPage,
  FormSchema,
  FormSettings,
  FormTheme,
} from '@/lib/forms/schema';
import type { FormStatus } from '@/lib/forms/strapi-forms';

export interface EditorState {
  title: string;
  status: FormStatus;
  startDate: string | null;
  endDate: string | null;
  schema: FormSchema;
  selectedPageId: string;
  selectedBlockId: string | null;
}

export type EditorAction =
  | { type: 'ADD_BLOCK'; pageId: string; blockType: FormBlockType }
  | { type: 'UPDATE_BLOCK'; blockId: string; patch: Partial<FormBlock> }
  | { type: 'DELETE_BLOCK'; blockId: string }
  | { type: 'DUPLICATE_BLOCK'; blockId: string }
  | { type: 'REORDER_BLOCKS'; pageId: string; activeId: string; overId: string }
  | { type: 'ADD_PAGE' }
  | { type: 'UPDATE_PAGE'; pageId: string; patch: Partial<Omit<FormPage, 'blocks'>> }
  | { type: 'DELETE_PAGE'; pageId: string }
  | { type: 'REORDER_PAGES'; activeId: string; overId: string }
  | { type: 'SET_THEME'; theme: FormTheme }
  | { type: 'SET_SETTINGS'; settings: FormSettings }
  | { type: 'SET_META'; patch: Partial<Pick<EditorState, 'title' | 'status' | 'startDate' | 'endDate'>> }
  | { type: 'SELECT_BLOCK'; blockId: string | null }
  | { type: 'SELECT_PAGE'; pageId: string }
  | { type: 'REPLACE_ALL'; state: EditorState };

/** Remove any condition rules that reference a now-deleted block. */
function stripConditionsReferencing(schema: FormSchema, blockId: string): void {
  const scrub = (group: { rules: { blockId: string }[] } | undefined) => {
    if (!group) return undefined;
    group.rules = group.rules.filter((r) => r.blockId !== blockId);
    return group.rules.length > 0 ? group : undefined;
  };
  for (const page of schema.pages) {
    page.visibleWhen = scrub(page.visibleWhen) as FormPage['visibleWhen'];
    for (const block of page.blocks) {
      block.visibleWhen = scrub(block.visibleWhen) as FormBlock['visibleWhen'];
    }
  }
}

function findPage(schema: FormSchema, pageId: string): FormPage | undefined {
  return schema.pages.find((p) => p.id === pageId);
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SELECT_BLOCK':
      return { ...state, selectedBlockId: action.blockId };

    case 'SELECT_PAGE':
      return { ...state, selectedPageId: action.pageId, selectedBlockId: null };

    case 'SET_META':
      return { ...state, ...action.patch };

    case 'REPLACE_ALL':
      return action.state;

    case 'ADD_BLOCK': {
      const schema = structuredClone(state.schema);
      const page = findPage(schema, action.pageId);
      if (!page) return state;
      const block = createBlock(action.blockType);
      page.blocks.push(block);
      return { ...state, schema, selectedBlockId: block.id, selectedPageId: page.id };
    }

    case 'UPDATE_BLOCK': {
      const schema = structuredClone(state.schema);
      for (const page of schema.pages) {
        const idx = page.blocks.findIndex((b) => b.id === action.blockId);
        if (idx !== -1) {
          page.blocks[idx] = { ...page.blocks[idx], ...action.patch } as FormBlock;
          break;
        }
      }
      return { ...state, schema };
    }

    case 'DELETE_BLOCK': {
      const schema = structuredClone(state.schema);
      for (const page of schema.pages) {
        page.blocks = page.blocks.filter((b) => b.id !== action.blockId);
      }
      stripConditionsReferencing(schema, action.blockId);
      return {
        ...state,
        schema,
        selectedBlockId: state.selectedBlockId === action.blockId ? null : state.selectedBlockId,
      };
    }

    case 'DUPLICATE_BLOCK': {
      const schema = structuredClone(state.schema);
      for (const page of schema.pages) {
        const idx = page.blocks.findIndex((b) => b.id === action.blockId);
        if (idx !== -1) {
          const clone = { ...structuredClone(page.blocks[idx]), id: uuidv4() };
          page.blocks.splice(idx + 1, 0, clone);
          return { ...state, schema, selectedBlockId: clone.id };
        }
      }
      return state;
    }

    case 'REORDER_BLOCKS': {
      const schema = structuredClone(state.schema);
      const page = findPage(schema, action.pageId);
      if (!page) return state;
      const from = page.blocks.findIndex((b) => b.id === action.activeId);
      const to = page.blocks.findIndex((b) => b.id === action.overId);
      if (from === -1 || to === -1) return state;
      page.blocks = arrayMove(page.blocks, from, to);
      return { ...state, schema };
    }

    case 'ADD_PAGE': {
      const schema = structuredClone(state.schema);
      const page = createPage(`Page ${schema.pages.length + 1}`);
      schema.pages.push(page);
      return { ...state, schema, selectedPageId: page.id, selectedBlockId: null };
    }

    case 'UPDATE_PAGE': {
      const schema = structuredClone(state.schema);
      const page = findPage(schema, action.pageId);
      if (!page) return state;
      Object.assign(page, action.patch);
      return { ...state, schema };
    }

    case 'DELETE_PAGE': {
      if (state.schema.pages.length <= 1) return state; // keep at least one page
      const schema = structuredClone(state.schema);
      const removed = findPage(schema, action.pageId);
      schema.pages = schema.pages.filter((p) => p.id !== action.pageId);
      // Strip conditions referencing blocks that lived on the removed page.
      removed?.blocks.forEach((b) => stripConditionsReferencing(schema, b.id));
      const nextSelected =
        state.selectedPageId === action.pageId ? schema.pages[0].id : state.selectedPageId;
      return { ...state, schema, selectedPageId: nextSelected, selectedBlockId: null };
    }

    case 'REORDER_PAGES': {
      const schema = structuredClone(state.schema);
      const from = schema.pages.findIndex((p) => p.id === action.activeId);
      const to = schema.pages.findIndex((p) => p.id === action.overId);
      if (from === -1 || to === -1) return state;
      schema.pages = arrayMove(schema.pages, from, to);
      return { ...state, schema };
    }

    case 'SET_THEME': {
      const schema = structuredClone(state.schema);
      schema.theme = action.theme;
      return { ...state, schema };
    }

    case 'SET_SETTINGS': {
      const schema = structuredClone(state.schema);
      schema.settings = action.settings;
      return { ...state, schema };
    }

    default:
      return state;
  }
}

/** Actions that mutate the document (used to decide when to snapshot for undo). */
export function isMutating(action: EditorAction): boolean {
  return !['SELECT_BLOCK', 'SELECT_PAGE', 'REPLACE_ALL'].includes(action.type);
}
