import { and, desc, eq, inArray, isNull, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { announcements, comments, follows, InsertUser, journals, notifications, readingProgress, reports, reviews, savedStories, stories, storyChapters, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";
let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; } } return _db; }
export async function upsertUser(user: InsertUser): Promise<void> { if (!user.openId) throw new Error("User openId is required for upsert"); const db = await getDb(); if (!db) return; const values: InsertUser = { openId: user.openId }; const updateSet: Record<string, unknown> = {}; for (const field of ["name", "email", "loginMethod"] as const) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = values[field]; } } if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; } if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; } if (!values.lastSignedIn) values.lastSignedIn = new Date(); if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date(); await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet }); }
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }
export async function listPublishedStories(category?: string, limit = 50, offset = 0) { const db = await getDb(); if (!db) return []; const safeLimit = Math.min(100, Math.max(1, Math.floor(limit))); const safeOffset = Math.max(0, Math.floor(offset)); const where = category && category !== "All stories" ? and(eq(stories.status, "published"), eq(stories.category, category)) : eq(stories.status, "published"); return db.select().from(stories).where(where).orderBy(desc(stories.createdAt)).limit(safeLimit).offset(safeOffset); }
export async function getPublishedStoryBySlug(slug: string) { const db = await getDb(); if (!db) return undefined; const story = await db.select().from(stories).where(and(eq(stories.slug, slug), eq(stories.status, "published"))).limit(1); if (!story[0]) return undefined; const chapters = await db.select().from(storyChapters).where(eq(storyChapters.storyId, story[0].id)).orderBy(storyChapters.chapterNumber); const approvedReviews = await db.select({ review: reviews, user: users }).from(reviews).leftJoin(users, eq(reviews.userId, users.id)).where(and(eq(reviews.storyId, story[0].id), eq(reviews.status, "visible"))).orderBy(desc(reviews.createdAt)); const rating = approvedReviews.length ? (approvedReviews.reduce((sum, row) => sum + row.review.rating, 0) / approvedReviews.length).toFixed(1) : story[0].rating ?? "0"; return { ...story[0], chapters, reviews: approvedReviews, rating, reviewCount: approvedReviews.length || story[0].reviewCount }; }
export async function searchPublishedStories(query?: string, category?: string, limit = 50, offset = 0) { const db = await getDb(); if (!db) return []; const safeLimit = Math.min(100, Math.max(1, Math.floor(limit))); const safeOffset = Math.max(0, Math.floor(offset)); const base = category && category !== "All stories" ? and(eq(stories.status, "published"), eq(stories.category, category)) : eq(stories.status, "published"); const cleanQuery = query?.trim().slice(0, 120); const where = cleanQuery ? and(base, or(like(stories.title, `%${cleanQuery}%`), like(stories.authorName, `%${cleanQuery}%`), like(stories.description, `%${cleanQuery}%`), like(stories.category, `%${cleanQuery}%`))) : base; return db.select().from(stories).where(where).orderBy(desc(stories.createdAt)).limit(safeLimit).offset(safeOffset); }
export async function getReadingProgress(userId: number, storyId: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(readingProgress).where(and(eq(readingProgress.userId, userId), eq(readingProgress.storyId, storyId))).limit(1); return result[0]; }
export async function saveReadingProgress(userId: number, storyId: number, chapterNumber: number, progressPercent: number) {
  const db = await getDb();
  if (!db) return { success: false as const };
  const story = await db.select({ id: stories.id }).from(stories).where(and(eq(stories.id, storyId), eq(stories.status, "published"))).limit(1);
  if (!story[0]) throw new Error("Story is not available for reading");
  const safeChapter = Math.max(1, Math.floor(chapterNumber));
  const safePercent = Math.min(100, Math.max(0, Math.floor(progressPercent)));
  await db.insert(readingProgress).values({ userId, storyId, chapterNumber: safeChapter, progressPercent: safePercent }).onDuplicateKeyUpdate({ set: { chapterNumber: safeChapter, progressPercent: safePercent, lastReadAt: new Date() } });
  return { success: true as const };
}

