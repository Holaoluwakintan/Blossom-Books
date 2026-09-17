import { useMemo, useState } from "react";
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

const coverImages = {
  golgotha: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  waiting: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85",
  mercy: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  river: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85",
  garden: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85",
  unseen: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
};

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

const books: Book[] = [
  {
    id: "golgotha",
    title: "Golgotha",
    author: "Olaoluwa Michael",
    eyebrow: "Land of Zombies",
    description: "In a city where fear has become a second language, one young believer has to choose between the safety of silence and the courage of a living hope.",
    category: "Christian Fiction",
    rating: "4.8",
    reviews: 127,
    minutes: 260,
    chapters: 18,
    image: coverImages.golgotha,
    accent: "#d87558",
    progress: 72,
    featured: true,
  },
  {
    id: "waiting",
    title: "When God Says Wait",
    author: "Sarah Adeyemi",
    eyebrow: "A journal for the in-between",
    description: "A gentle collection of reflections for seasons when the answer is not yet, but grace is still here.",
    category: "Faith & Spiritual Growth",
    rating: "4.9",
    reviews: 86,
    minutes: 48,
    chapters: 7,
    image: coverImages.waiting,
    accent: "#a49bd7",
  },
  {
    id: "mercy",
    title: "Mercy in the Margins",
    author: "Tomiwa James",
    eyebrow: "Short story",
    description: "A daughter returns to the neighborhood she left behind and finds forgiveness waiting in an unexpected place.",
    category: "Short Stories",
    rating: "4.7",
    reviews: 54,
    minutes: 32,
    chapters: 1,
    image: coverImages.mercy,
    accent: "#e6a64e",
  },
  {
    id: "river",
    title: "A River in the Desert",
    author: "Chinonso Okeke",
    eyebrow: "Christian Fiction",
    description: "A story about holy imagination, homecoming, and the kind of hope that grows quietly underground.",
    category: "Fiction",
    rating: "4.6",
    reviews: 38,
    minutes: 96,
    chapters: 5,
    image: coverImages.river,
    accent: "#78a59b",
  },
  {
    id: "garden",
    title: "The Garden After Rain",
    author: "Miriam Cole",
    eyebrow: "Romance & Relationships",
    description: "Two old friends meet again and discover that restoration rarely arrives looking like the past.",
    category: "Romance & Relationships",
    rating: "4.8",
    reviews: 71,
    minutes: 120,
    chapters: 9,
    image: coverImages.garden,
    accent: "#c78ca5",
  },
  {
    id: "unseen",
    title: "The Unseen Work",
    author: "David Mensah",
    eyebrow: "Devotional",
    description: "Small reflections on faithfulness, service, and the beautiful work no one applauds.",
    category: "Devotionals",
    rating: "4.9",
    reviews: 102,
    minutes: 36,
    chapters: 12,
    image: coverImages.unseen,
    accent: "#7184bd",
  },
];

const categories = [
  { label: "All stories", count: "128", color: "#e4d9d0" },
  { label: "Christian Fiction", count: "42", color: "#d9e3dd" },
  { label: "Faith & Growth", count: "31", color: "#ded9ed" },
  { label: "Short Stories", count: "28", color: "#f1dfbf" },
  { label: "Romance", count: "18", color: "#efd6dc" },
  { label: "Young Adult", count: "14", color: "#d5e4ea" },
];

