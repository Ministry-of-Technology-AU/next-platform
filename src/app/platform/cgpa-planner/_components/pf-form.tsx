import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock components for demonstration
interface LabelProps {
    htmlFor?: string;
    className?: string;
    children?: React.ReactNode;
}

const Label = ({ htmlFor, className, children }: LabelProps) => (
    <label htmlFor={htmlFor} className={className}>
        {children}
    </label>
);


interface InputProps {
    id?: string;
    type?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

const Input = ({ id, type, placeholder, value, onChange, className }: InputProps) => (
    <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
);


interface PFCreditsComponentProps {
    pfCredits: string;
    setPfCredits: (value: string) => void;
}

const PFCreditsComponent = ({ pfCredits, setPfCredits }: PFCreditsComponentProps) => {
    const [showInput, setShowInput] = useState(false);

    return (
        <div className="space-y-2">
            {!showInput ? (
                <div
                    className="flex items-center gap-2 text-sm font-medium"
                    onClick={() => setShowInput(true)}
                >
                    <Button className="w-4 h-6 cursor-pointer">
                        +
                    </Button>
                    <span>Add P/F Credits</span>
                </div>
            ) : (
                <>
                    <Label htmlFor="pfCredits" className="text-sm font-medium">
                        Until now, for how many <span className="text-red-500 bold">CREDITS (not courses)</span> have you chosen P/F
                    </Label>
                    <Input
                        id="pfCredits"
                        type="number"
                        placeholder="credits"
                        value={pfCredits}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPfCredits(e.target.value)}
                        className="max-w-xs block"
                    />
                </>
            )}
        </div>
    );
};

export default PFCreditsComponent;