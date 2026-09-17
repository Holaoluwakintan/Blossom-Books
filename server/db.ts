import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { announcements, follows, InsertUser, journals, notifications, reports, reviews, savedStories, stories, storyChapters, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; } } return _db; }
export async function upsertUser(user: InsertUser): Promise<void> { if (!user.openId) throw new Error("User openId is required for upsert"); const db = await getDb(); if (!db) return; const values: InsertUser = { openId: user.openId }; const updateSet: Record<string, unknown> = {}; for (const field of ["name", "email", "loginMethod"] as const) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = values[field]; } } if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; } if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; } if (!values.lastSignedIn) values.lastSignedIn = new Date(); if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date(); await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet }); }
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }
export async function listPublishedStories(category?: string) { const db = await getDb(); if (!db) return []; const where = category && category !== "All stories" ? and(eq(stories.status, "published"), eq(stories.category, category)) : eq(stories.status, "published"); return db.select().from(stories).where(where).orderBy(desc(stories.createdAt)); }
export async function getPublishedStoryBySlug(slug: string) { const db = await getDb(); if (!db) return undefined; const story = await db.select().from(stories).where(and(eq(stories.slug, slug), eq(stories.status, "published"))).limit(1); if (!story[0]) return undefined; const chapters = await db.select().from(storyChapters).where(eq(storyChapters.storyId, story[0].id)).orderBy(storyChapters.chapterNumber); return { ...story[0], chapters }; }
export async function saveStoryForUser(userId: number, storyId: number) { const db = await getDb(); if (!db) return { success: false }; const existing = await db.select().from(savedStories).where(and(eq(savedStories.userId, userId), eq(savedStories.storyId, storyId))).limit(1); if (existing[0]) { await db.delete(savedStories).where(eq(savedStories.id, existing[0].id)); return { success: true, saved: false }; } await db.insert(savedStories).values({ userId, storyId }); return { success: true, saved: true }; }
export async function createReview(userId: number, storyId: number, rating: number, body: string) { const db = await getDb(); if (!db) return undefined; const existing = await db.select().from(reviews).where(and(eq(reviews.userId, userId), eq(reviews.storyId, storyId))).limit(1); if (existing[0]) throw new Error("You have already reviewed this story"); const result = await db.insert(reviews).values({ userId, storyId, rating, body }); return { id: Number(result[0].insertId), success: true }; }

