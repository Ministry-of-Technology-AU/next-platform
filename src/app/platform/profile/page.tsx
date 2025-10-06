"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UserRound, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/form";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsContents } from "@/components/ui/shadcn-io/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { UserData, validatePhoneNumber as validatePhone, ProfileApiResponse } from "./types";
import PageTitle from "@/components/page-title";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      if (status === "loading") return;
      
      if (!session?.user?.email) {
        setError("No user session found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/platform/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch profile');
        }
        
        setUserData(result.data);
        setPhoneNumber(result.data.phone_number || "");
        setError(null);
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [session, status]);

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setHasChanges(value !== (userData?.phone_number || ""));
    
    // Clear phone error when user starts typing
    if (phoneError) {
      setPhoneError(null);
    }
  };

  // Custom validation wrapper for component
  const phoneValidationWrapper = (phone: string): string | null => {
    const validation = validatePhone(phone);
    return validation.isValid ? null : (validation.error || null);
  };

  // Custom validation for Indian phone numbers
  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone) return null; // Empty is allowed
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return "Phone number must be exactly 10 digits";
    }
    if (!/^[6-9]/.test(cleaned)) {
      return "Phone number must start with 6, 7, 8, or 9";
    }
    return null;
  };

  const handleSave = async () => {
    // Validate phone number before saving
    const validation = validatePhone(phoneNumber);
    if (!validation.isValid) {
      setPhoneError(validation.error || "Invalid phone number");
      return;
    }

    try {
      setIsSaving(true);
      setPhoneError(null);
      
      const response = await fetch('/api/platform/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to save phone number');
      }
      
      setUserData(prev => prev ? { ...prev, phone_number: phoneNumber } : null);
      setHasChanges(false);
      console.log('[PROFILE] Phone number saved successfully');
      
      // Show success toast
      toast.success("Phone number saved successfully!", {
        description: "Your profile has been updated.",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error saving phone number:", err);
      setPhoneError("Failed to save phone number. Please try again.");
      
      // Show error toast
      toast.error("Failed to save phone number", {
        description: "Please check your connection and try again.",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
              <p className="text-muted-foreground">{error || "Failed to load profile"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageTitle text="My Profile" subheading="View all your profile details here!" icon={UserRound} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="flex flex-col items-center justify-center p-8 lg:p-12">
            <CardContent className="flex flex-col items-center space-y-6 pt-6">
              <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80">
                <Image
                  src={userData.profile_image || "/default-avatar.png"}
                  alt={userData.username || "User"}
                  fill
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {userData.username || "No name found"}
                </h2>
                {userData.verified && (
                  <p className="text-sm text-muted-foreground">Verified User</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={userData.email || "No details found"}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Name</Label>
                  <Input
                    id="username"
                    value={userData.username || "No details found"}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Input
                    id="batch"
                    value={userData.batch || "No details found"}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <PhoneInput
                  title="Phone Number"
                  description="Enter your 10-digit mobile number"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  errorMessage={phoneError || undefined}
                  validateOnChange={false}
                  customValidation={phoneValidationWrapper}
                />

                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving || !!phoneError}
                  className="w-full"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <Tabs defaultValue="deactivate" className="w-full">
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="deactivate">Deactivate Account</TabsTrigger>
                    <TabsTrigger value="linked">Linked Account</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContents>
                  <TabsContent value="deactivate" className="space-y-4 mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Before you go:</h3>
                        <p className="text-sm text-muted-foreground">
                          Take backup of your data. Account deletion is final. There will be no way to restore your account.
                        </p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="delete-confirm"
                          checked={deleteConfirm}
                          onCheckedChange={(checked) => setDeleteConfirm(checked as boolean)}
                        />
                        <Label
                          htmlFor="delete-confirm"
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Yes, I would like to delete my account!
                        </Label>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          variant="destructive"
                          disabled={!deleteConfirm}
                          className="flex-1"
                        >
                          Permanently Delete
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                        >
                          Keep my account
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="linked" className="mt-0">
                    <div className="py-8 text-center text-muted-foreground">
                      <p>No linked accounts found.</p>
                    </div>
                  </TabsContent>
                  </TabsContents>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