const chapterCopy = [
  {
    title: "A city holding its breath",
    body: "The first thing Nkem noticed was the quiet. Not the peaceful kind that settled over the streets after rain, but a quiet that watched back. It waited behind shuttered windows and beneath the rusted sign outside the old cinema.",
  },
  {
    title: "The small light",
    body: "At dawn, she found the candle still burning in the chapel. Someone had placed it in a chipped glass beside the door, where anyone could see it. Nkem cupped her hands around the flame and remembered what her mother used to say: light is never embarrassed by the dark.",
  },
  {
    title: "Names we carry",
    body: "By noon, the streets had begun to move again. People carried bread, water, and the names of those they were still searching for. Nkem walked with them, not because she had stopped being afraid, but because courage had finally become a shared thing.",
  },
];

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
  const [savedIds, setSavedIds] = useState<string[]>(["waiting"]);
  const [search, setSearch] = useState("");
  const handleSave = (id: string) => {
    const book = books.find((item) => item.id === id);
    const isSaved = savedIds.includes(id);
    setSavedIds((items) => isSaved ? items.filter((item) => item !== id) : [...items, id]);
    if (book) toast(isSaved ? `Removed ${book.title} from your library` : <SaveToast book={book} />, { icon: isSaved ? <Bookmark size={15} /> : <BookmarkCheck size={15} /> });
  };
  return <AppShell searchValue={search} setSearchValue={setSearch}>
    <main>
      <section className="home-hero container">
        <div className="hero-copy">
          <p className="eyebrow eyebrow-coral"><Sparkles size={14} /> A home for Christian stories</p>
          <h1>Stories that <em>stay</em> with you.</h1>
          <p className="hero-description">Discover thoughtful fiction, honest reflections, and writers who make faith feel close to home.</p>
          <div className="hero-actions"><Link href="/discover" className="button button-primary">Explore stories <ArrowRight size={17} /></Link><Link href="/create" className="button button-quiet"><Feather size={16} /> I want to write</Link></div>
          <div className="reader-proof"><div className="proof-avatars"><span>AM</span><span>JO</span><span>NK</span><span>+2k</span></div><p><strong>2,000+ readers</strong><br />finding something meaningful</p></div>
        </div>
        <div className="hero-art" aria-label="Featured book artwork">
          <div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="hero-leaf leaf-one">✦</div><div className="hero-leaf leaf-two">❋</div>
          <div className="hero-feature-card"><div className="hero-feature-image"><img src={coverImages.golgotha} alt="Golgotha cover art" /><div className="hero-feature-overlay" /><div className="hero-feature-label">The book of the month</div><div className="hero-feature-title">Golgotha</div><div className="hero-feature-author">Olaoluwa Michael</div></div><div className="hero-feature-footer"><span><Star size={14} fill="currentColor" /> 4.8 <small>· 127 reviews</small></span><Link href="/read/golgotha" className="play-pill"><Play size={13} fill="currentColor" /> Read now</Link></div></div>
          <div className="hero-note"><BookOpen size={17} /><span>“A brave, tender story<br />about choosing hope.”</span></div>
        </div>
      </section>

      <section className="container section-block continue-section"><SectionHeading eyebrow="Pick up where you left off" title="Continue reading" link="View library" href="/library" /><div className="continue-row"><div className="continue-book"><Cover book={books[0]} size="small" /><div className="continue-book-copy"><span className="mini-label">Chapter 13 of 18</span><h3>{books[0].title}</h3><p>{books[0].author}</p><div className="progress-line"><span style={{ width: "72%" }} /></div><small>72% complete · 38 min left</small></div><Link href="/read/golgotha" className="round-play"><Play size={16} fill="currentColor" /></Link></div><div className="continue-stat"><span className="stat-icon"><Clock3 size={18} /></span><div><strong>14 min</strong><p>your reading time<br />this week</p></div></div><div className="continue-quote"><span>“</span><p>Sometimes the bravest prayer is simply staying.</p><small>— From Golgotha</small></div></div></section>

      <section className="container section-block"><SectionHeading eyebrow="What readers are loving" title="Trending this week" link="See all" /><div className="book-grid">{books.slice(1, 5).map((book) => <BookCard key={book.id} book={book} saved={savedIds.includes(book.id)} onSave={handleSave} />)}</div></section>
      <section className="soft-section"><div className="container section-block"><SectionHeading eyebrow="Curated for your quiet moments" title="Editor’s picks" link="Browse collection" /><div className="editorial-grid">{books.slice(4, 6).map((book, index) => <Link href={`/book/${book.id}`} className={`editorial-card editorial-${index}`} key={book.id}><img src={book.image} alt="" /><div className="editorial-overlay" /><div className="editorial-copy"><span>{index === 0 ? "A gentle love story" : "For the days no one sees"}</span><h3>{book.title}</h3><small>by {book.author}</small></div><ArrowRight size={18} /></Link>)}</div></div></section>
      <section className="container section-block category-section"><SectionHeading eyebrow="Find your next read" title="Browse by feeling" /><div className="category-grid">{categories.map((category) => <Link href={`/discover?category=${encodeURIComponent(category.label)}`} className="category-card" style={{ background: category.color }} key={category.label}><span>{category.label}</span><small>{category.count} stories</small><ArrowUpRight /></Link>)}</div></section>
    </main>
  </AppShell>;
}

