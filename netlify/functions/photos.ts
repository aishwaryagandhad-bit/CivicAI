import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX = 4 * 1024 * 1024;

export default async (req: Request, context: Context) => {
  const store = getStore("complaint-photos");

  if (req.method === "POST") {
    const type = (req.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!TYPES[type]) return Response.json({ error: "Only JPG, PNG or WEBP images are allowed" }, { status: 415 });
    const data = await req.arrayBuffer();
    if (!data.byteLength) return Response.json({ error: "Empty file" }, { status: 400 });
    if (data.byteLength > MAX) return Response.json({ error: "Image is too large" }, { status: 413 });
    const key = `${Date.now()}-${crypto.randomUUID()}.${TYPES[type]}`;
    await store.set(key, data, { metadata: { type } });
    return Response.json({ key, url: "/api/photos/" + key }, { status: 201 });
  }

  if (req.method === "GET") {
    const key = context.params.key || "";
    if (!/^[\w.-]+$/.test(key)) return new Response("Not found", { status: 404 });
    const res = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!res) return new Response("Not found", { status: 404 });
    return new Response(res.data, {
      headers: {
        "content-type": String(res.metadata?.type || "image/jpeg"),
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/photos", "/api/photos/:key"],
};
