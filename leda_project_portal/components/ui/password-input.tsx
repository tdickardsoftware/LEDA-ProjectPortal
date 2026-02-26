/**
 * PasswordInput component
 *
 * Styled text input with a show/hide password toggle button overlaid on the
 * right.  Extends the base Input component and omits the `type` prop since
 * visibility is managed internally.  Accessible via aria-label and
 * aria-pressed attributes on the toggle button.
 */
"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, InputProps } from "./input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<InputProps, "type"> {
  toggleLabelShow?: string;
  toggleLabelHide?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      toggleLabelShow = "Show password",
      toggleLabelHide = "Hide password",
      disabled,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false);
    const ariaLabel = visible ? toggleLabelHide : toggleLabelShow;

    return (
      <div className={cn("relative", className)}>
        <Input
          ref={ref}
          {...props}
          type={visible ? "text" : "password"}
          className={cn("pr-10", typeof className === "string" ? className : undefined)}
          disabled={disabled}
        />
        <button
          type="button"
          aria-label={ariaLabel}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className="absolute inset-y-0 right-2 my-auto h-6 w-6 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
