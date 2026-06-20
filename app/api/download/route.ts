import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get("size") || searchParams.get("bytes");
  const totalSize = parseInt(sizeParam || "10485760", 10); // Default to 10MB

  const chunkSize = 64 * 1024; // 64KB chunks
  let bytesSent = 0;

  // Create a static dummy chunk and reuse it to save CPU/Memory
  const dummyChunk = new Uint8Array(chunkSize);
  for (let i = 0; i < chunkSize; i++) {
    dummyChunk[i] = (Math.random() * 256) | 0;
  }

  const stream = new ReadableStream({
    pull(controller) {
      if (bytesSent >= totalSize) {
        controller.close();
        return;
      }

      const remaining = totalSize - bytesSent;
      const currentChunkSize = Math.min(chunkSize, remaining);

      if (currentChunkSize === chunkSize) {
        controller.enqueue(dummyChunk);
      } else {
        controller.enqueue(dummyChunk.subarray(0, currentChunkSize));
      }

      bytesSent += currentChunkSize;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": totalSize.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
