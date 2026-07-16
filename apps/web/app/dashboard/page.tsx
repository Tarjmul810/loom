"use client"

import { useEffect, useMemo, useState } from "react";
import {
  Video,
  Plus,
  Search,
  Trash2,
  Link2,
  Check,
  Pencil,
  FileText,
  Loader2,
  AlertTriangle,
  ArrowUpDown,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  useRecordings,
  formatDuration,
  formatRelative,
  type Recording,
} from "../../lib/recordings";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbVideoToRecording } from "../../lib/mapper";


type SortKey = "newest" | "oldest";

export default function Dashboard() {
  const { items, addAll, addNew, remove, rename } = useRecordings();
  const router = useRouter()
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = items.filter((r) => (q ? r.title.toLowerCase().includes(q) : true));
    arr.sort((a, b) => (sort === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
    return arr;
  }, [items, query, sort]);

  const stats = useMemo(
    () => ({
      total: items.length,
      transcribed: items.filter((r) => r.transcribed).length,
      processing: items.filter((r) => r.status === "processing").length,
    }),
    [items],
  );

  useEffect(() => {
    if(items.length === 0) {
      fetch("/api/videos").then(r => r.json()).then(videos => {
        console.log("videos", videos)
        addAll(videos.map(dbVideoToRecording))
      })}
  }, [])

  const handleNew = () => {
    const id = addNew();
    router.push(`/recordings/${id}`);
  };

  const handleCopy = async (id: string) => {

    const url = items.find((r) => r.id === id)?.videoUrl as string;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      throw new Error("Failed to copy URL");
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 sm:px-8 pt-4 pb-12">
      <Nav />
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mt-2 mb-8">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl leading-[0.95] tracking-tight">
              Your recordings
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {stats.total} total · {stats.transcribed} transcribed
              {stats.processing > 0 ? ` · ${stats.processing} processing` : ""}
            </p>
          </div>
          <button
            onClick={handleNew}
            className="shrink-0 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> New recording
          </button>
        </div>

        {/* Controls */}
        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recordings"
                className="w-full rounded-full border border-border bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
              />
            </div>
            <button
              onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
              className="rounded-full border border-border px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowUpDown className="size-3.5" />
              {sort === "newest" ? "Newest" : "Oldest"}
            </button>
          </div>
        )}

        {/* List */}
        {items.length === 0 ? 
        (
          <EmptyState onNew={handleNew} />
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No recordings match &ldquo;{query}&rdquo;.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {filtered.map((r) => (
              <Row
                key={r.id}
                rec={r}
                editing={editingId === r.id}
                onStartEdit={() => setEditingId(r.id)}
                onSubmitEdit={(t) => {
                  rename(r.id, t);
                  setEditingId(null);
                }}
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => remove(r.id)}
                onCopy={() => handleCopy(r.id)}
                copied={copiedId === r.id}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Nav() {
  return (
    <header className="w-full max-w-3xl mt-2 mb-8">
      <div className="flex items-center justify-between border-b border-border pb-4 px-1">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary grid place-items-center">
            <Video className="size-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl leading-none">Loomy</span>
        </Link>
        <nav className="flex items-center gap-7 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link
            href="/dashboard"
            className="text-foreground"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Row({
  rec,
  editing,
  onStartEdit,
  onSubmitEdit,
  onCancelEdit,
  onDelete,
  onCopy,
  copied,
}: {
  rec: Recording;
  editing: boolean;
  onStartEdit: () => void;
  onSubmitEdit: (t: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const [draft, setDraft] = useState(rec.title);

  return (
    <li className="group py-4 flex items-center gap-4">
      {/* Thumbnail */}
      <Link
        href={`/recordings/${rec.id}`}
        className="relative shrink-0 w-20 h-12 rounded-md border border-border bg-muted/40 grid place-items-center overflow-hidden hover:border-foreground/30 transition-colors"
      >
        <Video className="size-4 text-muted-foreground" />
        <span className="absolute bottom-0.5 right-1 text-[10px] text-muted-foreground font-mono">
          {formatDuration(rec.durationSec || 0)}
        </span>
      </Link>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onSubmitEdit(draft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmitEdit(draft);
              if (e.key === "Escape") {
                setDraft(rec.title);
                onCancelEdit();
              }
            }}
            className="w-full bg-transparent border-b border-foreground/40 text-sm font-medium focus:outline-none pb-0.5"
          />
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/recordings/${rec.id}`}
              className="text-sm font-medium truncate hover:underline underline-offset-4"
            >
              {rec.title}
            </Link>
            <button
              onClick={() => {
                setDraft(rec.title);
                onStartEdit();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              aria-label="Rename"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>
        )}
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {formatRelative(rec.createdAt)}
          </span>
          <StatusBadge status={rec.status} />
          <TranscribedDot transcribed={rec.transcribed} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onCopy}
          title="Copy link"
          className="size-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${rec.title}"?`)) onDelete();
          }}
          title="Delete"
          className="size-8 grid place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-muted/60 transition-colors"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: Recording["status"] }) {
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1">
        <Loader2 className="size-3 animate-spin" />
        Processing
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-destructive">
        <AlertTriangle className="size-3" />
        Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1">
      <span className="size-1.5 rounded-full bg-foreground" />
      Ready
    </span>
  );
}

function TranscribedDot({ transcribed }: { transcribed: boolean }) {
  return (
    <span
      title={transcribed ? "Transcribed" : "Not transcribed"}
      className={`inline-flex items-center gap-1 ${transcribed ? "" : "opacity-40"}`}
    >
      <FileText className="size-3" />
      {transcribed ? "Transcript" : "No transcript"}
    </span>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="border border-dashed border-border rounded-2xl py-16 px-6 text-center">
      <div className="mx-auto size-12 rounded-full bg-muted/60 grid place-items-center">
        <Sparkles className="size-5 text-muted-foreground" />
      </div>
      <h2 className="mt-4 font-display text-2xl tracking-tight">No recordings yet</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        Hit the button below to capture your screen. Loomy will transcribe and summarize it for you.
      </p>
      <button
        onClick={onNew}
        className="mt-6 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
      >
        <Plus className="size-4" /> Create your first recording
      </button>
    </div>
  );
}
