import { db } from '@/db';
import { shortLinks } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

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

  async deleteById(id: string, userId: string) {
    const [deleted] = await db
      .delete(shortLinks)
      .where(and(eq(shortLinks.id, id), eq(shortLinks.userId, userId)))
      .returning();
    
    if (!deleted) {
      throw new Error('Link não encontrado ou você não tem permissão para excluí-lo.');
    }
    
    return deleted;
  },
};
