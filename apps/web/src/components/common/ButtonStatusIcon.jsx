import React, { useState, useEffect, useMemo } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { CheckCircle2 } from "lucide-react";

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