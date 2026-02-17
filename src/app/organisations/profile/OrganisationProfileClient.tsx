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
} from "@/components/form";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { strapiPut } from "@/lib/apis/strapi";

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
    organisation?.banner?.url
      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${organisation.banner.url}`
      : null
  );

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

  // ================= UPDATE =================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!organisationId) return;

    const formData = {
      organisationId,
      name: orgName,
      type,
      short_description: tagline,
      description,
      induction_end: deadline,
      induction_description: info,
      instagram,
      linkedin,
      website_blog: website,
      twitter,
      circle1_humans: circle1.map((id) => Number(id)),
      circle2_humans: circle2.map((id) => Number(id)),
      members: membersDrop.map((id) => Number(id)),      
      induction: isOpen,
    };
    
    const response = await fetch('/api/organisations/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Organisation updated successfully!");
    } else {
      alert("Failed to update organisation.");
    }
  };

  return (
    <div className="bg-[#f6f4f1] dark:bg-neutral-900 min-h-screen flex flex-col items-center py-10">

      {/* HEADER */}
      <div className="w-full max-w-6xl px-4">
        <div className="relative">

          <div className="relative h-44 sm:h-56 rounded-3xl bg-gradient-to-r from-[#7b1f17] to-[#9c2a1f] z-0 pb-14">

            {bannerSrc && (
              <Image
                src={bannerSrc}
                alt="Banner"
                fill
                className="object-cover"
              />
            )}

            {/* ✏️ Banner Edit Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-full text-sm">
                  ✎
                </button>
              </PopoverTrigger>

              <PopoverContent className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-xl space-y-4 w-80">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                  Edit Cover Image
                </h2>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-700 
                        bg-white dark:bg-neutral-800 
                        text-gray-800 dark:text-gray-200
                        hover:bg-gray-100 dark:hover:bg-neutral-700
                        text-sm transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setBannerSrc(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {bannerSrc ? "Selected" : "No file chosen"}
                  </span>
                </div>
              </PopoverContent>
            </Popover>

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

                {/* Optional profile image upload overlay */}
                <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 bg-black/40 flex items-center justify-center text-white text-xs transition">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setClubImage(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="hidden"
                  />
                </label>

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
            <TextInput
              title="Organisation Description"
              placeholder="Type description here"
              isParagraph
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

            <TextInput
              title="Deadline"
              type="datetime-local"
              placeholder="Select deadline"
              value={deadline}
              onChange={setDeadline}
            />

            <TextInput
              title="Induction Information"
              placeholder="Type information here"
              isParagraph
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


            <SubmitButton text="Save Changes" />

          </FormContainer>
        </CardContent>
      </Card>

    </div>
  );
}
