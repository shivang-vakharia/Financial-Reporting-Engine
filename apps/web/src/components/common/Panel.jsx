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
export default function Panel({ title, actions, children }) {
    return ( 
        <section className="panel">
            <div className="panel-head">
                <h2>
                    {title}
                </h2>
                
            {actions}
            </div>

        {children}
        </section>
    );
}