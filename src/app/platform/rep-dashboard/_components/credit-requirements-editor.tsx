"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreditRequirements {
    major: number
    minor: number
    fc: number
    cc: number
    concentration: number
    openCredits: number
    total: number
}

interface CreditRequirementsEditorProps {
    credits: CreditRequirements
    onChange: (credits: CreditRequirements) => void
}

export function CreditRequirementsEditor({ credits, onChange }: CreditRequirementsEditorProps) {
    const updateField = (field: keyof CreditRequirements, value: number) => {
        onChange({ ...credits, [field]: value })
    }

    const fields: { key: keyof CreditRequirements; label: string }[] = [
        { key: "major", label: "Major" },
        { key: "minor", label: "Minor" },
        { key: "fc", label: "FC" },
        { key: "cc", label: "CC" },
        { key: "concentration", label: "Concentration" },
        { key: "openCredits", label: "Open" },
        { key: "total", label: "Total" },
    ]

    return (
        <div className="grid grid-cols-7 gap-2">
            {fields.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <Input
                        type="number"
                        min={0}
                        value={credits[key]}
                        onChange={(e) => updateField(key, parseInt(e.target.value) || 0)}
                        className="h-8 text-center"
                    />
                </div>
            ))}
        </div>
    )
}
