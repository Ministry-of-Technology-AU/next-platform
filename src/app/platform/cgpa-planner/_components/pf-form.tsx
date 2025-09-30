import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock components for demonstration
const Label = ({ htmlFor, className, children }) => (
    <label htmlFor={htmlFor} className={className}>
        {children}
    </label>
);

const Input = ({ id, type, placeholder, value, onChange, className }) => (
    <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
);


const PFCreditsComponent = ({ pfCredits, setPfCredits }) => {
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
                        onChange={(e) => setPfCredits(e.target.value)}
                        className="max-w-xs block"
                    />
                </>
            )}
        </div>
    );
};

export default PFCreditsComponent;