import React, { useState, useEffect, useMemo } from "react";
export default function LoadingSpinner({ size = 16 }) {
    return (
      <Loader2
        size={size}
        className="spin"
      />
    );
  }