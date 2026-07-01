type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-primary-dark/50 backdrop-blur-[3px] cursor-pointer"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-border-custom bg-white shadow-[0_20px_60px_-20px_rgba(42,36,32,0.5)] p-6 space-y-4">
        <div>
          <h3 id="confirm-dialog-title" className="font-serif text-lg font-bold text-primary-dark">
            {title}
          </h3>
          {message && <p className="text-xs text-muted-custom mt-2 leading-relaxed">{message}</p>}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold border border-border-custom rounded-xl hover:bg-accent-mint/20 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wide bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
