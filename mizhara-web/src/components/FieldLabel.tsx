import type { ReactNode } from "react";

export function RequiredMark() {
  return <span className="text-rose-500" aria-hidden="true">*</span>;
}

type FieldLabelProps = {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
};

const fieldLabelClass = "block text-[10px] font-bold uppercase mb-1";
export const fieldLabelClassLg = "block text-[10px] font-bold uppercase mb-2";

export default function FieldLabel({
  children,
  required = false,
  htmlFor,
  className = fieldLabelClass,
}: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
      {required && (
        <>
          {" "}
          <RequiredMark />
        </>
      )}
    </label>
  );
}
