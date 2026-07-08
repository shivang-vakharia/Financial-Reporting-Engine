import React, { useState, useEffect, useMemo } from "react";
import LoadingSpinner from "./LoadingSpinner";
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

export default function ButtonStatusIcon({ loading, success }) {
    if (loading) {
      return <LoadingSpinner size={16} />;
    }

    if (success) {
      return (
        <CheckCircle2
          size={16}
          className="success-icon"
        />
      );
    }

    return null;
  }