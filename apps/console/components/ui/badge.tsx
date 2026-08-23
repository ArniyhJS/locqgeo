import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
        secondary:
          "border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
        outline:
          "border-[var(--border-strong)] text-[var(--text-primary)]",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
