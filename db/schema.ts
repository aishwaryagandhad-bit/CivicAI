import { pgTable, serial, text, integer, doublePrecision, jsonb, timestamp, unique } from "drizzle-orm/pg-core";

export const complaints = pgTable("complaints", {
  id: integer().primaryKey().generatedByDefaultAsIdentity({ startWith: 10262 }),
  title: text().notNull().default(""),
  category: text().notNull(),
  description: text().notNull(),
  location: text().notNull(),
  lat: doublePrecision(),
  lng: doublePrecision(),
  reportedOn: text("reported_on").notNull(),
  priority: text().notNull().default("Medium"),
  status: text().notNull().default("Submitted"),
  citizen: text().notNull(),
  department: text().notNull().default("Unassigned"),
  reports: integer().notNull().default(1),
  owner: text(),
  photo: text(),
  updates: jsonb().$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feedback = pgTable(
  "feedback",
  {
    id: serial().primaryKey(),
    complaintId: integer("complaint_id").notNull().references(() => complaints.id, { onDelete: "cascade" }),
    owner: text().notNull(),
    rating: integer().notNull(),
    comment: text().notNull().default(""),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique("feedback_complaint_owner").on(t.complaintId, t.owner)],
);