export async function listVisibleComments(storyId: number) { const db = await getDb(); if (!db) return []; return db.select({ comment: comments, user: users }).from(comments).innerJoin(users, eq(comments.userId, users.id)).where(and(eq(comments.storyId, storyId), eq(comments.status, "visible"))).orderBy(desc(comments.createdAt)); }
export async function createComment(userId: number, storyId: number, body: string) { const db = await getDb(); if (!db) return { success: false as const }; const story = await db.select({ id: stories.id }).from(stories).where(and(eq(stories.id, storyId), eq(stories.status, "published"))).limit(1); if (!story[0]) throw new Error("Story is not available for comments"); const cleanBody = body.trim(); if (cleanBody.length < 2) throw new Error("Comment is too short"); const result = await db.insert(comments).values({ userId, storyId, body: cleanBody, status: "pending" }); return { success: true as const, id: Number(result[0].insertId) }; }
export async function listModerationItems() { const db = await getDb(); if (!db) return { comments: [], reviews: [] }; const [commentRows, reviewRows] = await Promise.all([db.select({ comment: comments, user: users }).from(comments).where(eq(comments.status, "pending")).orderBy(desc(comments.createdAt)), db.select({ review: reviews, user: users }).from(reviews).where(eq(reviews.status, "pending")).orderBy(desc(reviews.createdAt))]); return { comments: commentRows, reviews: reviewRows }; }
export async function moderateComment(id: number, status: "visible" | "hidden") { const db = await getDb(); if (!db) return { success: false as const }; await db.update(comments).set({ status }).where(eq(comments.id, id)); return { success: true as const }; }
export async function moderateReview(id: number, status: "visible" | "hidden" | "flagged") { const db = await getDb(); if (!db) return { success: false as const }; await db.update(reviews).set({ status }).where(eq(reviews.id, id)); return { success: true as const }; }
export async function uploadBookCover(userId: number, filename: string, contentType: string, base64: string) { if (!/^image\/(jpeg|png|webp)$/.test(contentType)) throw new Error("Only JPG, PNG, and WebP covers are supported"); const cleanBase64 = base64.replace(/^data:image\/[a-z0-9.+-]+;base64,/i, ""); if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleanBase64) || cleanBase64.length % 4 === 1) throw new Error("Cover data is not valid base64"); const data = Buffer.from(cleanBase64, "base64"); if (!data.length || data.length > 5 * 1024 * 1024) throw new Error("Cover must be smaller than 5MB and cannot be empty"); return storagePut(`blossom-covers/${userId}/${filename.replace(/[^a-z0-9._-]/gi, "-")}`, data, contentType); }
export async function listWriterBooks(authorId: number) { const db = await getDb(); if (!db) return []; return db.select().from(stories).where(eq(stories.authorId, authorId)).orderBy(desc(stories.updatedAt)); }
export async function getWriterBook(authorId: number, id: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(stories).where(and(eq(stories.id, id), eq(stories.authorId, authorId))).limit(1); if (!result[0]) return undefined; const chapters = await db.select().from(storyChapters).where(eq(storyChapters.storyId, id)).orderBy(storyChapters.chapterNumber); return { ...result[0], chapters }; }
export async function saveWriterBook(authorId: number, input: { id?: number; title: string; subtitle?: string; description: string; category: string; authorName: string; authorBio?: string; coverUrl?: string; chapters: Array<{ title: string; body: string }> }) {
  const db = await getDb();
  if (!db) return { success: false as const };
  const slugBase = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled-story";
  return db.transaction(async (tx) => {
    if (input.id) {
      const existing = await tx.select().from(stories).where(and(eq(stories.id, input.id), eq(stories.authorId, authorId))).limit(1);
      if (!existing[0]) throw new Error("Book not found");
      await tx.update(stories).set({ title: input.title, subtitle: input.subtitle || null, description: input.description, category: input.category, authorName: input.authorName, authorBio: input.authorBio || null, coverUrl: input.coverUrl || null, status: "draft", adminNote: null }).where(and(eq(stories.id, input.id), eq(stories.authorId, authorId)));
      await tx.delete(storyChapters).where(eq(storyChapters.storyId, input.id));
      if (input.chapters.length) await tx.insert(storyChapters).values(input.chapters.map((chapter, index) => ({ storyId: input.id!, chapterNumber: index + 1, title: chapter.title, body: chapter.body })));
      return { success: true as const, id: input.id };
    }
    const result = await tx.insert(stories).values({ slug: `${slugBase}-${Date.now()}`, title: input.title, subtitle: input.subtitle || null, description: input.description, type: "story", category: input.category, authorId, coverUrl: input.coverUrl || null, authorName: input.authorName, authorBio: input.authorBio || null, status: "draft" });
    const id = Number(result[0].insertId);
    if (input.chapters.length) await tx.insert(storyChapters).values(input.chapters.map((chapter, index) => ({ storyId: id, chapterNumber: index + 1, title: chapter.title, body: chapter.body })));
    return { success: true as const, id };
  });
}

