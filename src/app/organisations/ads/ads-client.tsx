"use client";

import { useState, useEffect } from "react";
import PlatformCarousel from "@/components/landing-page/platform-carousel";
import { Advertisement, ButtonVariant, BannerButton, TextStyle } from "@/components/landing-page/data/types";
import {
    TextInput,
    ImageUpload,
    InstructionsField,
    DatePicker,
} from "@/components/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Settings2, Loader2, Trash2, AlertTriangle, Palette } from "lucide-react";
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


// ─── Constants ───────────────────────────────────────────────
const MOCK_AD_TEMPLATE: Advertisement = {
    id: 0,
    attributes: {
        order: 1,
        title: "Create an Ad!",
        subtitle: "Make sure you read the guidelines!",
        description: "This is exactly how your ad will look",
        banner_url: "/placeholder-banner-1.jpg",
        gradient: "",
        buttons: [
            {
                children: "Sample Button",
                url: "https://",
                variant: "default" as ButtonVariant,
                className: "",
                style: { borderRadius: "4px", opacity: 1 }
            }
        ],
        start_date: new Date().toISOString().split('T')[0],
        title_style: { color: "#ffffff", fontWeight: "800" },
        subtitle_style: { color: "#ffffff", fontWeight: "700" },
        description_style: { color: "#ffffff", fontWeight: "400" },
    }
};

const GRADIENT_DIRECTIONS = [
    { value: "to-r", label: "→ Right" },
    { value: "to-l", label: "← Left" },
    { value: "to-t", label: "↑ Top" },
    { value: "to-b", label: "↓ Bottom" },
    { value: "to-br", label: "↘ Bottom Right" },
    { value: "to-bl", label: "↙ Bottom Left" },
    { value: "to-tr", label: "↗ Top Right" },
    { value: "to-tl", label: "↖ Top Left" },
];

const FONT_WEIGHT_OPTIONS = [
    { value: "400", label: "Normal" },
    { value: "500", label: "Medium" },
    { value: "600", label: "Semibold" },
    { value: "700", label: "Bold" },
    { value: "800", label: "Extrabold" },
    { value: "900", label: "Black" },
];

// ─── Helpers ─────────────────────────────────────────────────
/** Convert hex+opacity to a Tailwind-esque gradient class string */
function buildGradientString(from: string, fromOpacity: number, via: string, viaOpacity: number, to: string, toOpacity: number, direction: string): string {
    // We store the gradient as a tailwind class string that platform-carousel applies
    // e.g. "from-black/80 via-black/40 to-transparent"
    const hexToTW = (hex: string, opacity: number) => {
        if (opacity <= 0) return 'transparent';
        const opacityPct = Math.round(opacity * 100);
        // Use bracket syntax for arbitrary hex colors
        if (hex === '#000000') return opacityPct === 100 ? 'black' : `black/${opacityPct}`;
        if (hex === '#ffffff') return opacityPct === 100 ? 'white' : `white/${opacityPct}`;
        return opacityPct === 100 ? `[${hex}]` : `[${hex}]/${opacityPct}`;
    };

    const parts = [`${direction}`];

    const fromPart = hexToTW(from, fromOpacity);
    parts.unshift(`from-${fromPart}`);

    if (via && viaOpacity > 0) {
        const viaPart = hexToTW(via, viaOpacity);
        parts.push(`via-${viaPart}`);
    }

    const toPart = hexToTW(to, toOpacity);
    parts.push(`to-${toPart}`);

    return parts.join(' ');
}

