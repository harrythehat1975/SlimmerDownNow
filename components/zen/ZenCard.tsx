import { ReactNode } from "react";

interface ZenCardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4 sm:p-5",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-10",
};

export default function ZenCard({ children, className = "", padding = "md" }: ZenCardProps) {
  return (
    <div className={`bg-white rounded-zen-lg shadow-zen border border-sand-200/60 ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
  );
}
