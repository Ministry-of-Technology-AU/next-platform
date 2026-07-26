# AshokaDS (..@0.1.0)

This design system is the published .. React library, bundled as a single
browser global. All 229 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.AshokaDS`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.AshokaDS.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { Accordion } = window.AshokaDS;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<Accordion />);
```

Wrap the tree in the provider — most components read theme/i18n from context:

```jsx
<NextAuthProvider><ThemeProvider defaultTheme={"light"}>{children}</ThemeProvider></NextAuthProvider>
```

## Tokens

374 CSS custom properties from ... Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (198): `--color-red-50`, `--color-red-100`, `--color-red-200`, …
- **spacing** (6): `--tw-space-y-reverse`, `--tw-space-x-reverse`, `--tw-inset-shadow`, …
- **typography** (20): `--font-sans`, `--font-serif`, `--font-mono`, …
- **radius** (6): `--radius-xs`, `--radius-sm`, `--radius-md`, …
- **shadow** (11): `--shadow-sm`, `--shadow-md`, `--shadow-lg`, …
- **other** (133): `--background`, `--spacing`, `--container-xs`, …

## Components

### general
- `Accordion`
- `Accordion11`
- `Accordion11Content`
- `Accordion11Item`
- `Accordion11Trigger`
- `AccordionContent`
- `AccordionItem`
- `AccordionTrigger`
- `Alert`
- `AlertDescription`
- `AlertTitle`
- `AnnouncementTag`
- `AnnouncementTitle`
- `AuroraBackground`
- `Avatar`
- `AvatarFallback`
- `AvatarImage`
- `Badge`
- `BannerAction`
- `BannerClose`
- `BannerIcon`
- `BannerTitle`
- `BentoGrid`
- `BentoGridItem`
- `Button`
- `ButtonGroup`
- `ButtonGroupSeparator`
- `ButtonGroupText`
- `Calendar`
- `CalendarDayButton`
- `Card`
- `CardContent`
- `CardDescription`
- `CardFooter`
- `CardHeader`
- `CardTitle`
- `Checkbox`
- `CheckboxComponent`
- `Collapsible`
- `CollapsibleContent`
- `CollapsibleTrigger`
- `ComboboxContent`
- `ComboboxCreateNew`
- `ComboboxEmpty`
- `ComboboxGroup`
- `ComboboxInput`
- `ComboboxItem`
- `ComboboxList`
- `ComboboxSeparator`
- `ComboboxTrigger`
- `Command`
- `CommandDialog`
- `CommandEmpty`
- `CommandGroup`
- `CommandInput`
- `CommandItem`
- `CommandList`
- `CommandSeparator`
- `CommandShortcut`
- `CopyButton`
- `DatePicker`
- `DateTimePicker`
- `DeveloperCredits`
- `Dialog`
- `DialogClose`
- `DialogContent`
- `DialogDescription`
- `DialogFooter`
- `DialogHeader`
- `DialogOverlay`
- `DialogPortal`
- `DialogTitle`
- `DialogTrigger`
- `Disclosure`
- `DisclosureContent`
- `DisclosureTrigger`
- `DismissNewToolAlert`
- `Drawer`
- `DrawerClose`
- `DrawerContent`
- `DrawerDescription`
- `DrawerFooter`
- `DrawerHeader`
- `DrawerOverlay`
- `DrawerPortal`
- `DrawerTitle`
- `DrawerTrigger`
- `DropdownMenu`
- `DropdownMenuCheckboxItem`
- `DropdownMenuContent`
- `DropdownMenuGroup`
- `DropdownMenuItem`
- `DropdownMenuLabel`
- `DropdownMenuPortal`
- `DropdownMenuRadioGroup`
- `DropdownMenuRadioItem`
- `DropdownMenuSeparator`
- `DropdownMenuShortcut`
- `DropdownMenuSub`
- `DropdownMenuSubContent`
- `DropdownMenuSubTrigger`
- `DropdownMenuTrigger`
- `Editor`
- `ExpandableText`
- `Field`
- `FieldGroup`
- `FieldLabel`
- `FileUpload`
- `FlickeringGrid`
- `FormContainer`
- `ImageUpload`
- `Input`
- `InstructionsField`
- `InteractiveGridPattern`
- `Label`
- `MinimalTiptap`
- `MorphingDialog`
- `MorphingDialogClose`
- `MorphingDialogContainer`
- `MorphingDialogContent`
- `MorphingDialogDescription`
- `MorphingDialogImage`
- `MorphingDialogSubtitle`
- `MorphingDialogTitle`
- `MorphingDialogTrigger`
- `MotionHighlight`
- `MotionHighlightItem`
- `MultipleSelector`
- `MultiSelectCheckbox`
- `MultiSelectDropdown`
- `MultiUserCombobox`
- `NewToolAlert`
- `NewToolBanner`
- `OrientationDialog`
- `PageTitle`
- `PhoneInput`
- `Popover`
- `PopoverAnchor`
- `PopoverContent`
- `PopoverTrigger`
- `Progress`
- `Rating`
- `RatingButton`
- `RichTextEditor`
- `RichTextInput`
- `ScrollArea`
- `ScrollBar`
- `Select`
- `SelectContent`
- `SelectGroup`
- `SelectItem`
- `SelectLabel`
- `SelectScrollDownButton`
- `SelectScrollUpButton`
- `SelectSeparator`
- `SelectTrigger`
- `SelectValue`
- `Separator`
- `Sheet`
- `SheetClose`
- `SheetContent`
- `SheetDescription`
- `SheetFooter`
- `SheetHeader`
- `SheetTitle`
- `SheetTrigger`
- `Sidebar`
- `SidebarContent`
- `SidebarFooter`
- `SidebarGroup`
- `SidebarGroupAction`
- `SidebarGroupContent`
- `SidebarGroupLabel`
- `SidebarHeader`
- `SidebarInput`
- `SidebarInset`
- `SidebarMenu`
- `SidebarMenuAction`
- `SidebarMenuBadge`
- `SidebarMenuButton`
- `SidebarMenuItem`
- `SidebarMenuSkeleton`
- `SidebarMenuSub`
- `SidebarMenuSubButton`
- `SidebarMenuSubItem`
- `SidebarProvider`
- `SidebarRail`
- `SidebarSeparator`
- `SidebarTrigger`
- `SingleSelect`
- `Skeleton`
- `Spinner`
- `SubmitButton`
- `Table`
- `TableBody`
- `TableCaption`
- `TableCell`
- `TableFooter`
- `TableHead`
- `TableHeader`
- `TableRow`
- `TabsContent`
- `TabsContents`
- `TabsList`
- `TabsTrigger`
- `Textarea`
- `TextInput`
- `ThemeToggle`
- `Toaster`
- `Toggle`
- `ToggleGroup`
- `ToggleGroupItem`
- `Tooltip`
- `TooltipContent`
- `TooltipProvider`
- `TooltipTrigger`
- `TourProvider`
- `TourStep`
- `TourTrigger`
- `TypingText`
- `WritingText`

### shadcn-io
- `Announcement`
- `Banner`
- `Combobox`
- `Tabs`

### landing-page
- `DashboardStats`
- `RecentPageTracker`

### data-table
- `DataTable`

### navbar
- `FeedbackDialog`
