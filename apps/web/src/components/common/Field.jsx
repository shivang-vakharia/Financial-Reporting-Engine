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

export default function Field({ label, value, onChange, type = "text" }) {
    return (
        <label className="field">
            <span>{label}</span>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}