/** Parse a tailwind gradient string back into component state */
function parseGradientString(gradient: string): {
    from: string; fromOpacity: number;
    via: string; viaOpacity: number;
    to: string; toOpacity: number;
    direction: string;
} {
    const defaults = {
        from: '#000000', fromOpacity: 0.8,
        via: '', viaOpacity: 0,
        to: '#000000', toOpacity: 0,
        direction: 'to-r'
    };

    if (!gradient) return defaults;

    // Extract direction
    const dirMatch = gradient.match(/\b(to-[a-z]{1,2})\b/);
    if (dirMatch) defaults.direction = dirMatch[1];

    // Extract from color
    const fromMatch = gradient.match(/from-(\[#[A-Fa-f0-9]+\]|black|white|transparent)(?:\/(\d+))?/);
    if (fromMatch) {
        defaults.from = fromMatch[1] === 'black' ? '#000000' : fromMatch[1] === 'white' ? '#ffffff' : fromMatch[1] === 'transparent' ? '#000000' : fromMatch[1].replace('[', '').replace(']', '');
        defaults.fromOpacity = fromMatch[1] === 'transparent' ? 0 : (fromMatch[2] ? parseInt(fromMatch[2]) / 100 : 1);
    }

    // Extract via color
    const viaMatch = gradient.match(/via-(\[#[A-Fa-f0-9]+\]|black|white|transparent)(?:\/(\d+))?/);
    if (viaMatch) {
        defaults.via = viaMatch[1] === 'black' ? '#000000' : viaMatch[1] === 'white' ? '#ffffff' : viaMatch[1] === 'transparent' ? '#000000' : viaMatch[1].replace('[', '').replace(']', '');
        defaults.viaOpacity = viaMatch[1] === 'transparent' ? 0 : (viaMatch[2] ? parseInt(viaMatch[2]) / 100 : 1);
    }

    // Extract to color
    const toMatch = gradient.match(/to-(\[#[A-Fa-f0-9]+\]|black|white|transparent)(?:\/(\d+))?/);
    // Filter out direction matches (to-r, to-l, etc.)
    if (toMatch && !toMatch[1].match(/^[a-z]{1,2}$/)) {
        defaults.to = toMatch[1] === 'black' ? '#000000' : toMatch[1] === 'white' ? '#ffffff' : toMatch[1] === 'transparent' ? '#000000' : toMatch[1].replace('[', '').replace(']', '');
        defaults.toOpacity = toMatch[1] === 'transparent' ? 0 : (toMatch[2] ? parseInt(toMatch[2]) / 100 : 1);
    }

    return defaults;
}

const getVariantDefaults = (variant: string) => {
    switch (variant) {
        case "outline":
            return { bg: "#ffffff", text: "#000000", border: "#cccccc" };
        case "secondary":
            return { bg: "#f3f4f6", text: "#1f2937", border: "#e5e7eb" };
        case "ghost":
        case "animatedGhost":
        case "link":
            return { bg: "#ffffff", text: "#000000", border: "" };
        default: // default, animated
            return { bg: "#1f2937", text: "#ffffff", border: "#1f2937" };
    }
};

const extractBgColor = (className: string = ""): string => {
    const match = className.match(/bg-\[#([A-Fa-f0-9]+)\]/);
    return match ? `#${match[1]}` : "";
};

const extractTextColor = (className: string = ""): string => {
    const match = className.match(/text-\[#([A-Fa-f0-9]+)\]/);
    return match ? `#${match[1]}` : "";
};

const extractBorderColor = (className: string = ""): string => {
    const match = className.match(/border-\[#([A-Fa-f0-9]+)\]/);
    return match ? `#${match[1]}` : "";
};

const extractHoverBgColor = (style: any): string => {
    return style?.['--hover-bg'] || "#333333";
};

// ─── Text Style Config Popover ───────────────────────────────
function TextStyleConfig({
    label,
    style,
    onChange
}: {
    label: string;
    style: TextStyle;
    onChange: (style: TextStyle) => void;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                    <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-3 p-4" side="right" align="start">
                <div className="flex justify-between items-center border-b pb-2 mb-1">
                    <h4 className="text-sm font-semibold">{label} Style</h4>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Text Colour</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="color"
                            value={style.color || "#ffffff"}
                            onChange={(e) => onChange({ ...style, color: e.target.value })}
                            className="h-8 w-12 p-1 cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={style.color || "#ffffff"}
                            onChange={(e) => onChange({ ...style, color: e.target.value })}
                            className="h-8 text-xs font-mono flex-1"
                            placeholder="#ffffff"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Font Weight</Label>
                    <Select
                        value={style.fontWeight || "400"}
                        onValueChange={(val) => onChange({ ...style, fontWeight: val })}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FONT_WEIGHT_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    <span style={{ fontWeight: parseInt(opt.value) }}>{opt.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="pt-2 border-t">
                    <p className="text-[10px] text-muted-foreground">Preview on the banner above ↑</p>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ─── Gradient Editor ─────────────────────────────────────────
function GradientEditor({
    gradient,
    onChange
}: {
    gradient: string;
    onChange: (gradient: string) => void;
}) {
    const parsed = parseGradientString(gradient);
    const [from, setFrom] = useState(parsed.from);
    const [fromOpacity, setFromOpacity] = useState(parsed.fromOpacity);
    const [via, setVia] = useState(parsed.via || '#000000');
    const [viaOpacity, setViaOpacity] = useState(parsed.viaOpacity);
    const [to, setTo] = useState(parsed.to);
    const [toOpacity, setToOpacity] = useState(parsed.toOpacity);
    const [direction, setDirection] = useState(parsed.direction);
    const [useVia, setUseVia] = useState(parsed.viaOpacity > 0);

    const update = (
        f = from, fo = fromOpacity, v = via, vo = viaOpacity,
        t = to, too = toOpacity, d = direction, uv = useVia
    ) => {
        onChange(buildGradientString(f, fo, uv ? v : '', uv ? vo : 0, t, too, d));
    };

    // CSS preview gradient
    const toRGBA = (hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${opacity})`;
    };

    const directionToCSS: Record<string, string> = {
        'to-r': 'to right', 'to-l': 'to left', 'to-t': 'to top', 'to-b': 'to bottom',
        'to-br': 'to bottom right', 'to-bl': 'to bottom left', 'to-tr': 'to top right', 'to-tl': 'to top left',
    };

    const stops = useVia
        ? `${toRGBA(from, fromOpacity)}, ${toRGBA(via, viaOpacity)}, ${toRGBA(to, toOpacity)}`
        : `${toRGBA(from, fromOpacity)}, ${toRGBA(to, toOpacity)}`;
    const previewCSS = `linear-gradient(${directionToCSS[direction] || 'to right'}, ${stops})`;

    return (
        <div className="space-y-4">
            {/* Preview bar */}
            <div
                className="h-10 rounded-lg border shadow-inner"
                style={{ background: previewCSS }}
            />

            {/* Direction */}
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Direction</Label>
                <Select
                    value={direction}
                    onValueChange={(val) => { setDirection(val); update(from, fromOpacity, via, viaOpacity, to, toOpacity, val, useVia); }}
                >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {GRADIENT_DIRECTIONS.map(d => (
                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* From */}
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">From</Label>
                <div className="flex gap-2 items-center">
                    <Input
                        type="color" value={from}
                        onChange={(e) => { setFrom(e.target.value); update(e.target.value, fromOpacity, via, viaOpacity, to, toOpacity, direction, useVia); }}
                        className="h-8 w-12 p-1 cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">Opacity</span>
                            <span className="text-[10px] text-muted-foreground">{Math.round(fromOpacity * 100)}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100"
                            value={fromOpacity * 100}
                            onChange={(e) => { const v = Number(e.target.value) / 100; setFromOpacity(v); update(from, v, via, viaOpacity, to, toOpacity, direction, useVia); }}
                            className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>
                </div>
            </div>

            {/* Via toggle + controls */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Middle Stop</Label>
                    <Button
                        variant="ghost" size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => {
                            const next = !useVia;
                            setUseVia(next);
                            update(from, fromOpacity, via, next ? 0.4 : 0, to, toOpacity, direction, next);
                            if (next) setViaOpacity(0.4);
                        }}
                    >
                        {useVia ? 'Remove' : '+ Add'}
                    </Button>
                </div>
                {useVia && (
                    <div className="flex gap-2 items-center">
                        <Input
                            type="color" value={via}
                            onChange={(e) => { setVia(e.target.value); update(from, fromOpacity, e.target.value, viaOpacity, to, toOpacity, direction, useVia); }}
                            className="h-8 w-12 p-1 cursor-pointer"
                        />
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-[10px] text-muted-foreground">Opacity</span>
                                <span className="text-[10px] text-muted-foreground">{Math.round(viaOpacity * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={viaOpacity * 100}
                                onChange={(e) => { const v = Number(e.target.value) / 100; setViaOpacity(v); update(from, fromOpacity, via, v, to, toOpacity, direction, useVia); }}
                                className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* To */}
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">To</Label>
                <div className="flex gap-2 items-center">
                    <Input
                        type="color" value={to}
                        onChange={(e) => { setTo(e.target.value); update(from, fromOpacity, via, viaOpacity, e.target.value, toOpacity, direction, useVia); }}
                        className="h-8 w-12 p-1 cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">Opacity</span>
                            <span className="text-[10px] text-muted-foreground">{Math.round(toOpacity * 100)}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100"
                            value={toOpacity * 100}
                            onChange={(e) => { const v = Number(e.target.value) / 100; setToOpacity(v); update(from, fromOpacity, via, viaOpacity, to, v, direction, useVia); }}
                            className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>
                </div>
            </div>

            {/* Quick presets */}
            <div className="space-y-1.5 pt-2 border-t">
                <Label className="text-xs text-muted-foreground">Quick Presets</Label>
                <div className="grid grid-cols-3 gap-1.5">
                    {[
                        { label: "Dark Left", val: "from-black/80 to-r to-transparent" },
                        { label: "Dark Bottom", val: "from-black/70 to-b to-transparent" },
                        { label: "Cinematic", val: "from-black/90 via-black/40 to-r to-transparent" },
                        { label: "Subtle", val: "from-black/30 to-r to-transparent" },
                        { label: "Full Dark", val: "from-black/60 to-r to-black/60" },
                        { label: "None", val: "" },
                    ].map(preset => (
                        <Button
                            key={preset.label}
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] px-2"
                            onClick={() => {
                                onChange(preset.val);
                                const p = parseGradientString(preset.val);
                                setFrom(p.from); setFromOpacity(p.fromOpacity);
                                setVia(p.via || '#000000'); setViaOpacity(p.viaOpacity);
                                setTo(p.to); setToOpacity(p.toOpacity);
                                setDirection(p.direction);
                                setUseVia(p.viaOpacity > 0);
                            }}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────
interface AdsManagementClientProps {
    initialAds: Advertisement[];
}

export default function AdsManagementClient({ initialAds }: AdsManagementClientProps) {
    const [ads, setAds] = useState<Advertisement[]>(
        initialAds.length > 0 ? initialAds : [MOCK_AD_TEMPLATE]
    );
    const [activeAdIndex, setActiveAdIndex] = useState(0);
    const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showGradient, setShowGradient] = useState(false);

    useEffect(() => {
        localStorage.setItem("ADS_TOUR_SEEN_V1", "true");
    }, []);

    // ─── Ad CRUD helpers ─────────────────────────────────────
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

    const updateButton = (index: number, updates: Partial<BannerButton>) => {
        const currentButtons = [...(ads[activeAdIndex].attributes.buttons || [])];
        currentButtons[index] = {
            ...currentButtons[index],
            ...updates,
            style: updates.style ? { ...currentButtons[index].style, ...updates.style } : currentButtons[index].style
        };
        updateCurrentAd({ buttons: currentButtons });
    };

    const addButton = () => {
        const currentButtons = [...(ads[activeAdIndex].attributes.buttons || [])];
        if (currentButtons.length < 2) {
            currentButtons.push({
                children: "New Button",
                url: "",
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
            id: 0,
            attributes: {
                order: ads.length + 1,
                title: "",
                subtitle: "",
                description: "",
                banner_url: "",
                gradient: "",
                buttons: [],
                start_date: new Date().toISOString().split('T')[0],
                title_style: { color: "#ffffff", fontWeight: "800" },
                subtitle_style: { color: "#ffffff", fontWeight: "700" },
                description_style: { color: "#ffffff", fontWeight: "400" },
            }
        };
        setAds([newAd, ...ads]);
        setActiveAdIndex(0);
        setUploadedImageFile(null);
    };

    const deleteCurrentAd = async () => {
        const currentAd = ads[activeAdIndex];
        const isRealAd = currentAd.id && currentAd.id > 0 && currentAd.id < 10000;

        if (isRealAd) {
            setIsDeleting(true);
            try {
                const response = await fetch('/api/organisations/ads/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: currentAd.id.toString() }),
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to delete ad');
                }

                toast.success("Ad deleted successfully");
            } catch (error) {
                toast.error((error as Error).message || 'Failed to delete ad from server');
                setIsDeleting(false);
                return; // Don't remove from state if server delete failed
            } finally {
                setIsDeleting(false);
            }
        }

        const newAds = ads.filter((_, i) => i !== activeAdIndex);
        setAds(newAds);
        setActiveAdIndex(Math.max(0, activeAdIndex - 1));
        setUploadedImageFile(null);
    };

    // ─── Validation ──────────────────────────────────────────
    const validateForm = (): boolean => {
        const currentAd = ads[activeAdIndex];
        const hasBannerImage = uploadedImageFile ||
            (currentAd.attributes.banner_url && !currentAd.attributes.banner_url.includes('placeholder'));

        if (!hasBannerImage) {
            toast.error("Banner image is required");
            return false;
        }
        return true;
    };

    const normalizeUrl = (url: string): string => {
        if (!url) return '';
        const trimmed = url.trim();
        if (!trimmed) return '';
        // Don't normalize internal paths
        if (trimmed.startsWith('/')) return trimmed;
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
        // Bare paths like "sports" — keep as-is, carousel will handle routing
        if (!trimmed.includes('.') && !trimmed.includes(':')) return trimmed;
        return `https://${trimmed}`;
    };

    // ─── Save / Submit ───────────────────────────────────────
    const buildFormData = (): FormData => {
        const currentAd = ads[activeAdIndex];
        const formData = new FormData();

        if (currentAd.id && currentAd.id > 0) {
            formData.append('id', currentAd.id.toString());
        }
        formData.append('title', currentAd.attributes.title);
        formData.append('subtitle', currentAd.attributes.subtitle);
        formData.append('description', currentAd.attributes.description);
        formData.append('gradient', currentAd.attributes.gradient || '');
        formData.append('order', currentAd.attributes.order?.toString() || '0');

        // Dates
        if (currentAd.attributes.start_date) {
            formData.append('start_date', currentAd.attributes.start_date);
        }
        if (currentAd.attributes.end_date) {
            formData.append('end_date', currentAd.attributes.end_date);
        }

        // Text styles
        if (currentAd.attributes.title_style) {
            formData.append('title_style', JSON.stringify(currentAd.attributes.title_style));
        }
        if (currentAd.attributes.subtitle_style) {
            formData.append('subtitle_style', JSON.stringify(currentAd.attributes.subtitle_style));
        }
        if (currentAd.attributes.description_style) {
            formData.append('description_style', JSON.stringify(currentAd.attributes.description_style));
        }

        // Normalize button URLs
        const normalizedButtons = (currentAd.attributes.buttons || []).map((btn: BannerButton) => ({
            ...btn,
            url: normalizeUrl(btn.url || '')
        }));
        formData.append('buttons', JSON.stringify(normalizedButtons));

        // Image
        if (uploadedImageFile) {
            formData.append('image', uploadedImageFile);
        } else {
            const existingUrl = currentAd.attributes.banner_url;
            if (existingUrl && !existingUrl.includes('placeholder')) {
                formData.append('banner_url', existingUrl);
            }
        }

        return formData;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/organisations/ads/save', {
                method: 'POST',
                body: buildFormData(),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Failed to save ad');

            toast.success("Ad saved successfully as draft");

            if (result.data) {
                const newAds = [...ads];
                newAds[activeAdIndex] = {
                    id: result.data.id,
                    attributes: result.data.attributes
                };
                setAds(newAds);
            }
            setUploadedImageFile(null);
        } catch (error) {
            toast.error((error as Error).message || 'Failed to save ad');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/organisations/ads/submit', {
                method: 'POST',
                body: buildFormData(),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Failed to submit ad');

            toast.success("Ad request submitted. Your request will soon be evaluated by Techmin, and you will hear back soon!");

            if (result.data) {
                const newAds = [...ads];
                newAds[activeAdIndex] = {
                    id: result.data.id,
                    attributes: result.data.attributes
                };
                setAds(newAds);
            }
            setUploadedImageFile(null);
        } catch (error) {
            toast.error((error as Error).message || 'Failed to submit ad');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Button color helpers ────────────────────────────────
    const updateButtonColors = (btnIndex: number, updates: {
        bgColor?: string; textColor?: string; borderColor?: string; hoverBgColor?: string;
    }) => {
        const currentButtons = [...(ads[activeAdIndex].attributes.buttons || [])];
        const btn = currentButtons[btnIndex];
        const variant = btn.variant || "default";

        // Extract current colors (which are either hex strings or empty)
        const currentBgColor = extractBgColor(btn.className);
        const currentTextColor = extractTextColor(btn.className);
        const currentBorderColor = extractBorderColor(btn.className);

        // Keep existing colors if they are not explicitly updated
        const targetBgColor = updates.bgColor !== undefined ? updates.bgColor : currentBgColor;
        const targetTextColor = updates.textColor !== undefined ? updates.textColor : currentTextColor;
        const targetBorderColor = updates.borderColor !== undefined ? updates.borderColor : currentBorderColor;

        let className = (btn.className || "")
            .replace(/bg-\[#[A-Fa-f0-9]+\]/g, "")
            .replace(/text-\[#[A-Fa-f0-9]+\]/g, "")
            .replace(/border-\[#[A-Fa-f0-9]+\]/g, "")
            .replace(/border/g, "")
            .trim();

        if (variant === "outline") {
            if (targetBorderColor) className += ` border border-[${targetBorderColor}]`;
            if (targetTextColor) className += ` text-[${targetTextColor}]`;
        } else if (variant === "ghost" || variant === "animatedGhost" || variant === "link") {
            if (targetTextColor) className += ` text-[${targetTextColor}]`;
        } else {
            if (targetBgColor) className += ` bg-[${targetBgColor}]`;
            if (targetTextColor) className += ` text-[${targetTextColor}]`;
            if (targetBorderColor) className += ` border border-[${targetBorderColor}]`;
        }

        className = className.trim();
        const newStyle = { ...btn.style };
        if (updates.hoverBgColor !== undefined) {
            newStyle['--hover-bg'] = updates.hoverBgColor;
        }

        updateButton(btnIndex, { className, style: newStyle });
    };

    // ─── Inactive check ──────────────────────────────────────
    const isAdInactive = (ad: Advertisement): boolean => {
        return ad.id > 0 && ad.id < 10000 && !ad.attributes.publishedAt;
    };

    // ─── Render ──────────────────────────────────────────────
    if (ads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                <h2 className="text-2xl font-bold mb-4">No Ads Created</h2>
                <Button onClick={createNewAd}>Create First Ad</Button>
            </div>
        );
    }

    const currentAd = ads[activeAdIndex];

    return (
        <div className="container max-w-7xl mx-auto space-y-8">
            <Card className="min-h-[800px] shadow-sm border-2">
                <CardContent className="p-4 sm:p-8 space-y-8">
                    {/* Instructions */}
                    <InstructionsField
                        heading="Banner Upload Guidelines"
                        defaultOpen={true}
                        body={[
                            "Recommended image dimensions: 1600x700 pixels (16:9 aspect ratio)",
                            "Supported formats: JPG, PNG, WebP",
                            "Maximum file size: 10MB",
                            "Ensure text overlays are readable - test with the gradient overlay",
                            "High contrast images work best with text overlays",
                            "Use the text style buttons (🎨) next to title/subtitle/description to change colours and weight",
                            "⚠️ Banner image is mandatory - you cannot save or submit without uploading a banner"
                        ]}
                    />

                    {/* ── Carousel Preview + Inactive indicator ── */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-full max-w-4xl mx-auto">
                            <PlatformCarousel
                                adverts={ads}
                                autoPlay={false}
                                manualSlide={activeAdIndex}
                                onSlideChange={setActiveAdIndex}
                                className="w-full"
                            />
                            {/* Inactive overlay */}
                            {isAdInactive(currentAd) && (
                                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/40 flex items-end justify-center pointer-events-none z-20">
                                    <div className="bg-yellow-900/90 text-yellow-200 px-4 py-2.5 rounded-t-lg flex items-center gap-2 text-xs sm:text-sm font-medium backdrop-blur-sm">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        <span>This ad is either pending approval or has been taken down.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={createNewAd}>
                                <Plus className="w-4 h-4 mr-2" /> Add New Slide
                            </Button>
                        </div>
                    </div>

                    {/* ── Editor ── */}
                    <div className="space-y-6 max-w-4xl mx-auto">

                        {/* Tagline */}
                        <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2 sm:gap-4 items-center">
                            <Label className="text-base font-semibold">Tagline</Label>
                            <div className="flex items-center gap-1">
                                <TextInput
                                    title=""
                                    placeholder="Enter title text..."
                                    value={currentAd.attributes.title}
                                    onChange={(val) => updateCurrentAd({ title: val })}
                                    className="w-full flex-1"
                                />
                                <TextStyleConfig
                                    label="Title"
                                    style={currentAd.attributes.title_style || { color: "#ffffff", fontWeight: "800" }}
                                    onChange={(s) => updateCurrentAd({ title_style: s })}
                                />
                            </div>
                        </div>

                        {/* Subtitle */}
                        <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2 sm:gap-4 items-center">
                            <Label className="text-base font-semibold">Subtitle</Label>
                            <div className="flex items-center gap-1">
                                <TextInput
                                    title=""
                                    placeholder="Enter subtitle text..."
                                    value={currentAd.attributes.subtitle}
                                    onChange={(val) => updateCurrentAd({ subtitle: val })}
                                    className="w-full flex-1"
                                />
                                <TextStyleConfig
                                    label="Subtitle"
                                    style={currentAd.attributes.subtitle_style || { color: "#ffffff", fontWeight: "700" }}
                                    onChange={(s) => updateCurrentAd({ subtitle_style: s })}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2 sm:gap-4 items-start">
                            <Label className="text-base font-semibold mt-2">Description</Label>
                            <div className="flex items-start gap-1">
                                <TextInput
                                    title=""
                                    placeholder="Enter description text..."
                                    value={currentAd.attributes.description}
                                    onChange={(val) => updateCurrentAd({ description: val })}
                                    className="w-full flex-1"
                                />
                                <TextStyleConfig
                                    label="Description"
                                    style={currentAd.attributes.description_style || { color: "#ffffff", fontWeight: "400" }}
                                    onChange={(s) => updateCurrentAd({ description_style: s })}
                                />
                            </div>
                        </div>

                        {/* ── Buttons ── */}
                        {currentAd.attributes.buttons?.map((btn: BannerButton, idx: number) => {
                            const variant = btn.variant || "default";
                            const variantDefaults = getVariantDefaults(variant);
                            const bgColor = extractBgColor(btn.className) || variantDefaults.bg;
                            const textColor = extractTextColor(btn.className) || variantDefaults.text;
                            const borderColor = extractBorderColor(btn.className) || variantDefaults.border;
                            const hoverBgColor = extractHoverBgColor(btn.style);

                            const showBgColor = variant !== "outline" && variant !== "ghost" && variant !== "animatedGhost" && variant !== "link";
                            const showBorderColor = variant === "outline" || variant === "default" || variant === "secondary" || variant === "animated";
                            const showHoverBg = variant !== "ghost" && variant !== "animatedGhost" && variant !== "link";

                            return (
                                <div key={idx} className="space-y-2 p-3 rounded-lg border bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold">Button {idx + 1}</Label>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => removeButton(idx)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Button Text */}
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Label</Label>
                                            <div className="relative">
                                                <Input
                                                    value={String(btn.children)}
                                                    onChange={(e) => updateButton(idx, { children: e.target.value })}
                                                    placeholder="Button Text"
                                                />
                                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6"><Settings2 className="w-3.5 h-3.5 text-blue-500" /></Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80 space-y-4 p-4">
                                                            <div className="flex justify-between items-center border-b pb-2 mb-2">
                                                                <h4 className="font-semibold text-sm">Button {idx + 1} Customization</h4>
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
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs text-muted-foreground">Text</Label>
                                                                        <Input type="color" value={textColor} onChange={(e) => updateButtonColors(idx, { textColor: e.target.value })} className="h-8 text-xs" />
                                                                    </div>
                                                                    {showBgColor && (
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs text-muted-foreground">Background</Label>
                                                                            <Input type="color" value={bgColor} onChange={(e) => updateButtonColors(idx, { bgColor: e.target.value })} className="h-8 text-xs" />
                                                                        </div>
                                                                    )}
                                                                    {showBorderColor && (
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs text-muted-foreground">Border</Label>
                                                                            <Input type="color" value={borderColor} onChange={(e) => updateButtonColors(idx, { borderColor: e.target.value })} className="h-8 text-xs" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {showHoverBg && (
                                                                    <div className="space-y-1 pt-2 border-t">
                                                                        <Label className="text-xs text-muted-foreground">Hover Background</Label>
                                                                        <Input type="color" value={hoverBgColor} onChange={(e) => updateButtonColors(idx, { hoverBgColor: e.target.value })} className="h-8 text-xs" />
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
                                                                    type="range" min="0" max="20"
                                                                    value={parseInt(String(btn.style?.borderRadius || '4px').replace('px', '')) || 4}
                                                                    onChange={(e) => updateButton(idx, { style: { ...btn.style, borderRadius: `${e.target.value}px` } })}
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
                                                                    type="range" min="0" max="100"
                                                                    value={((btn.style?.opacity as number) || 1) * 100}
                                                                    onChange={(e) => updateButton(idx, { style: { ...btn.style, opacity: Number(e.target.value) / 100 } })}
                                                                    className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                                />
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Button Link */}
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Link destination</Label>
                                            <Input
                                                value={btn.url || ""}
                                                onChange={(e) => updateButton(idx, { url: e.target.value })}
                                                placeholder="/sports or https://example.com"
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Use /path for internal pages • Full URL for external links
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Button CTA */}
                        {(currentAd.attributes.buttons?.length || 0) < 2 && (
                            <div className="flex justify-start sm:pl-[116px]">
                                <Button variant="outline" size="sm" onClick={addButton}><Plus className="w-4 h-4 mr-2" /> Add Button</Button>
                            </div>
                        )}

                        {/* ── Gradient Overlay Editor ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2 sm:gap-4 items-start pt-4 border-t">
                            <Label className="text-base font-semibold mt-2">
                                Gradient
                            </Label>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowGradient(!showGradient)}
                                    className="gap-2"
                                >
                                    <Plus className={`w-3.5 h-3.5 transition-transform ${showGradient ? 'rotate-45' : ''}`} />
                                    {showGradient ? 'Hide Gradient Editor' : 'Customise Gradient Overlay'}
                                </Button>
                                {showGradient && (
                                    <GradientEditor
                                        gradient={currentAd.attributes.gradient || ''}
                                        onChange={(val) => updateCurrentAd({ gradient: val })}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ── Date Selectors ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2 sm:gap-4 items-start pt-4 border-t">
                            <Label className="text-base font-semibold mt-2">
                                Dates
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DatePicker
                                    title="Start Date"
                                    placeholder="Select start date"
                                    value={currentAd.attributes.start_date ? new Date(currentAd.attributes.start_date + 'T00:00:00') : new Date()}
                                    onChange={(date) => {
                                        if (date) {
                                            updateCurrentAd({ start_date: date.toISOString().split('T')[0] });
                                        }
                                    }}
                                />
                                <DatePicker
                                    title="End Date"
                                    placeholder="Select end date (optional)"
                                    value={currentAd.attributes.end_date ? new Date(currentAd.attributes.end_date + 'T00:00:00') : undefined}
                                    onChange={(date) => {
                                        updateCurrentAd({ end_date: date ? date.toISOString().split('T')[0] : undefined });
                                    }}
                                    fromDate={currentAd.attributes.start_date ? new Date(currentAd.attributes.start_date + 'T00:00:00') : new Date()}
                                />
                            </div>
                        </div>

                        {/* Main Image Upload */}
                        <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2 sm:gap-4 items-start pt-4 border-t">
                            <Label className="text-base font-semibold mt-2">
                                Banner <span className="text-red-500">*</span>
                            </Label>
                            <ImageUpload
                                title=""
                                value={[]}
                                description="Upload the main banner image (1600x700 recommended)"
                                onChange={(files) => {
                                    if (files.length > 0) {
                                        setUploadedImageFile(files[0]);
                                        const url = URL.createObjectURL(files[0]);
                                        updateCurrentAd({ banner_url: url });
                                    }
                                }}
                            />
                        </div>

                        {/* ── Action Buttons ── */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end border-t">
                            <Button
                                className="bg-green hover:bg-emerald-700 min-w-[120px]"
                                onClick={handleSubmit}
                                disabled={isSubmitting || isSaving || isDeleting}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                                ) : 'Submit'}
                            </Button>
                            <Button
                                className="bg-blue hover:bg-blue-800 min-w-[120px]"
                                onClick={handleSave}
                                disabled={isSaving || isSubmitting || isDeleting}
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                                ) : 'Save'}
                            </Button>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="bg-red-800 hover:bg-red-900 min-w-[120px]" disabled={isDeleting}>
                                        {isDeleting ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</>
                                        ) : (
                                            <><Trash2 className="w-4 h-4 mr-2" />Delete</>
                                        )}
                                    </Button>
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
                                        <DialogClose asChild>
                                            <Button onClick={deleteCurrentAd} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</Button>
                                        </DialogClose>
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