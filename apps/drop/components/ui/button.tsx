import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-tr from-[#ff6b00] to-[#ffa800] text-[#0b0c0e] shadow-lg shadow-[#ff6b00]/30 hover:shadow-[#ff6b00]/50 hover:brightness-110",
        destructive:
          "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30",
        outline:
          "border border-[#ff6b00]/40 bg-[#0b0c0e]/80 text-[#ff6b00] hover:bg-[#ff6b00]/10",
        secondary:
          "bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700",
        ghost: "hover:bg-gray-800/60 text-gray-300 hover:text-white",
        link: "text-[#ff6b00] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5 text-[11px]",
        lg: "h-13 px-8 text-sm",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
