import { auth } from "@clerk/nextjs/server"
import { prisma } from "@repo/db/lib/prisma"
import { getPresignedReadUrl } from "@repo/storage/index"
import { NextResponse, NextRequest } from "next/server"

interface RouteContext {
    params: Promise<{ id: string }>
}

export const GET = async (request: NextRequest, { params }: RouteContext) => {
    // const { userId } = await auth()
    const userId = "123"

    // if (!userId) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }
    const resolvedParams = await params
    const id = resolvedParams.id

    try {
        const video = await prisma.video.findUnique({
            where: {
                id,
                userId,
            },
        })
    
        if (!video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 })
        }

        const url = await getPresignedReadUrl(video.r2Key)
        return NextResponse.json({...video,  url},  { status: 200 })
        
    } catch (error) {
        return NextResponse.json({ error: "Failed to get video" }, { status: 500 })
    }
}