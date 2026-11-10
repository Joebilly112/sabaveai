"use client";

import { useEffect } from "react";

export function track(event: string, props: Record<string, string | number | boolean> = {}) {
  const body = JSON.stringify({
    event,
    path: window.location.pathname,
    props,
    ts: Date.now(),
  });
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function TrackView({ event, name }: { event: string; name?: string }) {
  useEffect(() => {
    track(event, name ? { name } : {});
  }, [event, name]);
  return null;
}
