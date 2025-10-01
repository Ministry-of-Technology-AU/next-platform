import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// PF Credits Component (inline)
export const PFCreditsComponent = ({ pfCredits, setPfCredits }: { pfCredits: string; setPfCredits: React.Dispatch<React.SetStateAction<string>> }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="pfCredits" className="text-sm font-medium">
                Pass/Fail Credits (if any)
            </Label>
            <Input
                id="pfCredits"
                type="number"
                value={pfCredits}
                onChange={(e) => setPfCredits(e.target.value)}
                placeholder="Enter P/F credits"
                className="w-full"
            />
        </div>
    );
};
