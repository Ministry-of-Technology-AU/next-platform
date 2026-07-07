"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";

import { MultiUserCombobox } from "@/components/ui/multi-user-combobox"

import {
  FormContainer,
  SingleSelect,
  TextInput,
  SubmitButton,
  CheckboxComponent,
  RichTextInput,
  DateTimePicker,
} from "@/components/form";
import { toast } from "sonner";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function OrganisationProfileClient({
  organisation,
  users,
}: {
  organisation: any;
  users: any[];
}) {

  // ================= STATE (Initialized from server props) =================

  const [organisationId] = useState<number | null>(organisation?.id || null);

  const [bannerSrc, setBannerSrc] = useState<string | null>(
    organisation?.banner_url
      ? organisation.banner_url
      : null
  );
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [clubImage, setClubImage] = useState<string | null>(null);

  const [orgName, setOrgName] = useState(organisation?.name || "");
  const [type, setType] = useState(organisation?.type || "");
  const [tagline, setTagline] = useState(
    organisation?.short_description || ""
  );
  const [deadline, setDeadline] = useState(
    organisation?.induction_end || ""
  );
  const [description, setDescription] = useState(
    organisation?.description || ""
  );
  const [info, setInfo] = useState(
    organisation?.induction_description || ""
  );
  const [instagram, setInstagram] = useState(
    organisation?.instagram || ""
  );
  const [linkedin, setLinkedin] = useState(
    organisation?.linkedin || ""
  );
  const [website, setWebsite] = useState(
    organisation?.website_blog || ""
  );
  const [twitter, setTwitter] = useState(
    organisation?.twitter || ""
  );

  const [circle1, setCircle1] = useState<string[]>(
    organisation?.circle1_humans?.map((u: any) => String(u.id)) || []
  );

  const [circle2, setCircle2] = useState<string[]>(
    organisation?.circle2_humans?.map((u: { id: number }) => String(u.id)) || []
  );

  const [membersDrop, setMembersDrop] = useState<string[]>(
    organisation?.members?.map((u: any) => String(u.id)) || []
  );

  const [isOpen, setIsOpen] = useState(
    organisation?.induction || false
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================= UPDATE =================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!organisationId) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
    formData.append("organisationId", String(organisationId));
    formData.append("name", orgName);
    formData.append("type", type);
    formData.append("short_description", tagline);
    formData.append("description", description);
    formData.append("induction_end", deadline);
    formData.append("induction_description", info);
    formData.append("instagram", instagram);
    formData.append("linkedin", linkedin);
    formData.append("website_blog", website);
    formData.append("twitter", twitter);
    formData.append("circle1_humans", JSON.stringify(circle1.map((id) => Number(id))));
    formData.append("circle2_humans", JSON.stringify(circle2.map((id) => Number(id))));
    formData.append("members", JSON.stringify(membersDrop.map((id) => Number(id))));
    formData.append("induction", String(isOpen));

    if (bannerFile) {
      formData.append("image", bannerFile);
    }

      const response = await fetch('/api/organisations/profile', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        toast.success("Organisation updated successfully!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to update organisation.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f6f4f1] dark:bg-neutral-900 w-full flex flex-col items-center py-10">

      {/* HEADER */}
      <div className="w-full max-w-6xl px-4">
        <div className="relative">

          <div className="relative h-44 sm:h-56 rounded-3xl bg-gradient-to-r from-[#7b1f17] to-[#9c2a1f] z-0 pb-14">

            {bannerSrc && (
              <Image
                src={bannerSrc}
                alt="Banner"
                fill
                className="object-cover rounded-3xl"
              />
            )}

            {/* ✏️ Banner Edit Button */}
            <label className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-full text-sm cursor-pointer z-10 transition">
              ✎
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setBannerSrc(URL.createObjectURL(e.target.files[0]));
                    setBannerFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>

            {/* PROFILE IMAGE OVERLAP */}
            <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 z-20">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl bg-white dark:bg-neutral-800 flex items-center justify-center relative">

                {clubImage ? (
                  <img
                    src={clubImage}
                    alt="Club Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-sm text-gray-500">No Image</div>
                )}



              </div>
            </div>

          </div>
          <div className="mt-14 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {orgName || "Organisation"}
            </h1>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              {tagline}
            </p>

            <div className="flex justify-center gap-3 mt-2 flex-wrap">
              <span className="px-4 py-1 border rounded-full text-sm bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-neutral-700">
                Members: {membersDrop.length}
              </span>

              <span className="px-4 py-1 border rounded-full text-sm bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-neutral-700">
                Ads: 0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <Card className="mt-6 w-full max-w-6xl bg-[#faf8f6] dark:bg-neutral-800 rounded-3xl border border-gray-300 dark:border-neutral-700">
        <CardHeader />
        <CardContent>
          <FormContainer onSubmit={handleSubmit} className="space-y-6">

            <SingleSelect
              title="Type"
              placeholder="Select a type"
              items={[
                { value: "ministry", label: "Ministry" },
                { value: "club", label: "Club" },
                { value: "society", label: "Society" },
                { value: "fest", label: "Fest" },
                { value: "collective", label: "Collective" },
                { value: "iso", label: "ISO" },
                { value: "league", label: "League" },
                { value: "other", label: "Other" },
              ]}
              value={type}
              onChange={setType}
            />

            <TextInput
              title="Tagline"
              placeholder="Enter tagline"
              value={tagline}
              onChange={setTagline}
            />
            <RichTextInput
              title="Organisation Description"
              placeholder="Type description here"
              value={description}
              onChange={setDescription}
            />
            {/* Circle 1 */}
            <div className="space-y-2">
              <MultiUserCombobox
                label="Circle 1"
                options={users?.map((user) => ({ id: String(user.id), label: user.username })) || []}
                value={circle1}
                onChange={(newCircle1) => setCircle1(newCircle1)}
              />
            </div>
            {/* Circle 2 */}
            <div className="space-y-2">
              <MultiUserCombobox
                label="Circle 2"
                options={users?.map((user) => ({ id: String(user.id), label: user.username })) || []}
                value={circle2}
                onChange={(newCircle2) => setCircle2(newCircle2)}
              />
            </div>
            {/* Members */}
            <div className="space-y-2">
              <MultiUserCombobox
                label="Members"
                options={users?.map((user) => ({ id: String(user.id), label: user.username })) || []}
                value={membersDrop}
                onChange={(newMembersDrop) => setMembersDrop(newMembersDrop)}
              />
            </div>

            <CheckboxComponent
              title="Inductions Open?"
              description="Toggle if inductions are open"
              value={isOpen}
              onChange={(checked: boolean | string) => setIsOpen(Boolean(checked))}
            />

            <DateTimePicker
              title="Deadline"
              placeholder="Select deadline"
              value={deadline}
              onChange={setDeadline}
            />

            <RichTextInput
              title="Induction Information"
              placeholder=""
              value={info}
              onChange={setInfo}
            />

            <TextInput
              title="Instagram"
              placeholder="https://instagram.com/yourclub"
              value={instagram}
              onChange={setInstagram}
            />

            <TextInput
              title="LinkedIn"
              placeholder="https://linkedin.com/company/yourclub"
              value={linkedin}
              onChange={setLinkedin}
            />

            <TextInput
              title="Website"
              placeholder="https://yourwebsite.com"
              value={website}
              onChange={setWebsite}
            />

            <TextInput
              title="Twitter"
              placeholder="https://twitter.com/yourclub"
              value={twitter}
              onChange={setTwitter}
            />


            <SubmitButton text="Save Changes" isLoading={isSubmitting} />

          </FormContainer>
        </CardContent>
      </Card>
    </div>
  );
}
