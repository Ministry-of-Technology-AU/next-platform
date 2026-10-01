/**
 * Platform form kit. Import everything from `@/components/form`.
 *
 * Two ways to use the fields:
 *   1. Controlled, as before: `value` + `onChange` (+ optional `schema` for
 *      self-validation on blur).
 *   2. With `useZodForm` + `<Form>` + `<FormField>`: the schema drives
 *      validation, cleaning, focus-on-error and the error summary.
 *
 * Schemas, cleaning helpers and `uploadFiles()` live in `@/lib/forms/fields`.
 * Usage guide: `.agents/blueprints/components.md` → FORM.
 */

// Form plumbing
export { useZodForm, Form, FormField, FormErrorSummary, type BoundField, type FormProps, type FormFieldProps } from "./form-root";
export {
  SubmitButton,
  FormContainer,
  FormSection,
  FormStepper,
  InstructionsField,
  type SubmitButtonProps,
  type FormContainerProps,
  type FormSectionProps,
  type FormStep,
  type FormStepperProps,
  type InstructionsFieldProps,
} from "./form-layout";

// Fields
export { TextInput, type TextInputProps, type TextInputType } from "./text-input";
export { PhoneInput, type PhoneInputProps } from "./phone-input";
export { RichTextInput, type RichTextInputProps } from "./rich-text-input";
export { SingleSelect, type SingleSelectProps } from "./single-select";
export {
  MultiSelectCheckbox,
  MultiSelectDropdown,
  CheckboxComponent,
  type MultiSelectCheckboxProps,
  type MultiSelectDropdownProps,
  type CheckboxComponentProps,
} from "./choice-fields";
export { DatePicker, DateTimePicker, type DatePickerProps, type DateTimePickerProps } from "./date-fields";
export { FileUpload, ImageUpload, type FileUploadProps, type ImageUploadProps } from "./file-upload";
export { FilePreviewDialog } from "./file-preview";

// Building blocks for custom fields
export { FieldShell, FieldError, RequiredMark, useFieldIds, controlAria, type FieldIds, type FieldShellProps } from "./field-shell";
export { useFieldValidation } from "./use-field-validation";
export type { FieldBaseProps, DropdownOption } from "./types";

// Re-export the schema toolkit so one import covers most forms.
export { field, uploadFiles, UploadError, type UploadedFile, type UploadTarget } from "@/lib/forms/fields";
