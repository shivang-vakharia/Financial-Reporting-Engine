import React, { useState, useEffect, useMemo } from "react";
import ButtonStatusIcon from "./ButtonStatusIcon";

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