import React, { useState, useEffect, useMemo } from "react";
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
export default function LoadingSpinner({ size = 16 }) {
    return (
      <Loader2
        size={size}
        className="spin"
      />
    );
  }