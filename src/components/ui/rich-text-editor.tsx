"use client"

import * as React from "react"
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Link,
  Quote,
  Undo,
  Redo,
  Type
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  className 
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = React.useState(false)

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }

  const handleInput = () => {
    updateContent()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    updateContent()
  }

  const isCommandActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }

  const toolbarButtons = [
    {
      group: "text-style",
      buttons: [
        { command: "bold", icon: Bold, label: "Bold" },
        { command: "italic", icon: Italic, label: "Italic" },
        { command: "underline", icon: Underline, label: "Underline" },
      ]
    },
    {
      group: "alignment",
      buttons: [
        { command: "justifyLeft", icon: AlignLeft, label: "Align Left" },
        { command: "justifyCenter", icon: AlignCenter, label: "Align Center" },
        { command: "justifyRight", icon: AlignRight, label: "Align Right" },
      ]
    },
    {
      group: "lists",
      buttons: [
        { command: "insertUnorderedList", icon: List, label: "Bullet List" },
        { command: "insertOrderedList", icon: ListOrdered, label: "Numbered List" },
      ]
    },
    {
      group: "formatting",
      buttons: [
        { command: "formatBlock", icon: Quote, label: "Quote", value: "blockquote" },
        { command: "createLink", icon: Link, label: "Insert Link" },
      ]
    },
    {
      group: "history",
      buttons: [
        { command: "undo", icon: Undo, label: "Undo" },
        { command: "redo", icon: Redo, label: "Redo" },
      ]
    }
  ]

  const handleLinkCommand = () => {
    const url = prompt("Enter URL:")
    if (url) {
      executeCommand("createLink", url)
    }
  }

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/20 p-2">
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((group, groupIndex) => (
            <React.Fragment key={group.group}>
              {groupIndex > 0 && <Separator orientation="vertical" className="h-6 mx-1" />}
              {group.buttons.map((button) => {
                const IconComponent = button.icon
                const isActive = isCommandActive(button.command)
                
                return (
                  <Button
                    key={button.command}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      if (button.command === "createLink") {
                        handleLinkCommand()
                      } else if (button.value) {
                        executeCommand(button.command, button.value)
                      } else {
                        executeCommand(button.command)
                      }
                    }}
                    title={button.label}
                    type="button"
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "min-h-[200px] p-3 outline-none prose prose-sm max-w-none",
          "focus:ring-2 focus:ring-ring focus:ring-offset-2",
          !value && "text-muted-foreground",
          className
        )}
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        style={{
          minHeight: "200px"
        }}
        suppressContentEditableWarning={true}
      />
      
      {/* Placeholder */}
      {!value && !isFocused && (
        <div 
          className="absolute top-[60px] left-3 text-muted-foreground pointer-events-none"
          style={{ marginTop: "0px" }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}