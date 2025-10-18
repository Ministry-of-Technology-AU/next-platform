"use client";

import * as React from "react";
import { useState } from "react";
import { Package, Phone, AlertTriangle, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Asset {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  status: "Available" | "Overdue";
  overdueDate?: string;
}

interface FormData {
  returnDate: string;
  purpose: string;
  phoneNumber: string;
}

interface AssetRequestDialogProps {
  asset: Asset | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData, asset: Asset) => void;
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}


export default function AssetDialog({
  asset,
  isOpen,
  onOpenChange,
  onSubmit,
}: AssetRequestDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    returnDate: "",
    purpose: "",
    phoneNumber: "",
  });
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(
      new Date("2025-06-01")
    );
    const [month, setMonth] = React.useState<Date | undefined>(date);
    const [value, setValue] = React.useState(formatDate(date));

  const validatePhoneNumber = (phone: string) => {
    return phone.length === 10 && /^\d{10}$/.test(phone);
  };

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phoneNumber: numericValue }));

    if (numericValue.length > 0 && !validatePhoneNumber(numericValue)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "Phone number must be exactly 10 digits",
      }));
    } else {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.returnDate) newErrors.returnDate = "Return date is required";
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";
    if (!validatePhoneNumber(formData.phoneNumber))
      newErrors.phoneNumber = "Valid 10-digit phone number is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && asset) {
      onSubmit(formData, asset);
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      returnDate: "",
      purpose: "",
      phoneNumber: "",
    });
    setHasScrolledToBottom(false);
    setErrors({});
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Request: {asset.title}
          </DialogTitle>
          <DialogDescription>
            Please fill out the following information to request this asset.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea
          className="max-h-[70vh] pr-4 px-1"
          onScrollCapture={handleScroll}
        >
          <div className="space-y-6">
            {/* Disclaimer */}
            <Alert className="border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-destructive">
                As soon as you submit the form, you will get an automated email
                confirming the receipt of your request. Approvals and scheduling
                pickup will happen on the same email thread. Kindly wait for our
                ministry member to reply to the email.
              </AlertDescription>
            </Alert>

            {/* Return Date */}
            <div className="space-y-2">
              <Input
                id="returnDate"
                type="date"
                value={formData.returnDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    returnDate: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
                className={errors.returnDate ? "border-destructive" : ""}
              />
              {errors.returnDate && (
                <p className="text-sm text-destructive">{errors.returnDate}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label
                htmlFor="returnDate"
                className="text-base font-medium gap-1.5"
              >
                Expected Return Date *
              </Label>
              <p className="text-sm text-muted-foreground">
                Select the date when you plan to return the asset. Maximum
                borrowing period is 30 days.
              </p>
              <div className="relative flex gap-2">
                <Input
                  id="date"
                  value={value}
                  placeholder="June 1, 2025"
                  className="bg-background pr-10 dark:text-gray-light text-gray-dark"
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setValue(e.target.value);
                    if (isValidDate(date)) {
                      setDate(date);
                      setMonth(date);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpen(true);
                    }
                  }}
                />
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-picker"
                      variant="ghost"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Select date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={(date) => {
                        setDate(date);
                        setValue(formatDate(date));
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-base font-medium">
                Purpose of Use *
              </Label>
              <p className="text-sm text-muted-foreground">
                Describe how you plan to use this asset. Include project
                details, course requirements, or event information.
              </p>
              <Textarea
                id="purpose"
                placeholder="e.g., Final year project photography, Technical fest documentation, Course assignment..."
                value={formData.purpose}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setFormData((prev) => ({
                      ...prev,
                      purpose: e.target.value,
                    }));
                  }
                }}
                className={`min-h-[100px] ${
                  errors.purpose ? "border-destructive" : ""
                }`}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {errors.purpose && (
                    <span className="text-destructive">{errors.purpose}</span>
                  )}
                </span>
                <span>{formData.purpose.length}/300</span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-medium">
                Contact Number *
              </Label>
              <p className="text-sm text-muted-foreground">
                Provide a valid 10-digit mobile number for communication
                regarding your request.
              </p>
              <div className="flex">
                <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">+91</span>
                </div>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`rounded-l-none ${
                    errors.phoneNumber ? "border-destructive" : ""
                  }`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Undertaking */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Borrower's Undertaking</h3>

              <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
                <p>
                  I, the undersigned, hereby acknowledge and agree to the
                  following terms and conditions:
                </p>

                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>
                    I will use the borrowed asset solely for the stated purpose
                    and will not lend it to any third party.
                  </li>
                  <li>
                    I will handle the asset with utmost care and return it in
                    the same condition as received.
                  </li>
                  <li>
                    I will return the asset on or before the agreed return date.
                  </li>
                  <li>
                    I understand that late returns may result in penalties and
                    affect my future borrowing privileges.
                  </li>
                  <li>
                    I will immediately report any damage, malfunction, or loss
                    to the concerned authorities.
                  </li>
                  <li>
                    I agree to bear the full replacement cost in case of damage
                    or loss due to my negligence.
                  </li>
                  <li>
                    I will not modify, repair, or alter the asset in any way
                    without prior permission.
                  </li>
                  <li>
                    I understand that this agreement is governed by the
                    institute's asset borrowing policy.
                  </li>
                </ol>
              </div>

              {/* Borrower's Details */}
              <div className="bg-background border rounded-lg p-4">
                <h4 className="font-medium mb-3">Borrower's Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Asset:</span>
                    <p className="font-medium">{asset.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Return Date:</span>
                    <p className="font-medium">
                      {formData.returnDate || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact:</span>
                    <p className="font-medium">
                      {formData.phoneNumber
                        ? `+91 ${formData.phoneNumber}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Request Date:</span>
                    <p className="font-medium">
                      {new Date().toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="text-center space-y-2">
                <h4 className="font-medium">For queries and support:</h4>
                <div className="text-sm text-muted-foreground mb-3">
                  <p>
                    <strong>Ministry of Technology, Ashoka University: </strong>
                    <a
                      href="mailto:technology.ministry@ashoka.edu.in"
                      className="text-primary hover:underline"
                    >
                      technology.ministry@ashoka.edu.in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasScrolledToBottom}
              className="min-w-[120px]"
            >
              {!hasScrolledToBottom ? "Scroll to Continue" : "Submit Request"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}