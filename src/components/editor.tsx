"use client";

import React, { FC, useEffect, useState } from "react";
import { MinimalTiptap } from "./ui/shadcn-io/minimal-tiptap";

interface EditorProps {
  value?: string;
  onChange?: (value: string) => void;
  // Legacy props for backward compatibility
  editorData?: string;
  setEditorData?: React.Dispatch<React.SetStateAction<string>>;
  handleOnUpdate?: (editor: string, field: string) => void;
  placeholder?: string;
  className?: string;
}

const Editor: FC<EditorProps> = ({
  value,
  onChange,
  editorData,
  setEditorData,
  handleOnUpdate,
  placeholder = "Start writing your content...",
  className = "",
}) => {
  // Use the new interface if provided, otherwise fall back to legacy interface
  const currentValue = value !== undefined ? value : (editorData || "");
  
  const handleChange = (data: string) => {
    if (onChange) {
      onChange(data);
    }
    if (setEditorData) {
      setEditorData(data);
    }
    if (handleOnUpdate) {
      handleOnUpdate(data, "description");
    }
  };

  useEffect(() => {
    console.log("Editor data: ", currentValue);
  }, [currentValue]);

  // Using useState and useEffect to ensure client-side rendering only
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Only render the editor component on the client side
  if (!isMounted) {
    return <div className={`${className} border rounded min-h-[200px] p-4`}>Loading editor...</div>;
  }

  return (
    <div className={className}>
      <MinimalTiptap
        content={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="min-h-[200px]"
      />
    </div>
  );
};

export default Editor;