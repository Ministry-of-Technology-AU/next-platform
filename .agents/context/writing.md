# WRITING STYLE

One voice across the platform. Applies to every piece of prose a person reads: PRDs, feature
docs, and all UI copy (tour steps, tooltips, empty and error states, toasts, banners, what's-new
entries, page subheadings, dialog text).

Surface-specific rules (length, format) live with the surface. This file is the shared base
they all build on.

## Rules

1. **No em dashes (—). Anywhere.** Use a comma, colon, full stop, parentheses, or a new sentence.
2. **Plain words.** Write for a first-year student who has never seen the tool. Short sentences.
3. **Say what to do and what happens.** Not how it looks; the reader can see it.
4. **No filler or hype.** No "simply", "just", "easily", "seamless", "powerful", "robust".
5. **Name the control, never "click here".** "Press Add to put the course in your plan."
   Screen reader users don't click and can't see "here".
6. **Indian English spelling.** organisation, catalogue, colour, behaviour.
7. **Be specific.** Numbers, names and consequences over adjectives. "Deletes the draft. This
   cannot be undone." beats "Are you sure?"
8. **Don't make things up.** Unknown → ask, or write `TBD` in specs.

## Final pass: `/humanizer`

Run `/humanizer` over the prose before handing off. Apply it to prose only. Leave these
untouched so meaning can't shift: code blocks, file paths, identifiers, field names, API
contracts, table values, template headings, and anything the user wrote verbatim.

After the pass, re-check rule 1. The humanizer must not reintroduce dashes.

## Where the surface-specific rules live

| Surface | Rules |
|---------|-------|
| PRD | `.agents/blueprints/prd.md` |
| Feature docs | `.agents/blueprints/documentation.md` |
| Guided tour steps | `guided-tour` skill → step text section |
| Tooltips | `.agents/context/frontend.md` → tooltips section |
| Empty / error states | `.agents/context/frontend.md` → states section |
| What's new, banners, alerts | `.agents/blueprints/components.md` → that component's section |
