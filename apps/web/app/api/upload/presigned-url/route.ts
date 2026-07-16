import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { NextResponse } from "next/server"
import { getPresignedUrl } from "@repo/storage/index"

const PresignedUrlSchema = z.object({
    fileName: z.string().max(255),
    fileType: z.string().max(100)
})

export async function POST(request: Request) {
    let { userId } = await auth()

    if (!userId) {
        userId = "123"
        // return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileName, fileType } = await request.json()

    console.log("File name", fileName)

    const parsed = PresignedUrlSchema.safeParse({ fileName, fileType })
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    try {
        const { url, key } = await getPresignedUrl(userId, fileName, fileType)

        return NextResponse.json({ url, key},  { status: 200 })
    } catch (error) {
        console.error("Error generating presigned URL:", error)
        return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 })
    }
}