import React, { useState, useEffect, useMemo } from "react";

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