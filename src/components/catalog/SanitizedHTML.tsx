"use client";

import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

export function SanitizedHTML({ html }: { html: string }) {
  const [sanitized, setSanitized] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSanitized(DOMPurify.sanitize(html));
  }, [html]);

  if (!sanitized) return null;

  return (
    <div
      className="prose prose-sm max-w-none text-gray-600 prose-p:my-1 prose-ul:my-1"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
