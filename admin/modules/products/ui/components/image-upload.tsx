"use client";

import { cn } from "@/lib/utils";
import { ImageIcon, PlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
  error?: string;
  disabled?: boolean;
  isEdit?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  existingImages = [],
  onRemoveExisting,
  error,
  disabled = false,
  isEdit = false,
}: ImageUploadProps) {
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = Array.from(e.target.files || []);
    const currentTotal = existingImages.length + value.length;
    const remainingSlots = 4 - currentTotal;

    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
    onChange([...value, ...files]);
  };

  const removeExistingImage = (url: string, index: number) => {
    if (disabled || !onRemoveExisting) return;
    onRemoveExisting(url);
  };

  const removeNewImage = (index: number) => {
    if (disabled) return;

    const actualIndex = index - existingImages.length;
    const newFiles = value.filter((_, i) => i !== actualIndex);
    const newPreviews = newImagePreviews.filter((_, i) => i !== actualIndex);

    URL.revokeObjectURL(newImagePreviews[actualIndex]);

    setNewImagePreviews(newPreviews);
    onChange(newFiles);
  };

  const totalImages = existingImages.length + value.length;
  const canUploadMore = totalImages < 4 && !disabled;

  const allImages = [
    ...existingImages.map((url) => ({ url, type: "existing" as const })),
    ...newImagePreviews.map((url) => ({ url, type: "new" as const })),
  ];

  return (
    <div
      className={cn("space-y-3", disabled && "opacity-70 pointer-events-none")}
    >
      <div className="flex items-center gap-2">
        <ImageIcon className="size-4 text-background" />
        <span className="text-sm font-medium text-background">
          Product Images
        </span>
        <span className="text-xs text-text-muted">({totalImages}/4)</span>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-4 gap-3">
        {allImages.map((image, index) => (
          <div
            key={`${image.type}-${index}`}
            className={cn(
              "relative aspect-square rounded-lg overflow-hidden border border-admin-divider bg-admin-bg group",
              disabled && "opacity-80"
            )}
          >
            <Image
              src={image.url}
              alt={`Product ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 200px"
            />

            {!disabled && (
              <button
                type="button"
                onClick={() => {
                  if (image.type === "existing") {
                    const existingUrl = existingImages[index];
                    removeExistingImage(existingUrl, index);
                  } else {
                    removeNewImage(index);
                  }
                }}
                className="absolute top-2 right-2 p-1.5 bg-danger hover:bg-danger/90 rounded-full transition-all z-10 shadow-lg"
              >
                <XIcon className="size-3.5 text-white" />
              </button>
            )}
          </div>
        ))}

        {canUploadMore && (
          <label
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed border-admin-divider flex flex-col items-center justify-center transition-all bg-admin-surface/30",
              !disabled &&
                "hover:border-emerald-500/50 hover:bg-admin-surface/50 cursor-pointer",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled}
            />
            <PlusIcon className="size-6 text-text-muted mb-1" />
            <span className="text-xs text-text-muted">Add Image</span>
          </label>
        )}
      </div>

      {/* Errors */}
      {error && totalImages === 0 && (
        <p className="text-xs text-danger">{error}</p>
      )}

      <p className="text-xs text-text-muted">
        {isEdit
          ? "You can keep existing images, add new ones, or remove images"
          : "Upload 1-4 product images (JPG, PNG)"}
      </p>
    </div>
  );
}
