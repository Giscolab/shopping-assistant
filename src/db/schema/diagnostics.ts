import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const diagnosticEvents = sqliteTable("diagnostic_events", {
  id: text("id").primaryKey(),
  severity: text("severity").notNull(),
  code: text("code").notNull(),
  message: text("message").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  contextJson: text("context_json", { mode: "json" }).notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
