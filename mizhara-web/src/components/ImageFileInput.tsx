import { useId } from "react";
import { IMAGE_ACCEPT, imageUploadHint, validateImageFile, type CropPreset } from "@/lib/image-upload";
import { filePickerClass } from "@/lib/form-styles";
import FieldError from "@/components/FieldError";

type ImageFileInputProps = {
  onSelect: (file: File) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  label?: string;
  preset?: CropPreset["id"];
  error?: string;
  errorId?: string;
};

export default function ImageFileInput({
  onSelect,
  onError,
  disabled = false,
  label = "Choose file",
  preset = "card",
  error,
  errorId,
}: ImageFileInputProps) {
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }
    onSelect(file);
  };

  return (
    <div>
      <label htmlFor={inputId} className={filePickerClass(!!error, disabled)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-primary"
          aria-hidden
        >
          <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
          <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
        </svg>
        {label}
      </label>
      <input
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />
      <p className="text-[10px] text-muted-custom mt-2 leading-relaxed">{imageUploadHint(preset)}</p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
