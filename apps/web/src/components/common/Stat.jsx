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

export default function Stat({ label, value, tone }) {
    return (
        <div className="stat">
            <span>{label}</span>
            <strong className={tone}>
            {value}
            </strong>
        </div>
    );
    
}