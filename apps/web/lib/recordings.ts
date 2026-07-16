import { useEffect, useState } from "react";

export type RecordingStatus = "processing" | "ready" | "failed";


export type Recording = {
  id: string;
  title: string;
  videoKey: string | null;   //r2Key
  videoUrl: string | null;   //r2Url
  createdAt: number;
  durationSec?: number;
  status: RecordingStatus;
  transcribed: boolean;
  transcript?: string;
};

const KEY = "loomy.recordings.v1";

const seed = (): Recording[] => {
  const now = Date.now();
  return [
  ];
};

function read(): Recording[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return seed();
  }
}

function write(items: Recording[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("recordings:changed"));
}

export function useRecordings() {
  const [items, setItems] = useState<Recording[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const sync = () => setItems(read());
    window.addEventListener("recordings:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("recordings:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    items,
    hydrated,
    addAll: (recordings: Recording[]) => {
      write(recordings)
      setItems(recordings)
    },
    addNew: () => {
      const id = `rec-${Math.random().toString(36).slice(2, 8)}`;
      const next: Recording = {
        id,
        title: "Untitled recording",
        videoKey: null,
        videoUrl: null,
        createdAt: Date.now(),
        durationSec: 0,
        status: "processing",
        transcribed: false,
      };
      const all = [next, ...read()];
      write(all);
      return id;
    },
    add: (recording: Recording) => {
      const all = [recording, ...read()];
      write(all);
      return recording.id;
    },
    remove: (id: string) => write(read().filter((r) => r.id !== id)),
    rename: (id: string, title: string) =>
      write(read().map((r) => (r.id === id ? { ...r, title: title.trim() || r.title } : r))),
    update: (id: string, newId: string, url: string, r2key: string) => {
      if(newId) write(read().map((r) => (r.id === id ? { ...r, id: newId, videoUrl: url, videoKey: r2key } : r)))
      },
    get: (id: string) => read().find((r) => r.id === id),
  };
}

export function formatDuration(sec: number) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}
