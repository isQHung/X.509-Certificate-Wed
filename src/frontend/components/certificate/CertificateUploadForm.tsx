"use client";

import { useState, useRef } from "react";

interface CertificateUploadFormProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export default function CertificateUploadForm({
  onFileUpload,
  isLoading,
}: CertificateUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const allowedTypes = ["crt", "pem", "cer", "der"];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!ext || !allowedTypes.includes(ext)) {
      alert(`Chỉ chấp nhận các định dạng: ${allowedTypes.join(", ")}`);
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("Kích thước tệp không được vượt quá 1MB");
      return;
    }

    setSelectedFileName(file.name);
    onFileUpload(file);
  };

  const handleChange = (e: any) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        Tải lên chứng chỉ
      </h3>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          dragActive
            ? "border-slate-900 bg-slate-50"
            : "border-slate-300 hover:border-slate-400"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".crt,.pem,.cer,.der"
          onChange={handleChange}
          disabled={isLoading}
          className="hidden"
        />

        <div className="space-y-2">
          <div className="text-4xl">📄</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Kéo và thả hoặc nhấp để tải lên
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Định dạng: .crt, .pem, .cer, .der (tối đa 1MB)
            </p>
          </div>
        </div>
      </div>

      {selectedFileName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            ✓ Tệp được chọn: <strong>{selectedFileName}</strong>
          </p>
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-slate-500 text-center">
          Đang xử lý...
        </p>
      )}
    </div>
  );
}
