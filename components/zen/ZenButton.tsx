import { ButtonHTMLAttributes, ReactNode } from "react";

interface ZenButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variantStyles = {
  primary:
    "bg-sage-900 text-sand-100 hover:bg-sage-800 focus:ring-sage-400/40 shadow-zen",
  secondary:
    "bg-sand-200 text-earth-800 hover:bg-sand-300 focus:ring-sage-400/30",
  ghost:
    "text-sage-700 hover:bg-sage-50 focus:ring-sage-400/20",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export default function ZenButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ZenButtonProps) {
  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        rounded-xl font-medium transition-all duration-350
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sand-100
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
