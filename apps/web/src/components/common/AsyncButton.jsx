import React, { useState, useEffect, useMemo } from "react";
import ButtonStatusIcon from "./ButtonStatusIcon";
import {
Building2,
Download,
FileSpreadsheet,
LayoutDashboard,
LogOut,
Plus,
Settings,
Upload,
Wand2,
Loader2,
CheckCircle2
} from "lucide-react";

export default function AsyncButton({
    loading,
    success,
    children,
    className = "primary",
    disabled,
    ...props
  }) {
    return (
      <button
        {...props}
        disabled={disabled || loading}
        className={[
          className,
          loading && "button-loading",
          success && "button-success",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ButtonStatusIcon
          loading={loading}
          success={success}
        />

        <span>{children}</span>
      </button>
    );
  }