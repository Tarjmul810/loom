import { downloadFromR2 } from "@repo/storage/index"
import { prisma } from "@repo/db/lib/prisma"
import { Groq } from "groq-sdk"

const groq = new Groq()

export async function transcibeVideo(r2Key: string, videoId: string) {
    try {
    const video = await downloadFromR2(r2Key)
    const file = new File([video], "audio.webm", { type: "video/webm" })

    console.log("Transcribing video...", r2Key)
    const transcription = await groq.audio.transcriptions.create({file, model: "whisper-large-v3", response_format: "verbose_json"})
        
    const text = transcription.text

    await prisma.video.update({
        where: {
            id: videoId,
        },
        data: {
            transcript: text,
            transcribed: true,
            status: "ready",
        },
    })

} catch (error) {
        prisma.video.update({
            where: {
                id: videoId,
            },
            data: {
                status: "ready",
            },
        })
        console.error("No audio file found for video:", r2Key)
    }

}