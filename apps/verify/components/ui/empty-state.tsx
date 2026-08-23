import * as React from "react";
import Link from "next/link";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)]",
        className,
      )}
    >
      {icon && (
        <div className="mb-3 p-3 rounded-2xl bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-5">
        {description}
      </p>
      {action &&
        (action.href ? (
          <Link href={action.href}>
            <Button variant="default" size="default">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button variant="default" size="default" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}
