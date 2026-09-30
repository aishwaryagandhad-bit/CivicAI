import type { Config, Context } from "@netlify/functions";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { complaints, feedback } from "../../db/schema.js";

const CATS = ["Roads", "Streetlights", "Water", "Waste", "Sanitation", "Transport", "Electricity", "Healthcare", "Education", "Other"];
const DEPTS = ["Unassigned", "Roads", "Water", "Sanitation", "Waste Management", "Electricity", "Transport", "Healthcare", "Education"];
const STS = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];
const PRIS = ["High", "Medium", "Low"];

type Row = typeof complaints.$inferSelect;
const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const bad = (m: string, status = 400) => Response.json({ error: m }, { status });

// Shape used by the frontend (kept identical to the original in-page data model)
const out = (c: Row, fb?: { rating: number; comment: string } | null) => ({
  id: "CIV-" + c.id, t: c.title, cat: c.category, d: c.description, loc: c.location, lat: c.lat, lng: c.lng,
  dt: c.reportedOn, pri: c.priority, st: c.status, cit: c.citizen, dept: c.department, n: c.reports,
  owner: c.owner, photo: c.photo ? "/api/photos/" + c.photo : "", up: c.updates || [], fb: fb || null,
});

const parseId = (id?: string) => {
  const n = Number(String(id || "").replace(/^CIV-/i, ""));
  return Number.isInteger(n) && n > 0 ? n : null;
};

export default async (req: Request, context: Context) => {
  const owner = str(req.headers.get("x-civic-device"), 80);
  const id = parseId(context.params.id);
  const isFeedback = new URL(req.url).pathname.endsWith("/feedback");

  if (req.method === "GET" && !context.params.id) {
    const rows = await db.select().from(complaints).orderBy(desc(complaints.createdAt), desc(complaints.id));
    const mine = owner
      ? await db.select().from(feedback).where(eq(feedback.owner, owner))
      : [];
    const fbBy = new Map(mine.map((f) => [f.complaintId, { rating: f.rating, comment: f.comment }]));
    return Response.json(rows.map((c) => out(c, fbBy.get(c.id))));
  }

  if (req.method === "POST" && !context.params.id) {
    const b = await req.json().catch(() => ({}));
    const d = str(b.d), loc = str(b.loc, 500), cat = str(b.cat, 40);
    if (!d || !loc || !CATS.includes(cat)) return bad("Missing description, location or category");
    const photo = str(b.photo, 200).replace(/^\/api\/photos\//, "");
    const [c] = await db.insert(complaints).values({
      title: str(b.t, 200), category: cat, description: d, location: loc,
      lat: num(b.lat), lng: num(b.lng), reportedOn: new Date().toISOString().slice(0, 10),
      citizen: str(b.cit, 120) || "Citizen", owner: owner || null, photo: /^[\w.-]+$/.test(photo) ? photo : null,
    }).returning();
    return Response.json(out(c), { status: 201 });
  }

  if (!id) return bad("Invalid complaint id", 404);

  if (req.method === "POST" && isFeedback) {
    if (!owner) return bad("Missing device id");
    const b = await req.json().catch(() => ({}));
    const rating = Number(b.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return bad("Rating must be 1-5");
    const [exists] = await db.select({ id: complaints.id }).from(complaints).where(eq(complaints.id, id));
    if (!exists) return bad("Complaint not found", 404);
    const ins = await db.insert(feedback).values({ complaintId: id, owner, rating, comment: str(b.comment, 1000) })
      .onConflictDoNothing().returning();
    if (!ins.length) {
      const [f] = await db.select().from(feedback).where(and(eq(feedback.complaintId, id), eq(feedback.owner, owner)));
      return Response.json({ duplicate: true, rating: f?.rating, comment: f?.comment }, { status: 409 });
    }
    return Response.json({ rating: ins[0].rating, comment: ins[0].comment }, { status: 201 });
  }

  if (req.method === "PATCH") {
    const b = await req.json().catch(() => ({}));
    const set: Partial<typeof complaints.$inferInsert> & Record<string, unknown> = { updatedAt: new Date() };
    if (DEPTS.includes(b.dept)) set.department = b.dept;
    if (PRIS.includes(b.pri)) set.priority = b.pri;
    if (STS.includes(b.st)) set.status = b.st;
    if (b.support) set.reports = sql`${complaints.reports} + 1` as unknown as number;
    const u = str(b.update, 1000);
    if (u) set.updates = sql`${complaints.updates} || ${JSON.stringify([u])}::jsonb` as unknown as string[];
    const [c] = await db.update(complaints).set(set).where(eq(complaints.id, id)).returning();
    if (!c) return bad("Complaint not found", 404);
    return Response.json(out(c));
  }

  return bad("Method not allowed", 405);
};

export const config: Config = {
  path: ["/api/complaints", "/api/complaints/:id", "/api/complaints/:id/feedback"],
};
