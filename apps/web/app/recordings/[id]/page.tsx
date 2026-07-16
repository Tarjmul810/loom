"use client"

import { useEffect, useState } from "react";
import {
  Video,
  ArrowLeft,
  Link2,
  Check,
  Trash2,
  Play,
  Loader2,
  AlertTriangle,
  FileText,
  Circle,
  Link,
  Plus,
  IdCardIcon,
} from "lucide-react";
import {
  useRecordings,
  formatDuration,
  formatRelative,
  type Recording,
} from "../../../lib/recordings";
import { useRecorder } from "../../../hooks/useRecorder";
import { useParams, useRouter } from "next/navigation";
import { dbVideoToRecording } from "../../../lib/mapper";
import { getPresignedReadUrl } from "@repo/storage/index";


export default function RecordingPage() {
  const { id } = useParams();
  const navigate = useRouter();
  const { items, hydrated, add, remove, rename, update } = useRecordings();
  const { startRecording, stopRecording, previewRef, setTitle, status, setStatus, videoId, videoUrl, videoKey } = useRecorder();
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const rec: Recording | undefined = items.find((r) => r.id === id);

  const handleIdChange = (newId: string) => {
    navigate.push(`/recordings/${newId}`);
  };

  useEffect(() => {
    if (!hydrated) return
    if (rec) return

    fetch(`/api/videos/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(video => {
        const mapped = dbVideoToRecording(video);
        setDraft(mapped.title);
        add(mapped);
      })
      .catch(() => setNotFound(true));
  }, [hydrated, id]);

  useEffect(() => {
    if (rec) setDraft(rec.title);
  }, [rec?.title]);

  useEffect(() => {
    if (rec && videoId && videoUrl && videoKey) {
      update(rec?.id, videoId, videoUrl, videoKey)
      handleIdChange(videoId)
    }
  }, [videoId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/recording/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 sm:px-8 pt-4 pb-12">
      <Nav />
      <div className="w-full max-w-3xl">
        <button
          onClick={() => navigate.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </button>

        {!rec ? (
          <div className="border border-dashed border-border rounded-2xl py-16 text-center">
            <h1 className="font-display text-2xl tracking-tight">Recording not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              It may have been deleted or the link is wrong.
            </p>
            <button
              onClick={() => navigate.push("/dashboard")}
              className="mt-6 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Go to dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0 flex-1">
                {editing ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => {
                      rename(rec.id, draft);
                      setEditing(false);
                      setTitle(draft);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        rename(rec.id, draft);
                        setEditing(false);
                        setTitle(draft);
                      }
                      if (e.key === "Escape") {
                        setDraft(rec.title);
                        setEditing(false);
                      }
                    }}
                    className="w-full bg-transparent border-b border-foreground/40 font-display text-3xl sm:text-4xl tracking-tight focus:outline-none pb-1"
                  />
                ) : (
                  <h1
                    onClick={() => setEditing(true)}
                    className="font-display text-3xl sm:text-4xl tracking-tight cursor-text"
                    title="Click to rename"
                  >
                    {rec.title}
                  </h1>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatRelative(rec.createdAt)}</span>
                  <span>·</span>
                  <span>{formatDuration(rec.durationSec || 0)}</span>
                  <span>·</span>
                  <Status status={rec.status} />
                  <span>·</span>
                  <Transcribed transcribed={rec.transcribed} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="rounded-full border border-border px-3.5 py-2 text-sm hover:border-foreground/40 transition-colors inline-flex items-center gap-1.5"
                >
                  {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
                  {copied ? "Copied" : "Share"}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${rec.title}"?`)) {
                      remove(rec.id);
                      navigate.push("/dashboard");
                    }
                  }}
                  className="size-9 grid place-items-center rounded-full border border-border text-muted-foreground hover:text-destructive hover:border-foreground/40 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {/* Player mock */}
            <div className="relative rounded-xl border border-border bg-muted/30 aspect-video overflow-hidden grid place-items-center">
              {rec.status === "ready" ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  {isPlaying ? (
                    <video
                      src={rec?.videoUrl ?? undefined}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <>
                      {/* thumbnail / preview image here, if you have one */}
                      <button
                        onClick={() => setIsPlaying(true)} 
                        disabled={!rec?.videoUrl}
                        className="absolute inset-0 grid place-items-center"
                      >
                        <span className="size-16 rounded-full bg-foreground text-background grid place-items-center hover:scale-105 transition-transform">
                          <Play className="size-6 ml-0.5" fill="currentColor" />
                        </span>
                      </button>
                    </>
                  )}
                </div>
              ) : status === "processing" ? (
                <div className="text-center text-sm text-muted-foreground">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                  Processing your recording…
                </div>
              ) : status === "idle" ? (
                <button className="text-center text-sm text-muted-foreground cursor-pointer"
                  onClick={() => {
                    setStatus("recording");
                    startRecording();
                  }}>
                  <Plus className="size-6 mx-auto mb-2" fill="currentColor" />
                  Start recording
                </button>
              ) : status === "recording" ? (
                <div className="relative group w-full">
                  <video
                    ref={previewRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => {
                        stopRecording();
                        console.log("Stopped recording", rec.id, videoId!)
                        setStatus("processing");
                      }}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
                    >
                      <span className="w-3 h-3 bg-white rounded-sm" />
                      Stop recording
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <AlertTriangle className="size-6 mx-auto mb-2 text-destructive" />
                  Something went wrong with this recording.
                </div>
              )}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="relative grid place-items-center">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-foreground/40 animate-ping" />
                  <Circle className="size-2 fill-foreground text-foreground" />
                </span>
                loomy.app/r/{rec.id}
              </div>
            </div>

            {/* Transcript */}
            <div className="mt-8">
              <h2 className="font-display text-xl tracking-tight flex items-center gap-2">
                <FileText className="size-4" /> Transcript
              </h2>
              {rec.transcribed ? (
                <div className="mt-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    <span className="text-foreground font-mono text-xs mr-2">00:00</span>
                    Hey team — quick walkthrough of what we shipped this week. I&apos;ll start with the new dashboard…
                  </p>
                  <p>
                    <span className="text-foreground font-mono text-xs mr-2">00:42</span>
                    The biggest change is the inline rename on each recording. You can also copy a share link…
                  </p>
                  <p>
                    <span className="text-foreground font-mono text-xs mr-2">01:18</span>
                    Status indicators show whether something is still processing, ready to watch, or failed.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Transcript will appear here once processing finishes.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Nav() {
  return (
    <header className="w-full max-w-3xl mt-2 mb-8">
      <div className="flex items-center justify-between border-b border-border pb-4 px-1">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary grid place-items-center">
            <Video className="size-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl leading-none">Loomy</span>
        </Link>
        <nav className="flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}

function Status({ status }: { status: Recording["status"] }) {
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1">
        <Loader2 className="size-3 animate-spin" /> Processing
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-destructive">
        <AlertTriangle className="size-3" /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1">
      <span className="size-1.5 rounded-full bg-foreground" /> Ready
    </span>
  );
}

function Transcribed({ transcribed }: { transcribed: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 ${transcribed ? "" : "opacity-50"}`}>
      <FileText className="size-3" />
      {transcribed ? "Transcribed" : "No transcript"}
    </span>
  );
}
