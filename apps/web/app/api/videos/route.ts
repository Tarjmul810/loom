import { auth } from "@clerk/nextjs/server"
import { prisma } from "@repo/db/lib/prisma"
import { getPresignedReadUrl } from "@repo/storage/index"
import { transcibeVideo } from "@repo/transcription/index"
import { NextResponse } from "next/server"
import { z } from "zod"

const videoSchema = z.object({
    title: z.string().max(255),
    videoKey: z.string().max(255),
})

export const GET = async () => {
    // const { userId } = await auth()
    const userId = "123"

    // if (!userId) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    try {
        const videos = await prisma.video.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        const withUrls = await Promise.all(
            videos.map(async (v) => ({
                ...v,
                url: v.r2Key ? await getPresignedReadUrl(v.r2Key) : null,
            }))
        );

        return NextResponse.json(withUrls)

    } catch (error) {
        return NextResponse.json({ error: "Failed to get videos" }, { status: 500 })
    }

}

export async function POST(request: Request) {
    // const { userId } = await auth()
    const userId = "123"

    // if (!userId) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { title, videoKey } = await request.json()

    const parsed = videoSchema.safeParse({ title, videoKey })
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    try {
        const video = await prisma.video.create({
            data: {
                title,
                r2Key: videoKey,
                status: "processing",
                userId,
                createdAt: new Date(),
            }
        })

        console.log("Video created", video)

        transcibeVideo(videoKey, video.id)

        return NextResponse.json(video, { status: 201 })

    } catch (error) {
        console.error("Error creating video:", error)
        return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
    }
}