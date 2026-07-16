// lib/mappers.ts
import { Recording } from "./recordings";

export function dbVideoToRecording(video: any): Recording {
  return {
    id:           video.id,
    title:        video.title,
    videoKey:     video.r2Key,
    videoUrl:     video.url ?? null,          // not stored in DB, generate from r2Key if needed
    createdAt:    video.createdAt,
    durationSec:  video.duration ?? undefined,
    status:       video.status,
    transcribed:  video.transcribed,
    transcript:   video.transcript ?? undefined,
  };
}