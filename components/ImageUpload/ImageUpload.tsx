// components/ImageUpload/ImageUpload.tsx
"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string | null; // 現在の画像URL
  onChange: (file: File | null, preview: string | null) => void;
  placeholder?: string;
  size?: "small" | "medium" | "large"; // サイズバリエーション
  shape?: "circle" | "square" | "rectangle"; // 形状
  label?: string;
  description?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number; // bytes
}

export default function ImageUpload({
  value,
  onChange,
  placeholder = "画像を選択",
  size = "medium",
  shape = "square",
  label,
  description,
  required = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // サイズ設定
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-lg",
    rectangle: "rounded-lg aspect-video",
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // バリデーション
    if (file.size > maxSize) {
      setError(
        `ファイルサイズが大きすぎます（${Math.round(
          maxSize / 1024 / 1024
        )}MB以下）`
      );
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("対応していないファイル形式です（JPG、PNG、WebP）");
      return;
    }

    // 既存プレビューのクリーンアップ
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const newPreview = URL.createObjectURL(file);
    setPreview(newPreview);
    onChange(file, newPreview);
  };

  const handleRemove = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="w-full flex flex-col items-center gap-2">
        {/* 画像プレビュー/アップロードエリア */}
        <div
          onClick={handleClick}
          className={`
            ${sizeClasses[size]} ${shapeClasses[shape]}
            bg-gray-100 border-2 border-dashed border-gray-300 
            flex items-center justify-center cursor-pointer 
            hover:bg-gray-50 hover:border-gray-400 transition-colors
            ${error ? "border-red-300 bg-red-50" : ""}
          `}
        >
          {preview ? (
            <Image
              src={preview}
              alt="プレビュー"
              width={100}
              height={100}
              className={`w-full h-full object-cover ${shapeClasses[shape]}`}
            />
          ) : (
            <span className="text-gray-400 text-xs text-center px-2">
              {placeholder}
            </span>
          )}
        </div>

        {/* 説明とコントロール */}
        <div className="flex-1 space-y-2">
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}

          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-800"
            >
              削除
            </button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
