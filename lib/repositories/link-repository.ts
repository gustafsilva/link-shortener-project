import { db } from '@/db';
import { shortLinks } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const linkRepository = {
  async create(data: { userId: string; originalUrl: string; shortCode: string }) {
    const [link] = await db
      .insert(shortLinks)
      .values(data)
      .returning();
    return link;
  },

  async findByUserId(userId: string) {
    return await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.userId, userId))
      .orderBy(desc(shortLinks.createdAt));
  },

  async findByShortCode(shortCode: string) {
    const [link] = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.shortCode, shortCode))
      .limit(1);
    return link;
  },

  async findById(id: string) {
    const [link] = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.id, id))
      .limit(1);
    return link;
  },

  async deleteById(id: string) {
    const [deleted] = await db
      .delete(shortLinks)
      .where(eq(shortLinks.id, id))
      .returning();
    return deleted;
  },
};