export async function submitWriterBook(authorId: number, id: number) { const db = await getDb(); if (!db) return { success: false as const }; const book = await getWriterBook(authorId, id); if (!book) throw new Error("Book not found"); if (!book.title.trim() || !book.description.trim() || !book.authorName.trim() || !book.coverUrl || !book.chapters.length || book.chapters.some((chapter) => !chapter.title.trim() || !chapter.body.trim())) throw new Error("Add a title, synopsis, cover, author, and at least one complete chapter before submitting"); await db.update(stories).set({ status: "pending", adminNote: null }).where(and(eq(stories.id, id), eq(stories.authorId, authorId))); return { success: true as const, id, status: "pending" as const }; }
export async function listPendingBooks() { const db = await getDb(); if (!db) return []; const rows = await db.select({ story: stories, author: users }).from(stories).leftJoin(users, eq(stories.authorId, users.id)).where(eq(stories.status, "pending")).orderBy(desc(stories.updatedAt)); return Promise.all(rows.map(async (row) => ({ ...row.story, writer: row.author, chapters: await db.select().from(storyChapters).where(eq(storyChapters.storyId, row.story.id)).orderBy(storyChapters.chapterNumber) })));
}
export async function moderateBook(id: number, status: "published" | "rejected", adminNote?: string) { const db = await getDb(); if (!db) return { success: false as const }; const result = await db.update(stories).set({ status, adminNote: adminNote || null }).where(eq(stories.id, id)); return { success: result[0].affectedRows > 0, id, status }; }
export async function saveStoryForUser(userId: number, storyId: number) {
  const db = await getDb();
  if (!db) return { success: false as const, saved: false };
  const story = await db.select({ id: stories.id }).from(stories).where(and(eq(stories.id, storyId), eq(stories.status, "published"))).limit(1);
  if (!story[0]) throw new Error("Story is not available to save");
  const deleted = await db.delete(savedStories).where(and(eq(savedStories.userId, userId), eq(savedStories.storyId, storyId)));
  if (deleted[0].affectedRows > 0) return { success: true as const, saved: false };
  await db.insert(savedStories).values({ userId, storyId }).onDuplicateKeyUpdate({ set: { storyId } });
  return { success: true as const, saved: true };
}

export async function listSavedStories(userId: number) { const db = await getDb(); if (!db) return []; return db.select({ saved: savedStories, story: stories }).from(savedStories).innerJoin(stories, eq(savedStories.storyId, stories.id)).where(and(eq(savedStories.userId, userId), eq(stories.status, "published"))).orderBy(desc(savedStories.createdAt)); }
export async function listReadingProgress(userId: number) { const db = await getDb(); if (!db) return []; return db.select({ progress: readingProgress, story: stories }).from(readingProgress).innerJoin(stories, eq(readingProgress.storyId, stories.id)).where(and(eq(readingProgress.userId, userId), eq(stories.status, "published"))).orderBy(desc(readingProgress.lastReadAt)); }
export async function createReview(userId: number, storyId: number, rating: number, body: string) { const db = await getDb(); if (!db) return undefined; const story = await db.select({ id: stories.id }).from(stories).where(and(eq(stories.id, storyId), eq(stories.status, "published"))).limit(1); if (!story[0]) throw new Error("Story is not available for reviews"); const safeRating = Math.floor(rating); const cleanBody = body.trim(); if (safeRating < 1 || safeRating > 5) throw new Error("Rating must be between 1 and 5"); if (cleanBody.length < 2) throw new Error("Review is too short"); const existing = await db.select().from(reviews).where(and(eq(reviews.userId, userId), eq(reviews.storyId, storyId))).limit(1); if (existing[0]) throw new Error("You have already reviewed this story"); const result = await db.insert(reviews).values({ userId, storyId, rating: safeRating, body: cleanBody }); return { id: Number(result[0].insertId), success: true }; }

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
  const followedIds = mode === "following" && currentUserId ? (await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, currentUserId))).map((row) => row.followingId) : undefined;
  const authorFilter = (authorId: number) => !followedIds || followedIds.includes(authorId);
  const [journalRows, announcementRows, storyRows] = await Promise.all([
    db.select({ journal: journals, author: users }).from(journals).innerJoin(users, eq(journals.authorId, users.id)).where(eq(journals.status, "published")).orderBy(desc(journals.publishedAt)).limit(50),
    db.select({ announcement: announcements, author: users }).from(announcements).innerJoin(users, eq(announcements.authorId, users.id)).where(eq(announcements.status, "published")).orderBy(desc(announcements.publishedAt)).limit(50),
    db.select({ story: stories, author: users }).from(stories).innerJoin(users, eq(stories.authorId, users.id)).where(eq(stories.status, "published")).orderBy(desc(stories.createdAt)).limit(50),
  ]);
  const author = (row: { id: number; name: string | null }) => ({ id: row.id, name: row.name ?? "Blossom writer", role: "Writer · Christian storyteller", initials: (row.name ?? "BW").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() });
  return [
    ...journalRows.filter((row) => authorFilter(row.author.id)).map((row) => ({ id: row.journal.id, kind: "journal" as const, slug: row.journal.slug, title: row.journal.title, excerpt: row.journal.excerpt, category: row.journal.category ?? "Personal reflection", publishedAt: row.journal.publishedAt ?? row.journal.createdAt, author: author(row.author) })),
    ...announcementRows.filter((row) => authorFilter(row.author.id)).map((row) => ({ id: row.announcement.id, kind: "announcement" as const, slug: undefined, title: "Announcement", excerpt: row.announcement.body, category: "Writer update", publishedAt: row.announcement.publishedAt ?? row.announcement.createdAt, author: author(row.author) })),
    ...storyRows.filter((row) => authorFilter(row.author.id)).map((row) => ({ id: row.story.id, kind: "book" as const, slug: row.story.slug, title: row.story.title, excerpt: row.story.description, category: "New story", publishedAt: row.story.createdAt, author: author(row.author) })),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 50);
}
export async function getPublicJournal(slug: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select({ journal: journals, author: users }).from(journals).innerJoin(users, eq(journals.authorId, users.id)).where(and(eq(journals.slug, slug), eq(journals.status, "published"))).limit(1); if (!result[0]) return undefined; return { ...result[0].journal, author: { id: result[0].author.id, name: result[0].author.name ?? "Blossom writer" } }; }
export async function toggleFollow(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db || followerId === followingId) return { success: false, following: false };
  const target = await db.select({ id: users.id }).from(users).where(eq(users.id, followingId)).limit(1);
  if (!target[0]) throw new Error("Writer not found");
  const deleted = await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  if (deleted[0].affectedRows > 0) return { success: true, following: false };
  await db.insert(follows).values({ followerId, followingId }).onDuplicateKeyUpdate({ set: { followingId } });
  await db.insert(notifications).values({ recipientId: followingId, actorId: followerId, type: "follow", message: "Someone followed you on Blossom." });
  return { success: true, following: true };
}

