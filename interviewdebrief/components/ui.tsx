import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from "react";

function join(classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button
      className={join([
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" ? "bg-navy-900 text-paper hover:bg-navy-800" : "text-navy-900 hover:bg-navy-900/5",
        className,
      ])}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      {hint ? <span className="mt-1 block text-sm leading-relaxed text-ink/70">{hint}</span> : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

const control =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-base text-ink outline-none ring-amber-400/70 placeholder:text-ink/35 focus:border-navy-700 focus:ring-2";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={control} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={join([control, "min-h-36 resize-y leading-relaxed"])} {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={control} {...props} />;
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={join(["rounded-[28px] border border-line bg-white shadow-card", className])}>{children}</div>
  );
}
