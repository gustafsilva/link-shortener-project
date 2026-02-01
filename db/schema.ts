import { pgTable, text, timestamp, varchar, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const shortLinks = pgTable(
  'short_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    originalUrl: text('original_url').notNull(),
    shortCode: varchar('short_code', { length: 7 }).notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('user_id_idx').on(table.userId),
    shortCodeIdx: uniqueIndex('short_code_idx').on(table.shortCode),
  })
);
