"use client"

import { useRef, useState } from "react"

export const useRecorder = () => {
    const displayStream = useRef<MediaStream | null>(null)
    const micStream = useRef<MediaStream | null>(null)
    const combinedStream = useRef<MediaStream | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const previewRef = useRef<HTMLVideoElement | null>(null)  // 👈 add this

    const [status, setStatus] = useState<"idle" | "recording" | "processing" | "ready" | "failed">("idle")
    const [title, setTitle] = useState("")

    const [videoKey, setVideoKey] = useState<string | null>(null)
    const [videoId, setVideoId] = useState<string | null>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)

    const startRecording = async () => {
        console.log("Starting recording...")

        try {
            displayStream.current = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true })

            if (previewRef.current) {
                previewRef.current.srcObject = displayStream.current
            }

            // stop preview when user hits "Stop sharing" in browser bar
            if (displayStream.current) {
                const videoTracks = displayStream.current.getVideoTracks()
                if (videoTracks.length > 0) {
                    // attach listener safely to each track to avoid "possibly undefined" errors
                    videoTracks.forEach((track) => track.addEventListener("ended", () => stopRecording()))
                }
            }
            combinedStream.current = new MediaStream([...displayStream.current.getTracks(), ...micStream.current.getTracks()])

            mediaRecorderRef.current = new MediaRecorder(combinedStream.current, { mimeType: "video/webm" })
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }
            mediaRecorderRef.current.start()
            setStatus("recording")
        }
        catch (error) {
            setStatus("failed")
            console.error("Error starting recording:", error)
        }
    }

    const stopRecording = () => {
        console.log("Stopping recording...")

        // 👇 clear the preview
        if (previewRef.current) {
            previewRef.current.srcObject = null
        }

        if (combinedStream.current) {
            combinedStream.current.getTracks().forEach(track => track.stop())
            if (displayStream.current) {
                displayStream.current.getTracks().forEach(track => track.stop())
                if (micStream.current) {
                    micStream.current.getTracks().forEach(track => track.stop())
                }
            }

            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.onstop = async () => {
                    const blob = new Blob(chunksRef.current, { type: "video/webm" })
                    try {
                        const response = await fetch("/api/upload/presigned-url", {
                            method: "POST",
                            body: JSON.stringify({ fileName: `Recording · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`, fileType: "video/webm" }),
                            headers: { "Content-Type": "application/json" }
                        })

                        const data = await response.json()

                        await fetch(data.url, {
                            method: "PUT",
                            body: blob,
                            headers: { "Content-Type": "video/webm" }
                        })

                        setVideoKey(data.key)
                        setVideoUrl(data.url)
                        
                        const dbCreate = await fetch("/api/videos", {
                            method: "POST",
                            body: JSON.stringify({ title: `${title}`, videoKey: data.key }),
                            headers: { "Content-Type": "application/json" }
                        }).then(res => {
                            if(!res.ok) throw new Error("Error creating video")
                            return res.json()
                        })

                        console.log("Video created", dbCreate)

                        setVideoId(dbCreate.id)
                        setStatus("ready")
                        chunksRef.current = []
                    } catch (error) {
                        setStatus("failed")
                        console.error("Error uploading recording:", error)
                    }
                }

                mediaRecorderRef.current.stop()
            }
        }
    }

    return { startRecording, stopRecording, status, videoKey, videoId, videoUrl, previewRef, setTitle, setStatus, setVideoId }  
}