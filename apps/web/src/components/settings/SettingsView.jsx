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

export default function SettingsView({ session }) {
    return (
      <Panel title="Application Settings">
        <p className="muted">Manage your account settings and workspace preferences in future releases.</p>
        <div className="settings-block">
          <div><strong>Signed in as</strong></div>
          <div>{session?.user?.name} ({session?.user?.email})</div>
        </div>
        <div className="settings-block">
          <div><strong>Provider</strong></div>
          <div>{session ? 'Local development' : 'Unknown'}</div>
        </div>
      </Panel>
    );
  }