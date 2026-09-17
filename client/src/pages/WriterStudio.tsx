import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, Feather, FileText, Loader2, PenLine, Plus, Send, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

type Kind = "journal" | "announcement";
type Draft = { id: number; title?: string; excerpt?: string; body: string; status: string; updatedAt?: Date | string; createdAt: Date | string };
const dateLabel = (value?: Date | string) => value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Just now";

export default function WriterStudio() {
  const { isAuthenticated, loading } = useAuth();
  const [kind, setKind] = useState<Kind>("journal");
  const [draftId, setDraftId] = useState<number>();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Personal reflection");
  const [preview, setPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const draftsQuery = trpc.writer.drafts.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const save = trpc.writer.saveDraft.useMutation({ onSuccess: (result) => { setDraftId(result.id); setLastSaved("Saved just now"); void utils.writer.drafts.invalidate(); }, onError: (error) => toast(error.message || "Could not save draft") });
  const publish = trpc.writer.publish.useMutation({ onSuccess: () => { setLastSaved("Published just now"); toast("Published to Blossom", { icon: <Check size={15} /> }); void utils.writer.drafts.invalidate(); }, onError: (error) => toast(error.message || "Could not publish") });
  const journalDrafts = (draftsQuery.data?.journals ?? []) as Draft[];
  const announcementDrafts = (draftsQuery.data?.announcements ?? []) as Draft[];
  const drafts = useMemo(() => kind === "journal" ? journalDrafts : announcementDrafts, [announcementDrafts, journalDrafts, kind]);
  const selectDraft = (nextKind: Kind, draft?: Draft) => { setKind(nextKind); setDraftId(draft?.id); setTitle(draft?.title ?? ""); setExcerpt(draft?.excerpt ?? ""); setBody(draft?.body ?? ""); setCategory("Personal reflection"); setPreview(false); setLastSaved(null); };
  const saveDraft = () => { if (kind === "journal" && !title.trim() && !body.trim()) return toast("Start with a title or a few words"); if (kind === "announcement" && !body.trim()) return toast("Write an announcement before saving"); save.mutate({ type: kind, id: draftId, title, excerpt, body, category }); };
  useEffect(() => { if (!isAuthenticated || (!title && !excerpt && !body)) return; const timer = window.setTimeout(saveDraft, 1400); return () => window.clearTimeout(timer); }, [title, excerpt, body, category]);
  if (loading) return <div className="studio-loading"><Loader2 className="spin" size={22} /> Loading your studio...</div>;
  if (!isAuthenticated) return <main className="studio-guest"><Sparkles size={28} /><p className="eyebrow eyebrow-coral">The writer’s desk</p><h1>Your words deserve a <em>room.</em></h1><p>Sign in to create, save, preview, and publish journals and announcements.</p><button className="button button-primary" onClick={() => startLogin()}>Sign in to write <ArrowRight size={16} /></button></main>;
  return <div className="writer-studio">
    <header className="studio-header"><Link href="/community" className="back-link"><ArrowLeft size={16} /> Community</Link><div className="studio-brand"><span className="brand-mark"><span /></span><strong>Writer Studio</strong></div><div className="studio-header-actions"><span className="studio-save-state">{save.isPending ? "Saving…" : lastSaved ?? "All changes saved"}</span><button className="button button-outline" onClick={() => setPreview((value) => !value)}><Eye size={15} /> {preview ? "Edit" : "Preview"}</button><button className="button button-primary" disabled={publish.isPending || !draftId} onClick={() => draftId && publish.mutate({ type: kind, id: draftId })}><Send size={15} /> Publish</button></div></header>
    <div className="studio-body">
      <aside className="studio-sidebar"><div className="studio-sidebar-top"><div><span className="mini-label">Your writing</span><h2>Drafts</h2></div><button className="icon-button" onClick={() => selectDraft(kind)} aria-label="New draft"><Plus size={17} /></button></div><div className="studio-kind-tabs"><button className={kind === "journal" ? "active" : ""} onClick={() => selectDraft("journal", journalDrafts[0])}><Feather size={14} /> Journals</button><button className={kind === "announcement" ? "active" : ""} onClick={() => selectDraft("announcement", announcementDrafts[0])}><FileText size={14} /> Announcements</button></div><div className="draft-list">{drafts.map((draft) => <button className={`draft-row ${draft.id === draftId ? "selected" : ""}`} key={draft.id} onClick={() => selectDraft(kind, draft)}><span className="draft-status" /><span><strong>{draft.title || (kind === "journal" ? "Untitled journal" : "Untitled announcement")}</strong><small>{dateLabel(draft.updatedAt ?? draft.createdAt)} · {draft.status}</small></span></button>)}{drafts.length === 0 && <div className="studio-empty"><PenLine size={18} /><p>No {kind} drafts yet.</p><button onClick={() => selectDraft(kind)}>Create one <ArrowRight size={13} /></button></div>}</div><button className="new-draft-link" onClick={() => selectDraft(kind)}><Plus size={14} /> New {kind}</button></aside>
      <main className={`studio-editor ${preview ? "is-preview" : ""}`}>
        {preview ? <Preview kind={kind} title={title} excerpt={excerpt} body={body} /> : <><div className="editor-kicker"><span className="eyebrow eyebrow-coral">{kind === "journal" ? "Journal" : "Announcement"}</span><span>{draftId ? `Draft #${draftId}` : "New draft"}</span></div>{kind === "journal" ? <JournalEditor title={title} setTitle={setTitle} excerpt={excerpt} setExcerpt={setExcerpt} body={body} setBody={setBody} saveDraft={saveDraft} saving={save.isPending} /> : <AnnouncementEditor body={body} setBody={setBody} saveDraft={saveDraft} saving={save.isPending} />}</>}
      </main>
    </div>
  </div>;
}
function JournalEditor({ title, setTitle, excerpt, setExcerpt, body, setBody, saveDraft, saving }: { title: string; setTitle: (value: string) => void; excerpt: string; setExcerpt: (value: string) => void; body: string; setBody: (value: string) => void; saveDraft: () => void; saving: boolean }) { return <><input className="studio-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give your journal a title" /><textarea className="studio-excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="A short introduction for your readers" rows={2} /><div className="studio-rule" /><textarea className="studio-body-input" value={body} onChange={(event) => setBody(event.target.value)} placeholder={"Write from where you are…\n\nLet the first honest sentence be enough."} rows={18} /><EditorFooter label="Write honestly. Edit gently." saveDraft={saveDraft} saving={saving} /> </>; }
function AnnouncementEditor({ body, setBody, saveDraft, saving }: { body: string; setBody: (value: string) => void; saveDraft: () => void; saving: boolean }) { return <><textarea className="studio-announcement-input" value={body} onChange={(event) => setBody(event.target.value)} placeholder="What would you like your readers to know?" rows={12} /><div className="announcement-hint"><Sparkles size={16} /><div><strong>A good announcement is useful.</strong><p>Share a milestone, a new release, or a small note your followers will appreciate.</p></div></div><EditorFooter label="Visible to your followers after publishing." saveDraft={saveDraft} saving={saving} /></>; }
function EditorFooter({ label, saveDraft, saving }: { label: string; saveDraft: () => void; saving: boolean }) { return <div className="studio-editor-footer"><span><Sparkles size={14} /> {label}</span><button className="button button-primary" onClick={saveDraft} disabled={saving}>{saving ? "Saving…" : "Save draft"} <Check size={15} /></button></div>; }
function Preview({ kind, title, excerpt, body }: { kind: Kind; title: string; excerpt: string; body: string }) { return <article className="studio-preview"><span className="journal-kicker">{kind === "journal" ? <><Feather size={15} /> Journal preview</> : <><FileText size={15} /> Announcement preview</>}</span><h1>{title || (kind === "journal" ? "Your journal title" : "Your announcement")}</h1>{kind === "journal" && <p className="journal-lead">{excerpt || "Your introduction will appear here."}</p>}{body ? body.split(/\n+/).map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>) : <p className="studio-placeholder">Your writing will appear here as you type.</p>}</article>; }
