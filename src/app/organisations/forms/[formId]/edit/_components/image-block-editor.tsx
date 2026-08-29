'use client';

import { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TextField, SelectField, Field } from './inspector-fields';
import type { ImageBlock } from '@/lib/forms/schema';

interface ImageBlockEditorProps {
  block: ImageBlock;
  update: (patch: Partial<ImageBlock>) => void;
}

export function ImageBlockEditor({ block, update }: ImageBlockEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size exceeds the 10MB limit');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/organisations/forms/upload-image', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload image');
      }

      const { url } = json.data;
      update({ url });
      toast.success('Image uploaded successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed', { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      <Field label="Image">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {block.url ? (
          <div className="space-y-2.5">
            <div className="relative group overflow-hidden rounded-xl border border-border bg-muted/30 aspect-video flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.url}
                alt={block.alt || 'Uploaded image'}
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="gap-1.5 text-xs rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Replace
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="gap-1.5 text-xs rounded-lg"
                  onClick={() => update({ url: '' })}
                  disabled={uploading}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Image uploaded
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
                disabled={uploading}
              >
                Upload different image
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center gap-2.5 ${
              dragOver
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs font-semibold text-foreground">Uploading image...</p>
                <p className="text-[11px] text-muted-foreground">Processing and saving...</p>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">Click to upload or drag & drop</p>
                  <p className="text-[11px] text-muted-foreground">PNG, JPG, WebP, GIF up to 10MB</p>
                </div>
              </>
            )}
          </div>
        )}
      </Field>

      <TextField
        label="Alt text"
        value={block.alt}
        onChange={(alt) => update({ alt })}
        placeholder="Brief description of the image"
      />

      <SelectField
        label="Display width"
        value={block.width}
        onChange={(width) => update({ width })}
        options={[
          { value: 'full', label: 'Full width' },
          { value: 'half', label: 'Half width' },
        ]}
      />
    </div>
  );
}
