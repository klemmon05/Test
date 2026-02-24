"use client";
// Lightweight UI primitives to avoid full shadcn setup

import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

export const Badge = ({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "success" | "warning" | "danger";
}) => {
  const variants = {
    default: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    outline: "border border-white/20 text-white/70",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "ghost" | "outline" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
  }
>(({ className, variant = "default", size = "md", children, ...props }, ref) => {
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    ghost: "hover:bg-white/10 text-white/80 hover:text-white",
    outline: "border border-white/20 hover:bg-white/10 text-white/80",
    danger: "bg-red-600/80 hover:bg-red-600 text-white",
  };
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
    icon: "p-1.5",
  };
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = ({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      "bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/60",
      className
    )}
  >
    {children}
  </select>
);

export const Switch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <div
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors",
        checked ? "bg-blue-600" : "bg-white/20"
      )}
      onClick={() => onChange(!checked)}
    >
      <div
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </div>
    {label && <span className="text-sm text-white/70">{label}</span>}
  </label>
);

export const Tooltip = ({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) => (
  <div className="relative group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
      {content}
    </div>
  </div>
);
