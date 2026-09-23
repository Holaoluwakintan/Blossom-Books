import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Feather,
  Heart,
  Home as HomeIcon,
  Library as LibraryIcon,
  Menu,
  MoreHorizontal,
  PenLine,
  Play,
  Search,
  Send,
  Share2,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const fallbackCover = "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85";

type Book = {
  id: string;
  title: string;
  author: string;
  eyebrow: string;
  description: string;
  category: string;
  rating: string;
  reviews: number;
  minutes: number;
  chapters: number;
  image: string;
  accent: string;
  progress?: number;
  featured?: boolean;
};

function mapStoryToBook(story: { id: number; slug: string; title: string; authorName: string; subtitle?: string | null; description: string; category: string; rating?: string | null; reviewCount: number; estimatedMinutes: number; coverUrl?: string | null; chapters?: Array<unknown> }): Book {
  return { id: story.slug, title: story.title, author: story.authorName, eyebrow: story.subtitle ?? story.category, description: story.description, category: story.category, rating: story.rating ?? "0", reviews: story.reviewCount, minutes: story.estimatedMinutes, chapters: story.chapters?.length ?? 1, image: story.coverUrl ?? fallbackCover, accent: "#d87558" };
}

const categoryStyles = ["#e4d9d0", "#d9e3dd", "#ded9ed", "#f1dfbf", "#efd6dc", "#d5e4ea"];

function Logo() {
  return (
    <Link href="/" className="brand-lockup" aria-label="Blossom Stories home">
      <span className="brand-mark"><span /></span>
      <span className="brand-name">Blossom <em>Stories</em></span>
    </Link>
  );
}

