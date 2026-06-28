type FieldErrorProps = {
  message?: string;
  id?: string;
};

export default function FieldError({ message, id }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-[10px] font-semibold text-rose-600 leading-relaxed">
      {message}
    </p>
  );
}