export async function createJournal(authorId: number, title: string, excerpt: string, body: string, publish: boolean) { const db = await getDb(); if (!db) return { success: false }; const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`; const result = await db.insert(journals).values({ authorId, slug, title, excerpt, body, status: publish ? "published" : "draft", publishedAt: publish ? new Date() : null }); if (publish) { const followers = await db.select({ followerId: follows.followerId }).from(follows).where(eq(follows.followingId, authorId)); if (followers.length) await db.insert(notifications).values(followers.map((follower) => ({ recipientId: follower.followerId, actorId: authorId, type: "new_journal" as const, referenceType: "journal", referenceId: Number(result[0].insertId), message: `${title} was just published.` }))); } return { success: true, id: Number(result[0].insertId), slug }; }
export async function createAnnouncement(authorId: number, body: string, publish: boolean) { const db = await getDb(); if (!db) return { success: false }; const result = await db.insert(announcements).values({ authorId, body, status: publish ? "published" : "draft", publishedAt: publish ? new Date() : null }); if (publish) { const followers = await db.select({ followerId: follows.followerId }).from(follows).where(eq(follows.followingId, authorId)); if (followers.length) await db.insert(notifications).values(followers.map((follower) => ({ recipientId: follower.followerId, actorId: authorId, type: "announcement" as const, referenceType: "announcement", referenceId: Number(result[0].insertId), message: "A writer you follow shared an announcement." }))); } return { success: true, id: Number(result[0].insertId) }; }
export async function listNotifications(recipientId: number) { const db = await getDb(); if (!db) return []; return db.select().from(notifications).where(eq(notifications.recipientId, recipientId)).orderBy(desc(notifications.createdAt)).limit(50); }
export async function markNotificationsRead(recipientId: number) { const db = await getDb(); if (!db) return { success: false as const }; await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.recipientId, recipientId), isNull(notifications.readAt))); return { success: true as const }; }
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
export async function getPublicAuthorProfile(authorId: number, currentUserId?: number) { const db = await getDb(); if (!db) return undefined; const user = (await db.select({ id: users.id, name: users.name, bio: users.bio, location: users.location, website: users.website, profileVisibility: users.profileVisibility, role: users.role }).from(users).where(eq(users.id, authorId)).limit(1))[0]; if (!user || (user.profileVisibility !== "public" && user.id !== currentUserId)) return undefined; const [journalRows, storyRows, followerRows, followingRows] = await Promise.all([db.select().from(journals).where(and(eq(journals.authorId, authorId), eq(journals.status, "published"))).orderBy(desc(journals.publishedAt)), db.select().from(stories).where(and(eq(stories.authorId, authorId), eq(stories.status, "published"))).orderBy(desc(stories.createdAt)), db.select().from(follows).where(eq(follows.followingId, authorId)), currentUserId ? db.select().from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, authorId))) : Promise.resolve([])]); return { user, journals: journalRows, stories: storyRows, followers: followerRows.length, following: followingRows.length > 0 }; }

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