function ArrowUpRight() { return <ArrowRight size={16} className="category-arrow" />; }

export function AppShell({ children, searchValue, setSearchValue, plain = false }: { children: React.ReactNode; searchValue?: string; setSearchValue?: (value: string) => void; plain?: boolean }) {
  return <div className={`app-shell ${plain ? "app-shell-plain" : ""}`}><AppHeader searchValue={searchValue} setSearchValue={setSearchValue} />{children}<BottomNav /></div>;
}

export function Discover() {
  const [savedIds, setSavedIds] = useState<string[]>(["waiting"]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All stories");
  const filteredBooks = useMemo(() => books.filter((book) => `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(search.toLowerCase()) && (selectedCategory === "All stories" || book.category.toLowerCase().includes(selectedCategory.toLowerCase().replace("faith & growth", "faith & spiritual growth").replace("romance", "romance & relationships")))), [search, selectedCategory]);
  const handleSave = (id: string) => setSavedIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  return <AppShell searchValue={search} setSearchValue={setSearch}><main className="container page-main discover-page"><div className="page-intro"><div><p className="eyebrow eyebrow-coral">The story shelf</p><h1>Discover your next <em>favorite.</em></h1><p>Thoughtful stories for wherever you are in your own.</p></div><div className="discover-micro"><Sparkles size={18} /><span>New stories<br /><strong>every week</strong></span></div></div><div className="category-pills">{categories.map((category) => <button className={selectedCategory === category.label ? "active" : ""} onClick={() => setSelectedCategory(category.label)} key={category.label}>{category.label}<small>{category.count}</small></button>)}</div><div className="discover-toolbar"><span><strong>{filteredBooks.length * 16 + 32}</strong> stories to explore</span><button className="sort-button">Most loved <ChevronDown size={15} /></button></div>{filteredBooks.length ? <div className="book-grid book-grid-discover">{filteredBooks.map((book) => <BookCard key={book.id} book={book} saved={savedIds.includes(book.id)} onSave={handleSave} />)}</div> : <div className="empty-state"><Search size={28} /><h3>No stories found</h3><p>Try a different title, author, or category.</p></div>}</main></AppShell>;
}

export function Library() {
  const [savedIds, setSavedIds] = useState<string[]>(["waiting", "garden"]);
  const savedBooks = books.filter((book) => savedIds.includes(book.id));
  return <AppShell><main className="container page-main library-page"><div className="page-intro library-intro"><div><p className="eyebrow eyebrow-coral">Your reading room</p><h1>My <em>library.</em></h1><p>A quiet place for the stories you want to come back to.</p></div><div className="library-stats"><div><strong>02</strong><span>saved</span></div><div><strong>01</strong><span>reading</span></div><div><strong>00</strong><span>finished</span></div></div></div><section className="library-feature"><div><span className="mini-label">Currently reading</span><h2>{books[0].title}</h2><p>{books[0].description}</p><div className="library-progress"><div><span>Chapter 13 of 18</span><strong>72%</strong></div><div className="progress-line"><span style={{ width: "72%" }} /></div></div><Link href="/read/golgotha" className="button button-primary">Continue reading <ArrowRight size={17} /></Link></div><Cover book={books[0]} size="large" /></section><SectionHeading eyebrow="Saved for later" title="Your saved stories" />{savedBooks.length ? <div className="book-grid">{savedBooks.map((book) => <BookCard key={book.id} book={book} saved onSave={(id) => setSavedIds((items) => items.filter((item) => item !== id))} />)}</div> : <div className="empty-state"><Bookmark size={28} /><h3>Your shelf is waiting</h3><p>Save a story from Discover and it will appear here.</p><Link href="/discover" className="button button-primary">Find a story</Link></div>}</main></AppShell>;
}

export function BookDetail() {
  const [, params] = useRoute("/book/:id");
  const book = books.find((item) => item.id === params?.id) ?? books[0];
  const [saved, setSaved] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [review, setReview] = useState("");
  return <AppShell><main className="book-detail-page"><section className="book-detail-hero"><div className="detail-hero-inner container"><Link href="/discover" className="back-link"><ArrowLeft size={16} /> Back to discover</Link><div className="detail-grid"><div className="detail-cover-wrap"><Cover book={book} size="large" /><div className="detail-cover-shadow" /></div><div className="detail-copy"><p className="eyebrow eyebrow-coral">{book.category}</p><h1>{book.title}</h1><p className="detail-subtitle">{book.eyebrow}</p><div className="detail-author"><span className="author-avatar">{book.author.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span>Written by <strong>{book.author}</strong></span></div><div className="detail-rating"><Rating book={book} /><span className="rating-stars">★★★★★</span></div><p className="detail-description">{book.description}</p><div className="detail-actions"><Link href={`/read/${book.id}`} className="button button-primary"><BookOpen size={17} /> Read now</Link><button className={`button button-outline ${saved ? "button-saved" : ""}`} onClick={() => { setSaved((value) => !value); toast(saved ? "Removed from your library" : "Saved to your library", { icon: saved ? <Bookmark size={15} /> : <BookmarkCheck size={15} /> }); }}>{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{saved ? "Saved" : "Save"}</button><button className="icon-button" aria-label="Share story" onClick={() => toast("Share link copied") }><Share2 size={17} /></button></div><div className="detail-meta"><span><Clock3 size={15} /> {Math.floor(book.minutes / 60)}h {book.minutes % 60}m read</span><span><BookOpen size={15} /> {book.chapters} chapters</span><span><Check size={15} /> Completed</span></div></div></div></div></section><section className="container detail-body"><div className="detail-body-main"><div className="detail-section"><h2>About this story</h2><p>{book.description} This is a story for readers who enjoy a little wonder alongside their truth, and who believe that faith is allowed to ask honest questions. Settle in, take your time, and let the words meet you where you are.</p></div><div className="detail-section review-section"><div className="review-heading"><div><h2>Reader reviews</h2><p>What the Blossom community is saying</p></div><button className="button button-quiet" onClick={() => setReviewOpen((value) => !value)}><PenLine size={15} /> Write a review</button></div>{reviewOpen && <div className="review-form"><textarea value={review} onChange={(event) => setReview(event.target.value)} placeholder="What stayed with you?" rows={3} /><div><button className="button button-primary" onClick={() => { if (!review.trim()) return; setReview(""); setReviewOpen(false); toast("Your review has been added"); }}>Post review</button><button className="text-button" onClick={() => setReviewOpen(false)}>Cancel</button></div></div>}<div className="review-card"><div className="review-person"><span className="author-avatar lavender">AM</span><div><strong>Amaka N.</strong><span>2 weeks ago</span></div><span className="review-stars">★★★★★</span></div><p>“A tender, brave story. I loved the way hope was treated as a practice, not just a feeling.”</p><button className="helpful-button"><Heart size={14} /> Helpful · 18</button></div><div className="review-card"><div className="review-person"><span className="author-avatar peach">JO</span><div><strong>Joshua O.</strong><span>1 month ago</span></div><span className="review-stars">★★★★★</span></div><p>“The kind of book you finish and immediately want to talk about with someone.”</p><button className="helpful-button"><Heart size={14} /> Helpful · 11</button></div></div></div><aside className="detail-sidebar"><div className="author-card"><span className="mini-label">Meet the author</span><div className="author-card-person"><span className="large-author-avatar">OM</span><div><h3>{book.author}</h3><p>Writer · Storyteller · Christian creative</p></div></div><p>Writing stories about ordinary people finding extraordinary courage in everyday faith.</p><button className="button button-outline full-button">Follow author <span>128 followers</span></button></div><div className="more-card"><span className="mini-label">Keep exploring</span><h3>More like this</h3>{books.slice(2, 4).map((item) => <Link className="more-item" href={`/book/${item.id}`} key={item.id}><Cover book={item} size="small" /><span><strong>{item.title}</strong><small>{item.author}</small></span><ArrowRight size={14} /></Link>)}</div></aside></section></main></AppShell>;
}

export function Reader() {
  const [, params] = useRoute("/read/:id");
  const book = books.find((item) => item.id === params?.id) ?? books[0];
  const [chapter, setChapter] = useState(0);
  const [fontSize, setFontSize] = useState("medium");
  const [showSettings, setShowSettings] = useState(false);
  const current = chapterCopy[chapter % chapterCopy.length];
  return <div className="reader-page"><header className="reader-header"><Link href={`/book/${book.id}`} className="reader-back"><ArrowLeft size={18} /><span>Exit reading</span></Link><div className="reader-title"><span>{book.title}</span><small>by {book.author}</small></div><div className="reader-tools"><span className="reader-progress-label">{Math.round(((chapter + 1) / book.chapters) * 100)}% complete</span><button onClick={() => setShowSettings((value) => !value)} aria-label="Reading settings"><MoreHorizontal size={20} /></button></div>{showSettings && <div className="reader-settings"><span>Text size</span><div><button className={fontSize === "small" ? "selected" : ""} onClick={() => setFontSize("small")}>A</button><button className={fontSize === "medium" ? "selected" : ""} onClick={() => setFontSize("medium")}>A</button><button className={fontSize === "large" ? "selected" : ""} onClick={() => setFontSize("large")}>A</button></div></div>}</header><div className="reader-progress"><span style={{ width: `${Math.max(6, ((chapter + 1) / book.chapters) * 100)}%` }} /></div><main className={`reader-content reader-font-${fontSize}`}><div className="reader-chapter-kicker"><span>Chapter {chapter + 1}</span><span>•</span><span>8 min read</span></div><h1>{current.title}</h1><div className="chapter-rule"><span>✦</span></div><div className="reader-prose"><p className="drop-cap">{current.body}</p><p>She had spent the morning making a list of all the reasons to turn around. The paper was full by lunchtime. Then a child across the road laughed, a bright little sound that refused to be explained by the weather, and she folded the list into her pocket.</p><blockquote>“Faith is not pretending the night is gone. It is learning where to place your feet while you wait for morning.”</blockquote><p>There are moments when a story stops being something you are reading and starts becoming a room you are standing inside. This was one of those moments. Nkem looked toward the road, toward the people moving together, and took the next step.</p></div><div className="reader-next"><button className="reader-nav-button" disabled={chapter === 0} onClick={() => setChapter((value) => Math.max(0, value - 1))}><ArrowLeft size={17} /> Previous</button><span>{chapter + 1} / {book.chapters}</span><button className="reader-nav-button next" onClick={() => { if (chapter < book.chapters - 1) setChapter((value) => value + 1); else toast("You finished this story — thank you for reading.", { icon: <Sparkles size={15} /> }); }}>Next chapter <ArrowRight size={17} /></button></div></main></div>;
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

export { books };
