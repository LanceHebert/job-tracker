"use client";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalPortal({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);
  const el = useMemo(() => {
    if (typeof document === "undefined") return null as unknown as HTMLDivElement;
    const node = document.createElement("div");
    node.setAttribute("id", "modal-root");
    node.style.position = "fixed";
    node.style.inset = "0";
    node.style.zIndex = "9999";
    return node;
  }, []);

  useEffect(() => {
    if (!el) return;
    document.body.appendChild(el);
    setMounted(true);
    return () => {
      try { document.body.removeChild(el); } catch {}
    };
  }, [el]);

  if (!mounted || !el) return null;
  return createPortal(children, el);
}


