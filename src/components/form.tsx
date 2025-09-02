"use client";
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Phone,
  Upload,
  X,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "@/components/ui/disclosure";
import MultipleSelector, { Option } from "@/components/ui/multi-select";

// Phone Input Component
interface PhoneInputProps {
  title?: string;
  description?: string;
  placeholder?: string;
  defaultCountryCode?: string;
  countryCodeLocked?: boolean;
  className?: string;
  isRequired?: boolean;
  errorMessage?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function PhoneInput({
  title = "Contact Number",
  description = "Provide a valid 10-digit mobile number",
  placeholder = "9876543210",
  defaultCountryCode = "+91",
  countryCodeLocked = true,
  className = "",
  isRequired = false,
  errorMessage,
  value = "",
  onChange,
}: PhoneInputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="phoneNumber" className="text-base font-medium">
        {title} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="flex">
        <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
          <Phone className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{defaultCountryCode}</span>
        </div>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`rounded-l-none ${
            errorMessage ? "border-destructive" : ""
          }`}
        />
      </div>
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

// Text Input Component
interface TextInputProps {
  title: string;
  description?: string;
  placeholder: string;
  className?: string;
  isRequired?: boolean;
  errorMessage?: string;
  isParagraph?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password" | "number";
}

export function TextInput({
  title,
  description,
  placeholder,
  className = "",
  isRequired = false,
  errorMessage,
  isParagraph = false,
  value = "",
  onChange,
  type = "text",
}: TextInputProps) {
  const InputComponent = isParagraph ? Textarea : Input;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label
        htmlFor={title.toLowerCase().replace(/\s+/g, "-")}
        className="text-base font-medium"
      >
        {title} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <InputComponent
        id={title.toLowerCase().replace(/\s+/g, "-")}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={errorMessage ? "border-destructive" : ""}
        {...(isParagraph && {
          className: `min-h-[100px] ${
            errorMessage ? "border-destructive" : ""
          }`,
        })}
      />
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

// Single Select Component
interface DropdownOption {
  value: any;
  label: string;
  isDefault?: boolean;
  onClick?: () => void;
  disable?: boolean;
}

interface SingleSelectProps {
  title: string;
  description?: string;
  placeholder: string;
  className?: string;
  isRequired?: boolean;
  errorMessage?: string;
  items: DropdownOption[];
  value?: any;
  onChange?: (value: string) => void;
}

export function SingleSelect({
  title,
  description,
  placeholder,
  className = "",
  isRequired = false,
  errorMessage,
  items,
  value = "",
  onChange,
}: SingleSelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label
        htmlFor={title.toLowerCase().replace(/\s+/g, "-")}
        className="text-base font-medium"
      >
        {title} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={title.toLowerCase().replace(/\s+/g, "-")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

// Multi Select Component (Checkbox Style)
interface MultiSelectCheckboxProps {
  title: string;
  description?: string;
  className?: string;
  isRequired?: boolean;
  errorMessage?: string;
  items: DropdownOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
}

export function MultiSelectCheckbox({
  title,
  description,
  className = "",
  isRequired = false,
  errorMessage,
  items,
  value = [],
  onChange,
}: MultiSelectCheckboxProps) {
  const handleToggle = (itemValue: string) => {
    const newValue = value.includes(itemValue)
      ? value.filter((v) => v !== itemValue)
      : [...value, itemValue];
    onChange?.(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-base font-medium">
        {title} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <Checkbox
              id={item.value}
              checked={value.includes(item.value)}
              onCheckedChange={() => handleToggle(item.value)}
            />
            <Label htmlFor={item.value} className="text-sm font-normal">
              {item.label}
            </Label>
          </div>
        ))}
      </div>
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

// Multi Select Component (Dropdown Style)
interface MultiSelectDropdownProps {
  title: string;
  description?: string;
  placeholder: string;
  className?: string;
  isRequired?: boolean;
  errorMessage?: string;
  items: Option[];
  value?: string[];
  onChange?: (value: string[]) => void;
}

export function MultiSelectDropdown({
  title,
  description,
  placeholder,
  className = "",
  isRequired = false,
  errorMessage,
  items,
  value = [],
  onChange,
}: MultiSelectDropdownProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label
        htmlFor={title.toLowerCase().replace(/\s+/g, "-")}
        className="text-base font-medium"
      >
        {title} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <MultipleSelector
        defaultOptions={items}
        placeholder={placeholder}
        value={items.filter((item) => value.includes(item.value))}
        onChange={(selected) => onChange?.(selected.map((item) => item.value))}
        emptyIndicator={
          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
            no results found.
          </p>
        }
      />
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

// File Upload Component
interface FileUploadProps {
  title: string;
  description?: string;
  className?: string;
  isRequired?: boolean;
  errorMessage?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  value?: File[];
  onChange?: (files: File[]) => void;
}

export function FileUpload({
  title,
  description,
  className = "",
  isRequired = false,
  errorMessage,
  accept = "*/*",
  multiple = false,
  maxSize = 10,
  value = [],
  onChange,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) => file.size <= maxSize * 1024 * 1024
    );
    onChange?.(validFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange?.(newFiles);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-base font-medium">
        {title} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="space-y-2">
        <div
          className="border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max size: {maxSize}MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        {value.length > 0 && (
          <div className="space-y-2">
            {value.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

// Image Upload Component
interface ImageUploadProps {
  title: string;
  description?: string;
  className?: string;
  isRequired?: boolean;
  errorMessage?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  value?: File[];
  onChange?: (files: File[]) => void;
}

export function ImageUpload({
  title,
  description,
  className = "",
  isRequired = false,
  errorMessage,
  multiple = false,
  maxSize = 5,
  value = [],
  onChange,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") && file.size <= maxSize * 1024 * 1024
    );
    onChange?.(validFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange?.(newFiles);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-base font-medium">
        {title} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="space-y-2">
        <div
          className="border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to upload images or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max size: {maxSize}MB per image
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        {value.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {value.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

// Submit Button Component
interface SubmitButtonProps {
  text?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  description?: string;
}

export function SubmitButton({
  text = "Submit",
  className = "",
  isLoading = false,
  disabled = false,
  onClick,
  description,
}: SubmitButtonProps) {
  return (
    <div className={`space-y-2`}>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Button
        type="submit"
        variant="animated"
        className={`w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 ${className}`}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {isLoading ? "Submitting..." : text}
      </Button>
    </div>
  );
}

// Form Container Component
interface FormContainerProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  description?: string;
}

export function FormContainer({
  children,
  onSubmit,
  className = "",
  description,
}: FormContainerProps) {
  return (
    <CardContent>
      <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </form>
    </CardContent>
  );
}


// Instructions Field Component
interface InstructionsFieldProps {
  heading: string;
  subheading?: string;
  body: string | string[];
  className?: string;
  description?: string;
}

export function InstructionsField({
  heading,
  subheading,
  body,
  className = "",
  description,
}: InstructionsFieldProps) {
  const bodyContent = Array.isArray(body) ? body : [body];

  return (
    <CardHeader className={className}>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Disclosure className="flex-1 rounded-md border bg-primary-extralight/20 border-gray-200 dark:border-gray-700 p-3 min-w-0">
        <DisclosureTrigger>
          <Button
            variant="ghost"
            className="w-full justify-between text-sm sm:text-base font-medium min-w-0 hover:bg-primary-extralight/0"
          >
            <span className="truncate text-lg">{heading}</span>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </DisclosureTrigger>
        <DisclosureContent className="mt-2 space-y-2 px-2 sm:px-4">
          {subheading && <h5 className="font-bold !text-left">{subheading}</h5>}
          {bodyContent.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </DisclosureContent>
      </Disclosure>
    </CardHeader>
  );
}

// Checkbox Component
interface CheckboxComponentProps {
  title: string;
  description?: string;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  isRequired?: boolean;
  errorMessage?: string;
}

export function CheckboxComponent({
  title,
  description,
  value,
  onChange,
  className = "",
  isRequired = false,
  errorMessage,
}: CheckboxComponentProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start space-x-2">
        <Checkbox
          id={title.toLowerCase().replace(/\s+/g, "-")}
          checked={value}
          onCheckedChange={onChange}
          className="border-0 rounded-xs"
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor={title.toLowerCase().replace(/\s+/g, "-")}
            className="text-base font-medium cursor-pointer"
          >
            {title} {isRequired && <span className="text-destructive">*</span>}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-0">{description}</p>
          )}
        </div>
      </div>
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