export async function listCommunityProfiles(currentUserId?: number) {
  const db = await getDb(); if (!db) return [];
  const rows = await db.select({ user: users, journal: journals }).from(journals).innerJoin(users, eq(journals.authorId, users.id)).where(eq(journals.status, "published")).orderBy(desc(journals.publishedAt)).limit(30);
  const ids = Array.from(new Set(rows.map((row) => row.user.id)));
  const counts = ids.length ? await db.select({ followerId: follows.followingId }).from(follows).where(inArray(follows.followingId, ids)) : [];
  const followingIds = currentUserId && ids.length ? await db.select({ followingId: follows.followingId }).from(follows).where(and(eq(follows.followerId, currentUserId), inArray(follows.followingId, ids))) : [];
  return ids.map((id) => { const row = rows.find((candidate) => candidate.user.id === id)!; return { id, name: row.user.name ?? "Blossom writer", role: "Writer · Christian storyteller", followers: counts.filter((count) => count.followerId === id).length, following: followingIds.some((following) => following.followingId === id), latestJournal: row.journal.title }; });
}
export async function getCommunityFeed(currentUserId: number | undefined, mode: "following" | "discover") {
  const db = await getDb(); if (!db) return [];
  const base = db.select({ journal: journals, author: users }).from(journals).innerJoin(users, eq(journals.authorId, users.id));
  const rows = mode === "following" && currentUserId ? await base.innerJoin(follows, eq(follows.followingId, journals.authorId)).where(and(eq(journals.status, "published"), eq(follows.followerId, currentUserId))).orderBy(desc(journals.publishedAt)).limit(50) : await base.where(eq(journals.status, "published")).orderBy(desc(journals.publishedAt)).limit(50);
  return rows.map((row) => ({ id: row.journal.id, slug: row.journal.slug, title: row.journal.title, excerpt: row.journal.excerpt, category: row.journal.category ?? "Personal reflection", publishedAt: row.journal.publishedAt ?? row.journal.createdAt, author: { id: row.author.id, name: row.author.name ?? "Blossom writer", role: "Writer · Christian storyteller", initials: (row.author.name ?? "BW").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() } }));
}
export async function getPublicJournal(slug: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select({ journal: journals, author: users }).from(journals).innerJoin(users, eq(journals.authorId, users.id)).where(and(eq(journals.slug, slug), eq(journals.status, "published"))).limit(1); if (!result[0]) return undefined; return { ...result[0].journal, author: { id: result[0].author.id, name: result[0].author.name ?? "Blossom writer" } }; }
export async function toggleFollow(followerId: number, followingId: number) { const db = await getDb(); if (!db || followerId === followingId) return { success: false, following: false }; const existing = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))).limit(1); if (existing[0]) { await db.delete(follows).where(eq(follows.id, existing[0].id)); return { success: true, following: false }; } await db.insert(follows).values({ followerId, followingId }); await db.insert(notifications).values({ recipientId: followingId, actorId: followerId, type: "follow", message: "Someone followed you on Blossom." }); return { success: true, following: true }; }
export async function createJournal(authorId: number, title: string, excerpt: string, body: string, publish: boolean) { const db = await getDb(); if (!db) return { success: false }; const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`; const result = await db.insert(journals).values({ authorId, slug, title, excerpt, body, status: publish ? "published" : "draft", publishedAt: publish ? new Date() : null }); if (publish) { const followers = await db.select({ followerId: follows.followerId }).from(follows).where(eq(follows.followingId, authorId)); if (followers.length) await db.insert(notifications).values(followers.map((follower) => ({ recipientId: follower.followerId, actorId: authorId, type: "new_journal" as const, referenceType: "journal", referenceId: Number(result[0].insertId), message: `${title} was just published.` }))); } return { success: true, id: Number(result[0].insertId), slug }; }
export async function createAnnouncement(authorId: number, body: string, publish: boolean) { const db = await getDb(); if (!db) return { success: false }; const result = await db.insert(announcements).values({ authorId, body, status: publish ? "published" : "draft", publishedAt: publish ? new Date() : null }); return { success: true, id: Number(result[0].insertId) }; }
export async function listNotifications(recipientId: number) { const db = await getDb(); if (!db) return []; return db.select().from(notifications).where(eq(notifications.recipientId, recipientId)).orderBy(desc(notifications.createdAt)).limit(50); }
export async function createReport(reporterId: number, targetType: string, targetId: number, reason: "harassment" | "spam" | "inappropriate" | "hate" | "copyright" | "other", note?: string) { const db = await getDb(); if (!db) return { success: false }; await db.insert(reports).values({ reporterId, targetType, targetId, reason, note }); return { success: true }; }

export async function listPublicProfiles(currentUserId?: number) {
  const db = await getDb();
  if (!db) return [];
  const userRows = await db.select({ id: users.id, name: users.name, bio: users.bio, location: users.location, website: users.website, profileVisibility: users.profileVisibility, role: users.role }).from(users).orderBy(desc(users.createdAt)).limit(50);
  const ids = userRows.map((row) => row.id);
  const followerRows = ids.length ? await db.select({ followingId: follows.followingId }).from(follows).where(inArray(follows.followingId, ids)) : [];
  const followingRows = currentUserId && ids.length ? await db.select({ followingId: follows.followingId }).from(follows).where(and(eq(follows.followerId, currentUserId), inArray(follows.followingId, ids))) : [];
  const journalRows = ids.length ? await db.select({ authorId: journals.authorId }).from(journals).where(and(eq(journals.status, "published"), inArray(journals.authorId, ids))) : [];
  return userRows.filter((row) => row.profileVisibility === "public" || row.id === currentUserId).map((row) => ({ id: row.id, name: row.name ?? "Blossom reader", bio: row.bio, location: row.location, website: row.website, role: row.role === "admin" ? "Blossom creator" : "Reader · Story lover", followers: followerRows.filter((follower) => follower.followingId === row.id).length, following: followingRows.some((following) => following.followingId === row.id), journals: journalRows.filter((journal) => journal.authorId === row.id).length }));
}

export async function listWriterDrafts(authorId: number) {
  const db = await getDb(); if (!db) return { journals: [], announcements: [] };
  const [journalRows, announcementRows] = await Promise.all([
    db.select().from(journals).where(eq(journals.authorId, authorId)).orderBy(desc(journals.updatedAt)),
    db.select().from(announcements).where(eq(announcements.authorId, authorId)).orderBy(desc(announcements.createdAt)),
  ]);
  return { journals: journalRows, announcements: announcementRows };
}
export async function getWriterDraft(authorId: number, type: "journal" | "announcement", id: number) {
  const db = await getDb(); if (!db) return undefined;
  if (type === "journal") { const result = await db.select().from(journals).where(and(eq(journals.id, id), eq(journals.authorId, authorId))).limit(1); return result[0]; }
  const result = await db.select().from(announcements).where(and(eq(announcements.id, id), eq(announcements.authorId, authorId))).limit(1); return result[0];
}
export async function saveWriterDraft(authorId: number, input: { type: "journal" | "announcement"; id?: number; title?: string; excerpt?: string; body: string; category?: string }) {
  const db = await getDb(); if (!db) return { success: false as const };
  if (input.type === "journal") {
    if (input.id) { const existing = await getWriterDraft(authorId, "journal", input.id) as typeof journals.$inferSelect | undefined; if (!existing) throw new Error("Draft not found"); await db.update(journals).set({ title: input.title ?? existing.title, excerpt: input.excerpt ?? existing.excerpt, body: input.body, category: input.category ?? existing.category, status: "draft", publishedAt: null }).where(and(eq(journals.id, input.id), eq(journals.authorId, authorId))); return { success: true as const, id: input.id, type: input.type }; }
    const title = input.title?.trim() || "Untitled journal"; const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "untitled")}-${Date.now()}`; const result = await db.insert(journals).values({ authorId, slug, title, excerpt: input.excerpt?.trim() || "", body: input.body, category: input.category || "Personal reflection", status: "draft", publishedAt: null }); return { success: true as const, id: Number(result[0].insertId), type: input.type };
  }
  if (input.id) { const existing = await getWriterDraft(authorId, "announcement", input.id); if (!existing) throw new Error("Draft not found"); await db.update(announcements).set({ body: input.body, status: "draft", publishedAt: null }).where(and(eq(announcements.id, input.id), eq(announcements.authorId, authorId))); return { success: true as const, id: input.id, type: input.type }; }
  const result = await db.insert(announcements).values({ authorId, body: input.body, status: "draft", publishedAt: null }); return { success: true as const, id: Number(result[0].insertId), type: input.type };
}
export async function previewWriterDraft(authorId: number, type: "journal" | "announcement", id: number) { return getWriterDraft(authorId, type, id); }
export async function publishWriterDraft(authorId: number, type: "journal" | "announcement", id: number) {
  const db = await getDb(); if (!db) return { success: false as const };
  if (type === "journal") { const existing = await getWriterDraft(authorId, "journal", id) as typeof journals.$inferSelect | undefined; if (!existing) throw new Error("Draft not found"); if (!existing.title.trim() || !existing.excerpt.trim() || !existing.body.trim()) throw new Error("A journal needs a title, introduction, and body"); await db.update(journals).set({ status: "published", publishedAt: new Date() }).where(and(eq(journals.id, id), eq(journals.authorId, authorId))); const followers = await db.select({ followerId: follows.followerId }).from(follows).where(eq(follows.followingId, authorId)); if (followers.length) await db.insert(notifications).values(followers.map((follower) => ({ recipientId: follower.followerId, actorId: authorId, type: "new_journal" as const, referenceType: "journal", referenceId: id, message: `${existing.title} was just published.` }))); return { success: true as const, id, type }; }
  const existing = await getWriterDraft(authorId, type, id); if (!existing) throw new Error("Draft not found"); if (!existing.body.trim()) throw new Error("An announcement needs a message"); await db.update(announcements).set({ status: "published", publishedAt: new Date() }).where(and(eq(announcements.id, id), eq(announcements.authorId, authorId))); return { success: true as const, id, type };
}

