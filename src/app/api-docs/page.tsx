"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-theme.css";
import { swaggerDocument } from "@/swagger";

// Dynamically import SwaggerUI to avoid SSR issues and suppress strict mode warnings
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="swagger-loading">Loading API Documentation...</div>
  ),
});

export default function ApiDocs() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Suppress console warnings for swagger-ui-react in development
    if (process.env.NODE_ENV === "development") {
      const originalError = console.error;
      console.error = (...args) => {
        if (
          typeof args[0] === "string" &&
          (args[0].includes("UNSAFE_componentWillReceiveProps") ||
            args[0].includes("OperationContainer"))
        ) {
          return; // Suppress swagger-ui-react warnings
        }
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    }
  }, []);

  if (!mounted) {
    return <div className="swagger-loading">Loading API Documentation...</div>;
  }

  return <SwaggerUI spec={swaggerDocument} />;
}
