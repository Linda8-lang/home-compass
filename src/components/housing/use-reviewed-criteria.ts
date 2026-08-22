import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "home-compass:evaluate-housing-reviewed";

function readStored(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/**
 * Tracks which "Evaluate Housing" criteria a user has marked as reviewed.
 * Local-only (localStorage) — no network calls. A single place to swap in
 * real analytics later without touching the UI that calls this hook.
 */
export function useReviewedCriteria() {
  const [reviewed, setReviewed] = useState<Record<string, boolean>>(() => readStored());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewed));
    } catch {
      // localStorage unavailable (private mode, disabled storage, etc.) — state still works in-memory.
    }
  }, [reviewed]);

  const toggle = useCallback((id: string) => {
    setReviewed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isReviewed = useCallback((id: string) => Boolean(reviewed[id]), [reviewed]);

  return { isReviewed, toggle };
}