function AppHeader({ searchValue, setSearchValue }: { searchValue?: string; setSearchValue?: (value: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <header className="app-header">
      <div className="header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/discover" className="nav-link">Discover</Link>
          <Link href="/library" className="nav-link">My library</Link>
          <Link href="/create" className="nav-link nav-create"><PenLine size={15} /> Write</Link>
        </nav>
        <div className="header-actions">
          <div className="header-search">
            <Search size={16} />
            <input aria-label="Search stories" value={searchValue ?? ""} onChange={(event) => setSearchValue?.(event.target.value)} placeholder="Search stories" />
            <kbd>⌘ K</kbd>
          </div>
          {isAuthenticated ? (
            <button className="avatar-button" onClick={() => void logout()} title={`Sign out ${user?.name ?? ""}`}>{(user?.name ?? "M").slice(0, 1).toUpperCase()}</button>
          ) : (
            <button className="text-button sign-in" onClick={() => startLogin()}>Sign in</button>
          )}
          <button className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>
      {menuOpen && <div className="mobile-menu"><Link href="/" onClick={() => setMenuOpen(false)}>Home</Link><Link href="/discover" onClick={() => setMenuOpen(false)}>Discover</Link><Link href="/library" onClick={() => setMenuOpen(false)}>My library</Link><Link href="/create" onClick={() => setMenuOpen(false)}>Write a story</Link></div>}
    </header>
  );
}

function BottomNav() {
  return <nav className="bottom-nav" aria-label="Mobile navigation">
    <Link href="/" className="bottom-nav-item"><HomeIcon size={19} /><span>Home</span></Link>
    <Link href="/discover" className="bottom-nav-item"><Compass size={19} /><span>Discover</span></Link>
    <Link href="/create" className="bottom-nav-item bottom-create"><span><PenLine size={20} /></span><small>Write</small></Link>
    <Link href="/library" className="bottom-nav-item"><LibraryIcon size={19} /><span>Library</span></Link>
    <Link href="/profile" className="bottom-nav-item"><UserRound size={19} /><span>Profile</span></Link>
  </nav>;
}

function Rating({ book }: { book: Book }) {
  return <span className="rating"><Star size={13} fill="currentColor" /><strong>{book.rating}</strong><span>({book.reviews})</span></span>;
}

function Cover({ book, size = "regular" }: { book: Book; size?: "small" | "regular" | "large" }) {
  return <div className={`cover cover-${size}`} style={{ "--cover-accent": book.accent } as React.CSSProperties}>
    <img src={book.image} alt={`${book.title} cover`} />
    <div className="cover-wash" />
    <div className="cover-text"><small>{book.eyebrow}</small><strong>{book.title}</strong><span>{book.author}</span></div>
  </div>;
}

function BookCard({ book, saved, onSave, variant = "standard" }: { book: Book; saved: boolean; onSave: (id: string) => void; variant?: "standard" | "compact" }) {
  return <article className={`book-card ${variant === "compact" ? "book-card-compact" : ""}`}>
    <Link href={`/book/${book.id}`} className="book-cover-link"><Cover book={book} size={variant === "compact" ? "small" : "regular"} />{book.progress && <div className="progress-track"><span style={{ width: `${book.progress}%` }} /></div>}</Link>
    <div className="book-card-info">
      <div className="book-card-title-row"><Link href={`/book/${book.id}`} className="book-card-title">{book.title}</Link><button onClick={() => onSave(book.id)} className={`save-icon ${saved ? "saved" : ""}`} aria-label={saved ? `Remove ${book.title} from library` : `Save ${book.title}`}>{saved ? <BookmarkCheck size={17} fill="currentColor" /> : <Bookmark size={17} />}</button></div>
      <p>{book.author}</p>
      <div className="book-card-meta"><Rating book={book} /><span className="dot">·</span><span>{book.minutes} min</span></div>
    </div>
  </article>;
}

function SectionHeading({ eyebrow, title, link, href = "/discover" }: { eyebrow?: string; title: string; link?: string; href?: string }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{link && <Link href={href} className="arrow-link">{link}<ArrowRight size={16} /></Link>}</div>;
}

function SaveToast({ book }: { book: Book }) {
  return <span>Saved <strong>{book.title}</strong> to your library</span>;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const storiesQuery = trpc.stories.list.useQuery(undefined, { staleTime: 30_000 });
  const savedQuery = trpc.reader.library.useQuery(undefined, { enabled: isAuthenticated });
  const progressQuery = trpc.reader.progressList.useQuery(undefined, { enabled: isAuthenticated });
  const saveStory = trpc.reader.toggleSave.useMutation({ onSuccess: () => void savedQuery.refetch(), onError: (error) => toast(error.message) });
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(() => { if (savedQuery.data) setSavedIds(savedQuery.data.map((row) => row.story.slug)); }, [savedQuery.data]);
  const [search, setSearch] = useState("");
  const handleSave = (id: string) => {
    const story = storiesQuery.data?.find((item) => item.slug === id);
    const isSaved = savedIds.includes(id);
    if (!isAuthenticated || !story) { startLogin(); return; }
    saveStory.mutate({ storyId: story.id });
    if (story) toast(isSaved ? `Removed ${story.title} from your library` : <SaveToast book={mapStoryToBook(story)} />, { icon: isSaved ? <Bookmark size={15} /> : <BookmarkCheck size={15} /> });
  };
  const books = (storiesQuery.data ?? []).map(mapStoryToBook);
  const featured = books[0];
  const progress = progressQuery.data?.[0];
  const progressBook = progress ? mapStoryToBook(progress.story) : undefined;
  const categories = Array.from(new Set((storiesQuery.data ?? []).map((story) => story.category))).slice(0, 6).map((label, index) => ({ label, count: String((storiesQuery.data ?? []).filter((story) => story.category === label).length), color: categoryStyles[index % categoryStyles.length] }));
  return <AppShell searchValue={search} setSearchValue={setSearch}>
    <main>
      <section className="home-hero container">
        <div className="hero-copy">
          <p className="eyebrow eyebrow-coral"><Sparkles size={14} /> A home for Christian stories</p>
          <h1>Stories that <em>stay</em> with you.</h1>
          <p className="hero-description">Discover thoughtful fiction, honest reflections, and writers who make faith feel close to home.</p>
          <div className="hero-actions"><Link href="/discover" className="button button-primary">Explore stories <ArrowRight size={17} /></Link><Link href="/create" className="button button-quiet"><Feather size={16} /> I want to write</Link></div>
          <div className="reader-proof"><div className="proof-avatars"><span>AM</span><span>JO</span><span>NK</span><span>+</span></div><p><strong>{storiesQuery.data?.length ?? 0} published stories</strong><br />waiting to be discovered</p></div>
        </div>
        <div className="hero-art" aria-label="Featured book artwork">
          <div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="hero-leaf leaf-one">✦</div><div className="hero-leaf leaf-two">❋</div>
          {featured ? <div className="hero-feature-card"><div className="hero-feature-image"><img src={featured.image} alt={`${featured.title} cover art`} /><div className="hero-feature-overlay" /><div className="hero-feature-label">Recently published</div><div className="hero-feature-title">{featured.title}</div><div className="hero-feature-author">{featured.author}</div></div><div className="hero-feature-footer"><Rating book={featured} /><Link href={`/read/${featured.id}`} className="play-pill"><Play size={13} fill="currentColor" /> Read now</Link></div></div> : <div className="hero-feature-card"><div className="hero-feature-image"><div className="hero-feature-overlay" /><div className="hero-feature-title">Your next story is coming</div></div></div>}
          <div className="hero-note"><BookOpen size={17} /><span>“A brave, tender story<br />about choosing hope.”</span></div>
        </div>
      </section>

      {progressBook ? <section className="container section-block continue-section"><SectionHeading eyebrow="Pick up where you left off" title="Continue reading" link="View library" href="/library" /><div className="continue-row"><div className="continue-book"><Cover book={progressBook} size="small" /><div className="continue-book-copy"><span className="mini-label">Chapter {progress!.progress.chapterNumber}</span><h3>{progressBook.title}</h3><p>{progressBook.author}</p><div className="progress-line"><span style={{ width: `${progress!.progress.progressPercent}%` }} /></div><small>{progress!.progress.progressPercent}% complete</small></div><Link href={`/read/${progressBook.id}`} className="round-play"><Play size={16} fill="currentColor" /></Link></div><div className="continue-stat"><span className="stat-icon"><Clock3 size={18} /></span><div><strong>{progress!.progress.progressPercent}%</strong><p>of this story<br />completed</p></div></div><div className="continue-quote"><span>“</span><p>Keep making space for the next page.</p><small>— Your reading room</small></div></div></section> : null}

      <section className="container section-block"><SectionHeading eyebrow="Recently published" title="Find your next read" link="See all" /><div className="book-grid">{books.slice(0, 4).map((book) => <BookCard key={book.id} book={book} saved={savedIds.includes(book.id)} onSave={handleSave} />)}</div></section>
      <section className="container section-block category-section"><SectionHeading eyebrow="Explore the shelf" title="Browse by category" /><div className="category-grid">{categories.map((category) => <Link href={`/discover?category=${encodeURIComponent(category.label)}`} className="category-card" style={{ background: category.color }} key={category.label}><span>{category.label}</span><small>{category.count} stories</small><ArrowUpRight /></Link>)}</div></section>
    </main>
  </AppShell>;
}

function ArrowUpRight() { return <ArrowRight size={16} className="category-arrow" />; }

export function AppShell({ children, searchValue, setSearchValue, plain = false }: { children: React.ReactNode; searchValue?: string; setSearchValue?: (value: string) => void; plain?: boolean }) {
  return <div className={`app-shell ${plain ? "app-shell-plain" : ""}`}><AppHeader searchValue={searchValue} setSearchValue={setSearchValue} />{children}<BottomNav /></div>;
}

export function Discover() {
  const { isAuthenticated } = useAuth();
  const savedQuery = trpc.reader.library.useQuery(undefined, { enabled: isAuthenticated });
  const saveStory = trpc.reader.toggleSave.useMutation({ onSuccess: () => void savedQuery.refetch(), onError: (error) => toast(error.message) });
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(() => { if (savedQuery.data) setSavedIds(savedQuery.data.map((row) => row.story.slug)); }, [savedQuery.data]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All stories");
  const databaseStories = trpc.stories.list.useQuery({ query: search || undefined, category: selectedCategory === "All stories" ? undefined : selectedCategory }, { staleTime: 30_000 });
  const visibleBooks = (databaseStories.data ?? []).map(mapStoryToBook);
  const categories = Array.from(new Set((databaseStories.data ?? []).map((story) => story.category))).slice(0, 6).map((label, index) => ({ label, count: "", color: categoryStyles[index % categoryStyles.length] }));
  const handleSave = (id: string) => { const story = databaseStories.data?.find((item) => item.slug === id); if (!isAuthenticated || !story) { startLogin(); return; } saveStory.mutate({ storyId: story.id }); };
  return <AppShell searchValue={search} setSearchValue={setSearch}><main className="container page-main discover-page"><div className="page-intro"><div><p className="eyebrow eyebrow-coral">The story shelf</p><h1>Discover your next <em>favorite.</em></h1><p>Thoughtful stories for wherever you are in your own.</p></div><div className="discover-micro"><Sparkles size={18} /><span>New stories<br /><strong>every week</strong></span></div></div><div className="category-pills"><button className={selectedCategory === "All stories" ? "active" : ""} onClick={() => setSelectedCategory("All stories")}>All stories</button>{categories.map((category) => <button className={selectedCategory === category.label ? "active" : ""} onClick={() => setSelectedCategory(category.label)} key={category.label}>{category.label}</button>)}</div><div className="discover-toolbar"><span><strong>{visibleBooks.length}</strong> stories to explore</span><button className="sort-button">Most recent <ChevronDown size={15} /></button></div>{visibleBooks.length ? <div className="book-grid book-grid-discover">{visibleBooks.map((book) => <BookCard key={book.id} book={book} saved={savedIds.includes(book.id)} onSave={handleSave} />)}</div> : <div className="empty-state"><Search size={28} /><h3>No stories found</h3><p>Try a different title, author, or category.</p></div>}</main></AppShell>;
}

export function Library() {
  const { isAuthenticated } = useAuth();
  const savedQuery = trpc.reader.library.useQuery(undefined, { enabled: isAuthenticated });
  const progressQuery = trpc.reader.progressList.useQuery(undefined, { enabled: isAuthenticated });
  const savedBooks = savedQuery.data?.map((row) => mapStoryToBook(row.story)) ?? [];
  const progress = progressQuery.data?.[0];
  const currentBook = progress ? mapStoryToBook(progress.story) : savedBooks[0];
  return <AppShell><main className="container page-main library-page"><div className="page-intro library-intro"><div><p className="eyebrow eyebrow-coral">Your reading room</p><h1>My <em>library.</em></h1><p>A quiet place for the stories you want to come back to.</p></div><div className="library-stats"><div><strong>{String(savedBooks.length).padStart(2, "0")}</strong><span>saved</span></div><div><strong>{progress ? "01" : "00"}</strong><span>reading</span></div><div><strong>00</strong><span>finished</span></div></div></div>{currentBook ? <section className="library-feature"><div><span className="mini-label">{progress ? "Currently reading" : "Start reading"}</span><h2>{currentBook.title}</h2><p>{currentBook.description}</p><div className="library-progress"><div><span>{progress ? `Chapter ${progress.progress.chapterNumber}` : "Not started"}</span><strong>{progress?.progress.progressPercent ?? 0}%</strong></div><div className="progress-line"><span style={{ width: `${progress?.progress.progressPercent ?? 0}%` }} /></div></div><Link href={`/read/${currentBook.id}`} className="button button-primary">{progress ? "Continue reading" : "Read now"} <ArrowRight size={17} /></Link></div><Cover book={currentBook} size="large" /></section> : <div className="empty-state"><Bookmark size={28} /><h3>Your shelf is waiting</h3><p>Save a story from Discover and it will appear here.</p><Link href="/discover" className="button button-primary">Find a story</Link></div>}<SectionHeading eyebrow="Saved for later" title="Your saved stories" />{savedBooks.length ? <div className="book-grid">{savedBooks.map((book) => <BookCard key={book.id} book={book} saved onSave={() => { void savedQuery.refetch(); }} />)}</div> : null}</main></AppShell>;
}

export function BookDetail() {
  const [, params] = useRoute("/book/:id");
  const databaseStory = trpc.stories.bySlug.useQuery({ slug: params?.id ?? "" }, { enabled: Boolean(params?.id), staleTime: 30_000 });
  const book = databaseStory.data ? mapStoryToBook(databaseStory.data) : undefined;
  const serverReviews = databaseStory.data?.reviews ?? [];
  const { isAuthenticated } = useAuth();
  const reviewMutation = trpc.reader.review.useMutation({ onSuccess: () => { void databaseStory.refetch(); toast("Your review was submitted for moderation"); }, onError: (error) => toast(error.message) }); const savedQuery = trpc.reader.library.useQuery(undefined, { enabled: isAuthenticated }); const toggleSave = trpc.reader.toggleSave.useMutation({ onSuccess: () => void savedQuery.refetch(), onError: (error) => toast(error.message) });
  const [saved, setSaved] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [review, setReview] = useState("");
  const [reviewRating, setReviewRating] = useState(5); useEffect(() => { if (databaseStory.data && savedQuery.data) setSaved(savedQuery.data.some((row) => row.story.id === databaseStory.data!.id)); }, [databaseStory.data, savedQuery.data]);
  if (!book) return <AppShell><main className="container page-main empty-state"><h1>{databaseStory.isLoading ? "Loading story…" : "Story not found"}</h1><p>{databaseStory.isLoading ? "Fetching the published story." : "This story is no longer available."}</p><Link href="/discover" className="button button-primary">Back to discover</Link></main></AppShell>;
  return <AppShell><main className="book-detail-page"><section className="book-detail-hero"><div className="detail-hero-inner container"><Link href="/discover" className="back-link"><ArrowLeft size={16} /> Back to discover</Link><div className="detail-grid"><div className="detail-cover-wrap"><Cover book={book} size="large" /><div className="detail-cover-shadow" /></div><div className="detail-copy"><p className="eyebrow eyebrow-coral">{book.category}</p><h1>{book.title}</h1><p className="detail-subtitle">{book.eyebrow}</p><div className="detail-author"><span className="author-avatar">{book.author.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span>Written by <strong>{book.author}</strong></span></div><div className="detail-rating"><Rating book={book} /><span className="rating-stars">★★★★★</span></div><p className="detail-description">{book.description}</p><div className="detail-actions"><Link href={`/read/${book.id}`} className="button button-primary"><BookOpen size={17} /> Read now</Link><button className={`button button-outline ${saved ? "button-saved" : ""}`} disabled={toggleSave.isPending} onClick={() => { if (!isAuthenticated) return startLogin(); if (databaseStory.data) toggleSave.mutate({ storyId: databaseStory.data.id }); }}>{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{saved ? "Saved" : "Save"}</button><button className="icon-button" aria-label="Share story" onClick={() => toast("Share link copied") }><Share2 size={17} /></button></div><div className="detail-meta"><span><Clock3 size={15} /> {Math.floor(book.minutes / 60)}h {book.minutes % 60}m read</span><span><BookOpen size={15} /> {book.chapters} chapters</span><span><Check size={15} /> Completed</span></div></div></div></div></section><section className="container detail-body"><div className="detail-body-main"><div className="detail-section"><h2>About this story</h2><p>{book.description} This is a story for readers who enjoy a little wonder alongside their truth, and who believe that faith is allowed to ask honest questions. Settle in, take your time, and let the words meet you where you are.</p></div><div className="detail-section review-section"><div className="review-heading"><div><h2>Reader reviews</h2><p>What the Blossom community is saying</p></div><button className="button button-quiet" onClick={() => setReviewOpen((value) => !value)}><PenLine size={15} /> Write a review</button></div>{reviewOpen && <div className="review-form">{isAuthenticated ? <><div className="rating-picker">{[1, 2, 3, 4, 5].map((value) => <button type="button" className={value <= reviewRating ? "selected" : ""} onClick={() => setReviewRating(value)} key={value}>★</button>)}</div><textarea value={review} onChange={(event) => setReview(event.target.value)} placeholder="What stayed with you?" rows={3} /><button className="button button-primary" disabled={reviewMutation.isPending || review.trim().length < 2} onClick={() => { if (databaseStory.data) reviewMutation.mutate({ storyId: databaseStory.data.id, rating: reviewRating, body: review }); }}>{reviewMutation.isPending ? "Submitting…" : "Post review"}</button></> : <p>Sign in to write a review.</p>}</div>}{serverReviews.length ? serverReviews.map((row) => <div className="review-card" key={row.review.id}><div className="review-person"><span className="author-avatar lavender">R</span><div><strong>{row.user?.name ?? "Reader"}</strong><span>{new Date(row.review.createdAt).toLocaleDateString()}</span></div><span className="review-stars">{Array.from({ length: row.review.rating }, () => "★").join("")}</span></div><p>{row.review.body}</p></div>) : <p className="text-muted-foreground">No approved reviews yet.</p>}</div></div><CommentPanel storyId={databaseStory.data!.id} /><aside className="detail-sidebar"><div className="author-card"><span className="mini-label">Meet the author</span><div className="author-card-person"><span className="large-author-avatar">OM</span><div><h3>{book.author}</h3><p>Writer · Storyteller · Christian creative</p></div></div><p>Writing stories about ordinary people finding extraordinary courage in everyday faith.</p><button className="button button-outline full-button">Follow author <span>128 followers</span></button></div><div className="more-card"><span className="mini-label">Keep exploring</span><h3>More like this</h3></div></aside></section></main></AppShell>;
}

export function Reader() {
  const [, params] = useRoute("/read/:id");
  const databaseStory = trpc.stories.bySlug.useQuery({ slug: params?.id ?? "" }, { enabled: Boolean(params?.id), staleTime: 30_000 });
  const book = databaseStory.data ? mapStoryToBook(databaseStory.data) : undefined;
  const { isAuthenticated } = useAuth();
  const storyId = databaseStory.data?.id ?? 0;
  const totalChapters = databaseStory.data?.chapters?.length ?? 0;
  const [chapter, setChapter] = useState(0);
  const [fontSize, setFontSize] = useState("medium");
  const [showSettings, setShowSettings] = useState(false);
  const progressQuery = trpc.reader.progress.useQuery({ storyId }, { enabled: isAuthenticated && storyId > 0 });
  const saveProgress = trpc.reader.saveProgress.useMutation();
  useEffect(() => { if (progressQuery.data) setChapter(Math.max(0, progressQuery.data.chapterNumber - 1)); }, [progressQuery.data]);
  useEffect(() => { if (isAuthenticated && Number.isFinite(storyId)) saveProgress.mutate({ storyId, chapterNumber: chapter + 1, progressPercent: Math.round(((chapter + 1) / totalChapters) * 100) }); }, [chapter, storyId, totalChapters]);
  const current = databaseStory.data?.chapters?.[chapter];
  if (!book || !current || totalChapters === 0) return <AppShell><main className="container page-main empty-state"><h1>{databaseStory.isLoading ? "Loading your story…" : "Chapter unavailable"}</h1><p>{databaseStory.isLoading ? "Fetching the published chapter." : "This story does not have a published chapter."}</p><Link href="/discover" className="button button-primary">Back to discover</Link></main></AppShell>;
  return <div className="reader-page"><header className="reader-header"><Link href={`/book/${book.id}`} className="reader-back"><ArrowLeft size={18} /><span>Exit reading</span></Link><div className="reader-title"><span>{book.title}</span><small>by {book.author}</small></div><div className="reader-tools"><span className="reader-progress-label">{Math.round(((chapter + 1) / totalChapters) * 100)}% complete</span><button onClick={() => setShowSettings((value) => !value)} aria-label="Reading settings"><MoreHorizontal size={20} /></button></div>{showSettings && <div className="reader-settings"><span>Text size</span><div><button className={fontSize === "small" ? "selected" : ""} onClick={() => setFontSize("small")}>A</button><button className={fontSize === "medium" ? "selected" : ""} onClick={() => setFontSize("medium")}>A</button><button className={fontSize === "large" ? "selected" : ""} onClick={() => setFontSize("large")}>A</button></div></div>}</header><div className="reader-progress"><span style={{ width: `${Math.max(6, ((chapter + 1) / totalChapters) * 100)}%` }} /></div><main className={`reader-content reader-font-${fontSize}`}><div className="reader-chapter-kicker"><span>Chapter {chapter + 1}</span><span>•</span><span>8 min read</span></div><h1>{current.title}</h1><div className="chapter-rule"><span>✦</span></div><div className="reader-prose"><p className="drop-cap">{current.body}</p></div><div className="reader-next"><button className="reader-nav-button" disabled={chapter === 0} onClick={() => setChapter((value) => Math.max(0, value - 1))}><ArrowLeft size={17} /> Previous</button><span>{chapter + 1} / {totalChapters}</span><button className="reader-nav-button next" onClick={() => { if (chapter < totalChapters - 1) setChapter((value) => value + 1); else toast("You finished this story — thank you for reading.", { icon: <Sparkles size={15} /> }); }}>Next chapter <ArrowRight size={17} /></button></div></main></div>;
}

export function Create() {
  const [published, setPublished] = useState(false);
  const [form, setForm] = useState({ title: "", type: "Story", description: "" });
  if (published) return <AppShell><main className="container page-main success-page"><div className="success-icon"><Check size={28} /></div><p className="eyebrow eyebrow-coral">Beautiful beginning</p><h1>Your story is <em>in motion.</em></h1><p>Your draft has been saved. In the full publishing flow, our review team will take a look before it goes live.</p><Link href="/profile" className="button button-primary">Go to your writer profile <ArrowRight size={17} /></Link></main></AppShell>;
  return <AppShell><main className="container page-main create-page"><div className="page-intro"><div><p className="eyebrow eyebrow-coral">The writer’s desk</p><h1>Make room for a <em>story.</em></h1><p>Start with a spark. You can shape the rest as you go.</p></div><span className="desk-icon"><Feather size={22} /></span></div><div className="create-layout"><form className="story-form" onSubmit={(event) => { event.preventDefault(); if (!form.title.trim()) { toast("Give your story a title first"); return; } setPublished(true); }}><div className="form-field"><label htmlFor="type">What are you creating?</label><div className="type-options">{["Story", "Article", "Journal"].map((type) => <button type="button" className={form.type === type ? "selected" : ""} onClick={() => setForm((current) => ({ ...current, type }))} key={type}>{type}</button>)}</div></div><div className="form-field"><label htmlFor="title">Title</label><input id="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Give your story a name" /></div><div className="form-field"><label htmlFor="description">A little about it <span>optional</span></label><textarea id="description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What do you hope a reader feels?" rows={5} /></div><div className="form-footer"><span><span className="status-dot" /> Draft saved locally</span><button className="button button-primary" type="submit">Save draft <ArrowRight size={17} /></button></div></form><aside className="create-aside"><div className="prompt-card"><Sparkles size={18} /><span className="mini-label">A little prompt</span><p>Write about a time you found grace in an ordinary place.</p><button className="text-button" onClick={() => setForm((current) => ({ ...current, description: "A story about finding grace in an ordinary place." }))}>Use this prompt <ArrowRight size={15} /></button></div><div className="creator-note"><span>“</span><p>You don't have to know where a story ends to begin telling the truth.</p><small>— The Blossom team</small></div></aside></div></main></AppShell>;
}

export function Profile() {
  const { user, isAuthenticated } = useAuth();
  return <AppShell><main className="container page-main profile-page"><div className="profile-hero"><span className="profile-avatar">{isAuthenticated && user?.name ? user.name.slice(0, 2).toUpperCase() : "YO"}</span><div><p className="eyebrow eyebrow-coral">Your Blossom profile</p><h1>{isAuthenticated && user?.name ? user.name : "Your reading life."}</h1><p>{isAuthenticated ? "Reader · Story lover" : "Sign in to keep your reading life in one place."}</p></div>{!isAuthenticated && <button className="button button-primary" onClick={() => startLogin()}>Create free account <ArrowRight size={17} /></button>}</div><div className="profile-grid"><div className="profile-panel"><span className="mini-label">Your activity</span><div className="activity-stat"><strong>14</strong><span>minutes read<br />this week</span></div><div className="activity-stat"><strong>02</strong><span>stories saved<br />for later</span></div><div className="activity-stat"><strong>01</strong><span>story<br />in progress</span></div></div><div className="profile-panel profile-panel-wide"><span className="mini-label">A note for you</span><h2>Keep making space for the words that make you more <em>yourself.</em></h2><p>There is no right pace here. Just a story, a little time, and the next page.</p><Link href="/discover" className="arrow-link">Find a new story <ArrowRight size={16} /></Link></div></div></main></AppShell>;
}

export function NotFoundPage() { return <AppShell><main className="container page-main success-page"><p className="eyebrow eyebrow-coral">Page not found</p><h1>Let’s find you a <em>better story.</em></h1><p>The page you’re looking for has wandered off.</p><Link className="button button-primary" href="/">Return home <ArrowRight size={17} /></Link></main></AppShell>; }

function CommentPanel({ storyId }: { storyId: number }) {
  const { isAuthenticated } = useAuth();
  const [body, setBody] = useState("");
  const comments = trpc.stories.comments.useQuery({ storyId }, { enabled: Number.isFinite(storyId) });
  const create = trpc.reader.comment.useMutation({ onSuccess: () => { setBody(""); void comments.refetch(); toast("Comment submitted for review"); }, onError: (error) => toast(error.message) });
  return <div className="detail-section"><div className="review-heading"><div><h2>Reader conversation</h2><p>Comments appear after a quick moderation check.</p></div></div>{isAuthenticated ? <div className="review-form"><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a thoughtful response" rows={3} /><button className="button button-primary" disabled={create.isPending || body.trim().length < 2} onClick={() => create.mutate({ storyId, body })}>Comment</button></div> : <p className="text-muted-foreground">Sign in to join the conversation.</p>}{comments.data?.map((row) => <div className="review-card" key={row.comment.id}><div className="review-person"><span className="author-avatar lavender">{(row.user.name ?? "R").slice(0, 2).toUpperCase()}</span><div><strong>{row.user.name ?? "Reader"}</strong><span>{new Date(row.comment.createdAt).toLocaleDateString()}</span></div></div><p>{row.comment.body}</p></div>)}</div>;
}