export async function getMyProfile(userId: number) {
  const db = await getDb(); if (!db) return undefined;
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1); const user = userResult[0]; if (!user) return undefined;
  const [followerRows, followingRows, authoredRows] = await Promise.all([
    db.select({ id: follows.id }).from(follows).where(eq(follows.followingId, userId)),
    db.select({ id: follows.id }).from(follows).where(eq(follows.followerId, userId)),
    db.select().from(journals).where(and(eq(journals.authorId, userId), eq(journals.status, "published"))).orderBy(desc(journals.publishedAt)),
  ]);
  return { user, counts: { followers: followerRows.length, following: followingRows.length, journals: authoredRows.length }, journals: authoredRows };
}
export async function updateMyProfile(userId: number, input: { name?: string; bio?: string; location?: string; website?: string; profileVisibility?: "public" | "private"; emailNotifications?: boolean }) {
  const db = await getDb(); if (!db) return { success: false as const };
  const values = { name: input.name?.trim() || undefined, bio: input.bio?.trim() || null, location: input.location?.trim() || null, website: input.website?.trim() || null, profileVisibility: input.profileVisibility, emailNotifications: input.emailNotifications === undefined ? undefined : input.emailNotifications ? 1 : 0 };
  await db.update(users).set(values).where(eq(users.id, userId)); return { success: true as const };
}
