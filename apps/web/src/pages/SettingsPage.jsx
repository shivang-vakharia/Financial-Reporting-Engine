import React from 'react';
import SettingsView from "../components/settings/SettingsView.jsx";

export default function SettingsPage({ session }) {
  return (
    <SettingsView session={session} />
  );
}
