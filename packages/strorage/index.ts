import { randomUUID } from "crypto"
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"


const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
})


export async function getPresignedUrl(userId: string, fileName: string, fileType: string): Promise<{ url: string, key: string }> {
    console.log("Env", process.env.R2_BUCKET_NAME)

    const Key = `${userId}/${randomUUID()}-${fileName}`

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key,
        ContentType: fileType,
    })

    const url = await getSignedUrl(client, command, { expiresIn: 3600 }) // URL valid for 1 hour
    return { url, key: Key }
}   

export const getPresignedReadUrl = (r2Key: string) => {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: r2Key,
    })

    const url = getSignedUrl(client, command, { expiresIn: 3600 }) // URL valid for 1 hour
    return url
}

export const downloadFromR2 = async (r2Key: string) => {
    
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: r2Key,
    })

    const response = await client.send(command)

    if (!response.Body) {
        throw new Error("No response body")
    }
    const bytes = await response.Body?.transformToByteArray()
    return Buffer.from(bytes)
}