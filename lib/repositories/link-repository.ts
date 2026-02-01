import { db } from '@/db';
import { shortLinks } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

type Link = typeof shortLinks.$inferSelect;

export const linkRepository = {
  async create(data: { userId: string; originalUrl: string; shortCode: string }): Promise<Link> {
    const [link] = await db
      .insert(shortLinks)
      .values(data)
      .returning();
    return link;
  },

  async findByUserId(userId: string): Promise<Link[]> {
    return await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.userId, userId))
      .orderBy(desc(shortLinks.createdAt));
  },

  async findByShortCode(shortCode: string): Promise<Link | undefined> {
    const [link] = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.shortCode, shortCode))
      .limit(1);
    return link;
  },

  async findById(id: string): Promise<Link | undefined> {
    const [link] = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.id, id))
      .limit(1);
    return link;
  },

  async deleteById(id: string): Promise<Link | undefined> {
    const [deleted] = await db
      .delete(shortLinks)
      .where(eq(shortLinks.id, id))
      .returning();
    return deleted;
  },

  async update(id: string, data: { originalUrl?: string; shortCode?: string }): Promise<Link | undefined> {
    const [updated] = await db
      .update(shortLinks)
      .set(data)
      .where(eq(shortLinks.id, id))
      .returning();
    return updated;
  },
};
