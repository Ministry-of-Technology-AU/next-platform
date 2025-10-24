"use client";

import * as React from "react";
import { useState } from "react";
import { Package, AlertTriangle, CalendarIcon } from "lucide-react";
import { getCurrentDateISTString, isBeforeTodayIST } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PhoneInput,
  TextInput,
  CheckboxComponent,
} from "@/components/form";
import { Asset } from "../types";

interface FormData {
  returnDate: string;
  purpose: string;
  phoneNumber: string;
  agreedToTerms: boolean;
}

interface AssetRequestDialogProps {
  asset: Asset | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestSuccess?: () => void;
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
  onRequestSuccess,
}: AssetRequestDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    returnDate: "",
    purpose: "",
    phoneNumber: "",
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date | undefined>(new Date());
  const [value, setValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);

  // Fetch user phone number when dialog opens
  React.useEffect(() => {
    const fetchUserPhone = async () => {
      if (!isOpen) return;
      
      setIsLoadingPhone(true);
      try {
        const response = await fetch('/api/platform/profile');
        if (response.ok) {
          const result = await response.json();
          if (result.data?.phone_number) {
            setFormData(prev => ({
              ...prev,
              phoneNumber: result.data.phone_number
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user phone:', error);
      } finally {
        setIsLoadingPhone(false);
      }
    };

    fetchUserPhone();
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.returnDate) {
      newErrors.returnDate = "Return date is required";
    } else {
      const selectedDate = new Date(formData.returnDate);
      const todayIST = getCurrentDateISTString();
      const todayDate = new Date(todayIST);
      
      const maxDate = new Date(todayDate);
      maxDate.setDate(maxDate.getDate() + 30);
      
      if (isBeforeTodayIST(formData.returnDate)) {
        newErrors.returnDate = "Return date cannot be before today";
      } else if (selectedDate > maxDate) {
        newErrors.returnDate = "Maximum borrowing period is 30 days";
      }
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = "Purpose is required";
    } else if (formData.purpose.trim().length < 10) {
      newErrors.purpose = "Please provide more details (at least 10 characters)";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    } else if (!/^[6-9]/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must start with 6, 7, 8, or 9";
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!asset) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/platform/borrow-assets/${asset.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: getCurrentDateISTString(), // Today's date in IST
          to: formData.returnDate,
          reason: formData.purpose,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request');
      }

      // Success! Show success message or redirect
      alert('Asset request submitted successfully! You will receive a confirmation email shortly.');
      onRequestSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      returnDate: "",
      purpose: "",
      phoneNumber: "",
      agreedToTerms: false,
    });
    setErrors({});
    setDate(undefined);
    setValue("");
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Request: {asset.name}
          </DialogTitle>
          <DialogDescription>
            Please fill out the following information to request this asset.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4 px-1">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  id="returnDate"
                  value={value}
                  placeholder="Select a date"
                  className={`bg-background pr-10 dark:text-gray-light text-gray-dark ${
                    errors.returnDate ? "border-destructive" : ""
                  }`}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setValue(e.target.value);
                    if (isValidDate(date)) {
                      setDate(date);
                      setMonth(date);
                      setFormData((prev) => ({
                        ...prev,
                        returnDate: e.target.value,
                      }));
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
                      type="button"
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
                      disabled={(date) => {
                        const todayIST = new Date(getCurrentDateISTString());
                        const maxDate = new Date(todayIST);
                        maxDate.setDate(maxDate.getDate() + 30);
                        
                        // Allow today's date, but not before today
                        return date < todayIST || date > maxDate;
                      }}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        setValue(formatDate(selectedDate));
                        setFormData((prev) => ({
                          ...prev,
                          returnDate: selectedDate
                            ? selectedDate.toISOString().split("T")[0]
                            : "",
                        }));
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors.returnDate && (
                <p className="text-sm text-destructive">{errors.returnDate}</p>
              )}
            </div>

            {/* Purpose */}
            <TextInput
              title="Purpose of Use"
              description="Describe how you plan to use this asset. Include project details, course requirements, or event information."
              placeholder="e.g., Final year project photography, Technical fest documentation, Course assignment..."
              isParagraph
              isRequired
              value={formData.purpose}
              onChange={(value) => {
                if (value.length <= 300) {
                  setFormData((prev) => ({ ...prev, purpose: value }));
                }
              }}
              errorMessage={errors.purpose}
            />
            <div className="flex justify-end text-sm text-muted-foreground -mt-4">
              <span>{formData.purpose.length}/300</span>
            </div>

            {/* Phone Number */}
            <PhoneInput
              title="Contact Number"
              description={isLoadingPhone ? "Fetching your contact number..." : "Your registered contact number for communication regarding your request."}
              placeholder="9876543210"
              isRequired
              value={formData.phoneNumber}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, phoneNumber: value }))
              }
              errorMessage={errors.phoneNumber}
            />

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
                    <p className="font-medium">{asset.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{asset.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Return Date:</span>
                    <p className="font-medium">
                      {value || "Not specified"}
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

              {/* Agreement Checkbox */}
              <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
                <CheckboxComponent
                  title="I agree to the terms and conditions outlined above"
                  isRequired
                  value={formData.agreedToTerms}
                  onChange={(checked) =>
                    setFormData((prev) => ({ ...prev, agreedToTerms: checked }))
                  }
                  errorMessage={errors.agreedToTerms}
                />
              </div>

              {/* Contact Information */}
              <div className="text-center space-y-2 pt-4">
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

            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.returnDate ||
                  !formData.purpose.trim() ||
                  formData.phoneNumber.length !== 10 ||
                  !formData.agreedToTerms
                }
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Submitting...' : 'Request Asset'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}