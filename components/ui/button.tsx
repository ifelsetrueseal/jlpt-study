import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "md" | "lg";
};

const VARIANTS = {
  primary: "bg-accent text-white hover:brightness-110",
  ghost: "bg-elev text-text hover:brightness-125",
  outline: "border border-border text-sub hover:text-text hover:border-sub",
} as const;

export function Button({
  variant = "ghost",
  size = "md",
  className,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "rounded-control font-medium transition disabled:opacity-40",
        size === "lg" ? "px-5 py-4 text-base" : "px-4 py-3 text-sm",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
