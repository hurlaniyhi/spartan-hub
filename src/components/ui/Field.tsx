import { cn } from "@/lib/cn";

function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-accent-dark">{error}</p>}
    </div>
  );
}

const inputClasses =
  "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint}>
      <input
        id={id}
        className={cn(inputClasses, error ? "border-accent" : "border-gray-200", className)}
        {...props}
      />
    </FieldWrapper>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Select({ label, error, hint, id, className, children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint}>
      <select
        id={id}
        className={cn(inputClasses, error ? "border-accent" : "border-gray-200", className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Textarea({ label, error, hint, id, className, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint}>
      <textarea
        id={id}
        rows={4}
        className={cn(
          inputClasses,
          "h-auto resize-y py-2.5",
          error ? "border-accent" : "border-gray-200",
          className
        )}
        {...props}
      />
    </FieldWrapper>
  );
}
