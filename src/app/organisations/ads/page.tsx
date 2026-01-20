"use client";

import { useState } from "react";
import PlatformCarousel from "@/components/landing-page/platform-carousel";
import { Advertisement, ButtonVariant, BannerButton } from "@/components/landing-page/data/types";
import {
    TextInput,
    SubmitButton,
    ImageUpload,
    InstructionsField
} from "@/components/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, X, Settings2, Megaphone } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Mock initial data
const INITIAL_ADS: Advertisement[] = [
    {
        id: 1,
        attributes: {
            isActive: true,
            order: 1,
            title: "Welcome to Ministry of Technology",
            subtitle: "Innovation & Excellence",
            description: "Join us in building the future of technology.",
            banner_image: {
                data: [{ attributes: { url: "/placeholder-banner-1.jpg" } }]
            },
            gradient: "",
            buttons: [
                {
                    children: "Explore",
                    url: "https://",
                    variant: "default" as ButtonVariant,
                    className: "bg-[#ffffff] text-[#000000]",
                    style: { borderRadius: "4px", opacity: 1 }
                }
            ]
        }
    }
];

export default function AdsManagementPage() {
    const [ads, setAds] = useState<Advertisement[]>(INITIAL_ADS);
    const [activeAdIndex, setActiveAdIndex] = useState(0);

    // Helper to update current ad
    const updateCurrentAd = (updates: Partial<Advertisement['attributes']>) => {
        const newAds = [...ads];
        newAds[activeAdIndex] = {
            ...newAds[activeAdIndex],
            attributes: {
                ...newAds[activeAdIndex].attributes,
                ...updates
            }
        };
        setAds(newAds);
    };

    // Helper to update a specific button
    const updateButton = (index: number, updates: Partial<BannerButton>) => {
        const currentButtons = [...(ads[activeAdIndex].attributes.buttons || [])];
        // Properly merge to ensure all properties are updated
        currentButtons[index] = {
            ...currentButtons[index],
            ...updates,
            // Ensure style object is properly merged
            style: updates.style ? { ...currentButtons[index].style, ...updates.style } : currentButtons[index].style
        };
        updateCurrentAd({ buttons: currentButtons });
    };

    const addButton = () => {
        const currentButtons = [...(ads[activeAdIndex].attributes.buttons || [])];
        if (currentButtons.length < 2) {
            currentButtons.push({
                children: "New Button",
                url: "https://",
                variant: "default" as ButtonVariant,
                className: "",
                style: { borderRadius: "4px", opacity: 1 }
            });
            updateCurrentAd({ buttons: currentButtons });
        }
    };

    const removeButton = (index: number) => {
        const currentButtons = [...(ads[activeAdIndex].attributes.buttons || [])];
        currentButtons.splice(index, 1);
        updateCurrentAd({ buttons: currentButtons });
    };

    const createNewAd = () => {
        const newAd: Advertisement = {
            id: Date.now(),
            attributes: {
                isActive: true,
                order: ads.length + 1,
                title: "New Ad Title",
                subtitle: "Subtitle",
                description: "Enter description here",
                banner_image: {
                    data: [{ attributes: { url: "" } }]
                },
                gradient: "from-transparent to-transparent",
                buttons: []
            }
        };
        setAds([...ads, newAd]);
        setActiveAdIndex(ads.length);
    };

    const deleteCurrentAd = () => {
        const newAds = ads.filter((_, i) => i !== activeAdIndex);
        setAds(newAds);
        setActiveAdIndex(Math.max(0, activeAdIndex - 1));
    };

    // Helper to extract colors from className and style
    const extractBgColor = (className: string = ""): string => {
        const match = className.match(/bg-\[#([A-Fa-f0-9]+)\]/);
        return match ? `#${match[1]}` : "#ffffff";
    };

    const extractTextColor = (className: string = ""): string => {
        const match = className.match(/text-\[#([A-Fa-f0-9]+)\]/);
        return match ? `#${match[1]}` : "#000000";
    };

    const extractBorderColor = (className: string = ""): string => {
        const match = className.match(/border-\[#([A-Fa-f0-9]+)\]/);
        return match ? `#${match[1]}` : "#000000";
    };

    const extractHoverBgColor = (style: any): string => {
        return style?.['--hover-bg'] || "#333333";
    };

    // Helper to update button colors based on variant
    const updateButtonColors = (btnIndex: number, updates: {
        bgColor?: string;
        textColor?: string;
        borderColor?: string;
        hoverBgColor?: string;
    }) => {
        const currentButtons = [...(ads[activeAdIndex].attributes.buttons || [])];
        const btn = currentButtons[btnIndex];
        const variant = btn.variant || "default";

        // Remove old color classes
        let className = (btn.className || "")
            .replace(/bg-\[#[A-Fa-f0-9]+\]/g, "")
            .replace(/text-\[#[A-Fa-f0-9]+\]/g, "")
            .replace(/border-\[#[A-Fa-f0-9]+\]/g, "")
            .replace(/border/g, "")
            .trim();

        // Apply colors based on variant
        if (variant === "outline") {
            // Outline: border and text color only, no background
            if (updates.borderColor) className += ` border border-[${updates.borderColor}]`;
            if (updates.textColor) className += ` text-[${updates.textColor}]`;
        } else if (variant === "ghost" || variant === "animatedGhost" || variant === "link") {
            // Ghost/Link: text color only, no background or border
            if (updates.textColor) className += ` text-[${updates.textColor}]`;
        } else {
            // Default/other variants: background, text, and optional border
            if (updates.bgColor) className += ` bg-[${updates.bgColor}]`;
            if (updates.textColor) className += ` text-[${updates.textColor}]`;
            if (updates.borderColor) className += ` border border-[${updates.borderColor}]`;
        }

        className = className.trim();

        // Handle hover color via CSS variable
        const newStyle = { ...btn.style };
        if (updates.hoverBgColor) {
            newStyle['--hover-bg'] = updates.hoverBgColor;
        }

        updateButton(btnIndex, { className, style: newStyle });
    };

    if (ads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                <h2 className="text-2xl font-bold mb-4">No Ads Created</h2>
                <Button onClick={createNewAd}>Create First Ad</Button>
            </div>
        )
    }

    const currentAd = ads[activeAdIndex];

    return (
        <div className="container max-w-7xl mx-auto space-y-8">

            <Card className="min-h-[800px] shadow-sm border-2">
                <CardContent className="p-8 space-y-10">
                    {/* Instructions */}
                    <InstructionsField
                        heading="Banner Upload Guidelines"
                        body={[
                            "Recommended image dimensions: 1200x720 pixels (16:7 aspect ratio)",
                            "Supported formats: JPG, PNG, WebP",
                            "Maximum file size: 5MB",
                            "Ensure text overlays are readable - test with the gradient overlay",
                            "High contrast images work best with text overlays",
                            "The title, description and subtitle are necessarily going to be white in colour, so choose your image accordingly"
                        ]}
                    />

                    {/* Top Section: Carousel Preview */}
                    <div className="flex flex-col items-center space-y-4">
                        <PlatformCarousel
                            adverts={ads}
                            autoPlay={false}
                            manualSlide={activeAdIndex}
                            onSlideChange={setActiveAdIndex}
                            className="w-full"
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={createNewAd}><Plus className="w-4 h-4 mr-2" /> Add New Slide</Button>
                        </div>
                    </div>

                    {/* Bottom Section: Editor */}
                    <div className="space-y-6 max-w-4xl mx-auto">

                        {/* Tagline */}
                        <div className="grid grid-cols-[100px_1fr_auto] gap-4 items-center">
                            <Label className="text-base font-semibold">Tagline</Label>
                            <TextInput
                                title=""
                                placeholder="Enter title text..."
                                value={currentAd.attributes.title}
                                onChange={(val) => updateCurrentAd({ title: val })}
                                className="w-full"
                            />
                            <Button variant="ghost" size="icon" className="text-muted-foreground"><Edit2 className="w-4 h-4" /></Button>
                        </div>

                        {/* Subtitle */}
                        <div className="grid grid-cols-[100px_1fr_auto] gap-4 items-center">
                            <Label className="text-base font-semibold">Subtitle</Label>
                            <TextInput
                                title=""
                                placeholder="Enter subtitle text..."
                                value={currentAd.attributes.subtitle}
                                onChange={(val) => updateCurrentAd({ subtitle: val })}
                                className="w-full"
                            />
                            <Button variant="ghost" size="icon" className="text-muted-foreground"><Edit2 className="w-4 h-4" /></Button>
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-[100px_1fr_auto] gap-4 items-start">
                            <Label className="text-base font-semibold mt-2">Description</Label>
                            <TextInput
                                title=""
                                placeholder="Enter description text..."
                                value={currentAd.attributes.description}
                                onChange={(val) => updateCurrentAd({ description: val })}
                                className="w-full"
                            />
                            <Button variant="ghost" size="icon" className="text-muted-foreground mt-2"><Edit2 className="w-4 h-4" /></Button>
                        </div>

                        {/* Gradient */}
                        {/* <div className="grid grid-cols-[100px_1fr_auto] gap-4 items-center">
                            <Label className="text-base font-semibold">Gradient</Label>
                            <TextInput
                                title=""
                                placeholder="e.g., from-black/80 via-black/50 to-transparent"
                                value={currentAd.attributes.gradient}
                                onChange={(val) => updateCurrentAd({ gradient: val })}
                                className="w-full"
                            />
                            <Button variant="ghost" size="icon" className="text-muted-foreground"><Edit2 className="w-4 h-4" /></Button>
                        </div> */}

                        {/* Buttons */}
                        {currentAd.attributes.buttons?.map((btn: BannerButton, idx: number) => {
                            const variant = btn.variant || "default";
                            const bgColor = extractBgColor(btn.className);
                            const textColor = extractTextColor(btn.className);
                            const borderColor = extractBorderColor(btn.className);
                            const hoverBgColor = extractHoverBgColor(btn.style);

                            // Determine which color controls to show based on variant
                            const showBgColor = variant !== "outline" && variant !== "ghost" && variant !== "animatedGhost" && variant !== "link";
                            const showBorderColor = variant === "outline" || variant === "default" || variant === "secondary" || variant === "animated";
                            const showHoverBg = variant !== "ghost" && variant !== "animatedGhost" && variant !== "link";

                            return (
                                <div key={idx} className="grid grid-cols-[100px_1fr_1fr_auto] gap-4 items-center">
                                    <Label className="text-base font-semibold">Button {idx + 1}</Label>

                                    {/* Button Text */}
                                    <div className="relative">
                                        <Input
                                            value={String(btn.children)}
                                            onChange={(e) => updateButton(idx, { children: e.target.value })}
                                            placeholder="Button Text"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            {/* Customization Popover */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Settings2 className="w-4 h-4 text-blue-500" /></Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 space-y-4 p-4">
                                                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                                                        <h4 className="font-semibold">Button {idx + 1} Customization</h4>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Variant</Label>
                                                        <Select
                                                            value={btn.variant || "default"}
                                                            onValueChange={(val) => updateButton(idx, { variant: val as ButtonVariant })}
                                                        >
                                                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="default">Default</SelectItem>
                                                                <SelectItem value="outline">Outline</SelectItem>
                                                                <SelectItem value="secondary">Secondary</SelectItem>
                                                                <SelectItem value="ghost">Ghost</SelectItem>
                                                                <SelectItem value="link">Link</SelectItem>
                                                                <SelectItem value="animated">Animated</SelectItem>
                                                                <SelectItem value="animatedGhost">Animated Ghost</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Colors */}
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Colors</Label>
                                                        <div className="grid gap-2" style={{ gridTemplateColumns: showBgColor && showBorderColor ? '1fr 1fr' : '1fr' }}>
                                                            {/* Text Color - always shown */}
                                                            <div className="space-y-1">
                                                                <Label className="text-xs text-muted-foreground">Text</Label>
                                                                <Input
                                                                    type="color"
                                                                    value={textColor}
                                                                    onChange={(e) => updateButtonColors(idx, { textColor: e.target.value })}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>

                                                            {/* Background Color - only for non-outline, non-ghost */}
                                                            {showBgColor && (
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-muted-foreground">Background</Label>
                                                                    <Input
                                                                        type="color"
                                                                        value={bgColor}
                                                                        onChange={(e) => updateButtonColors(idx, { bgColor: e.target.value })}
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Border Color - for outline and optionally others */}
                                                            {showBorderColor && (
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-muted-foreground">Border</Label>
                                                                    <Input
                                                                        type="color"
                                                                        value={borderColor}
                                                                        onChange={(e) => updateButtonColors(idx, { borderColor: e.target.value })}
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Hover Background Color */}
                                                        {showHoverBg && (
                                                            <div className="space-y-1 pt-2 border-t">
                                                                <Label className="text-xs text-muted-foreground">Hover Background</Label>
                                                                <Input
                                                                    type="color"
                                                                    value={hoverBgColor}
                                                                    onChange={(e) => updateButtonColors(idx, { hoverBgColor: e.target.value })}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Radius */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label className="text-xs">Radius</Label>
                                                            <span className="text-xs text-muted-foreground">{btn.style?.borderRadius || '4px'}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="20"
                                                            value={parseInt(String(btn.style?.borderRadius || '4px').replace('px', '')) || 4}
                                                            onChange={(e) => updateButton(idx, {
                                                                style: { ...btn.style, borderRadius: `${e.target.value}px` }
                                                            })}
                                                            className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                        />
                                                    </div>
                                                    {/* Opacity */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label className="text-xs">Opacity</Label>
                                                            <span className="text-xs text-muted-foreground">{Math.round(((btn.style?.opacity as number) || 1) * 100)}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={((btn.style?.opacity as number) || 1) * 100}
                                                            onChange={(e) => updateButton(idx, {
                                                                style: { ...btn.style, opacity: Number(e.target.value) / 100 }
                                                            })}
                                                            className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                        />
                                                    </div>

                                                </PopoverContent>
                                            </Popover>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeButton(idx)}><X className="w-4 h-4" /></Button>
                                        </div>
                                    </div>

                                    {/* Button Link */}
                                    <div className="relative">
                                        <Label className="absolute -top-5 left-0 text-xs text-muted-foreground">Link {idx + 1}</Label>
                                        <Input
                                            value={btn.url || ""}
                                            onChange={(e) => updateButton(idx, { url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Button Cta */}
                        {(currentAd.attributes.buttons?.length || 0) < 2 && (
                            <div className="flex justify-start pl-[116px]">
                                <Button variant="outline" size="sm" onClick={addButton}><Plus className="w-4 h-4 mr-2" /> Add Button</Button>
                            </div>
                        )}

                        {/* Main Image Upload - Placing it clearly */}
                        <div className="grid grid-cols-[100px_1fr] gap-4 items-start pt-4 border-t">
                            <Label className="text-base font-semibold mt-2">Banner</Label>
                            <ImageUpload
                                title=""
                                value={[]}
                                description="Upload the main banner image (1600x700 recommended)"
                                onChange={(files) => {
                                    if (files.length > 0) {
                                        const url = URL.createObjectURL(files[0]);
                                        updateCurrentAd({
                                            banner_image: {
                                                data: [{ attributes: { url } }]
                                            }
                                        });
                                    }
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-2 justify-end">
                            <Button className="bg-green hover:bg-emerald-700 min-w-[120px]" onClick={() => toast.success("Ad Submitted Successfully")}>Submit</Button>
                            <Button className="bg-blue hover:bg-blue-800 min-w-[120px]" onClick={() => toast.success("Ad Saved")}>Save</Button>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="bg-red-800 hover:bg-red-900 min-w-[120px]">Delete</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you sure you want to delete this ad?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete the advertisement from the platform.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button onClick={deleteCurrentAd} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}