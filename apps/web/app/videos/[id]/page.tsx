"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"


export default function VideoPage() {
    const params = useParams() as { id: string }

    console.log("clientSide parms", params.id)
    const [video, setVideo] = useState<any>(null)

    useEffect(() => {
        fetch(`/api/videos/${params.id}`, 
            {method: "GET"}
        )
            .then(res => res.json())
            .then(data => setVideo(data))
    }, [params.id])

    console.log("video", video)

    if (!video) return <div>Loading...</div>

    return (
        <div>
            <h1>{video.title}</h1>
            <video src={video.url} controls />
        </div>
    )
}