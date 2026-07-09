import React from "react";

export default function Field({
    label,
    value,
    onChange,
    type = "text",
    error = false,
    disabled = false,
    placeholder = ""
}) {
    return (
        <label className="field">
            <span>{label}</span>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                className={error ? "field-input error" : "field-input"}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}