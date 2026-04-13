"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type CheckedState = boolean | "indeterminate"

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onCheckedChange, disabled, onClick, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState<CheckedState>(defaultChecked ?? false)
    const isControlled = checked !== undefined
    const value = isControlled ? checked : internalChecked
    const state = value === "indeterminate" ? "indeterminate" : value ? "checked" : "unchecked"

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return
      const next = value === "indeterminate" ? true : !value
      if (!isControlled) setInternalChecked(next)
      onCheckedChange?.(next)
      onClick?.(e)
    }

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={value === "indeterminate" ? "mixed" : !!value}
        data-state={state}
        data-slot="checkbox"
        disabled={disabled}
        ref={ref}
        className={cn(
          "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {state === "checked" && (
          <span
            data-slot="checkbox-indicator"
            className="flex items-center justify-center text-current transition-none"
          >
            <CheckIcon className="size-3.5" />
          </span>
        )}
      </button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
export type { CheckedState }
