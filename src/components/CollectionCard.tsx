import CardImage from "@/components/CardImage";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
interface CollectionCardProps {
  id: string;
  title: string;
  setName?: string;
  imageUrl: string;
  totalCards: number;
  collectedCards?: number;
  progress?: number;
  showProgress?: boolean;
}
const CollectionCard = ({ id, title, setName, imageUrl, totalCards, collectedCards = 0, progress = 0, showProgress = true }: CollectionCardProps) => {
  const navigate = useNavigate();
  const [showAccessWarning, setShowAccessWarning] = useState(false);
  const getLink = () => {
    switch (id) {
      case "1": return "/moon-one";
      case "2": return "/moon-two";
      case "5": return "/rainbow-one";
      case "13": return "/moon-four";
      case "3": return "/moon-three";
      case "4": return "/star-one";
      case "6":
      case "rainbow2": return "/rainbow-two";
      case "tcg": return "/fantasy-wonderland";
      case "friendshipsbegin": return "/friendships-begin";
      case "9": return "/promotional-cards";
      case "7": return "/fun-moments-one";
      case "8": return "/fun-moments-two";
      case "11": return "/fun-moments-three";
      case "12": return "/discord";
      case "hearthswarming-eve": return "/hearthswarming-eve";
      case "14": return "/nightmare-night";
      default: return `/collection/${id}`;
    }
  };
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      e.preventDefault();
      setShowAccessWarning(true);
    }
  };
  const safeProgress = Math.min(100, Math.max(0, progress));
  const displayName = id === "9" ? "All Promotional Cards" : `${title}${setName && setName !== "TCG" ? ` ${setName}` : ""}`;
  if (showAccessWarning) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md">
        <div className="w-full max-w-md border border-white/10 bg-[#151718] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,.4)] sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center bg-[#FFD54A]/10 text-xl font-semibold text-[#FFE27A]">!</div>
          <h2 className="mt-5 text-2xl font-semibold">Account required</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-base">You need to sign in or create an account before opening collection pages.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setShowAccessWarning(false)} className="border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/[0.08]">Cancel</button>
            <button type="button" onClick={() => navigate("/")} className="bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black hover:bg-[#FFE27A]">Go Home</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Link to={getLink()} onClick={handleClick} className="collection-tile">
      <div className="collection-tile-art">
        <CardImage src={imageUrl} alt={displayName} draggable={false} className="collection-tile-image" />
      </div>
      <div className="collection-tile-body">
        <div className="collection-tile-title"><h2>{displayName}</h2></div>
        {showProgress ? (
          <div className="collection-tile-progress">
            <div className="collection-tile-count"><span><strong>{collectedCards.toLocaleString()}</strong><span> / {totalCards.toLocaleString()}</span></span><strong className="collection-tile-percent">{safeProgress}%</strong></div>
            <div className="collection-tile-track" role="progressbar" aria-label={`${displayName} collected`} aria-valuenow={safeProgress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${safeProgress}%` }} /></div>
            <div className="collection-tile-detail">{safeProgress === 100 ? <><Check size={12} />Set complete</> : <><span>{Math.max(0, totalCards - collectedCards).toLocaleString()} remaining</span><span className="collection-tile-checklist">View checklist<ArrowUpRight size={11} aria-hidden="true" /></span></>}</div>
          </div>
        ) : <div className="collection-tile-detail"><span>{totalCards.toLocaleString()} cards</span><span className="collection-tile-checklist">View checklist<ArrowUpRight size={11} aria-hidden="true" /></span></div>}
      </div>
      <style>{`
.collection-tile{display:block;height:100%;overflow:hidden;border:1px solid #ffffff13;border-radius:16px;background:#191b1e;color:#f4f4f5;text-decoration:none;transition:border-color .2s,box-shadow .2s;--tile-muted:#92969e;--tile-accent:hsl(var(--primary))}
html[data-theme="light"] .collection-tile{background:#fff;color:#202226;border-color:#00000015;--tile-muted:#70747c}
.collection-tile-art{position:relative;aspect-ratio:4/3;overflow:hidden;background:#00000009}
.collection-tile-image{display:block;width:100%;height:100%;object-fit:cover;object-position:center;transition:transform .35s ease}
.collection-tile-body{padding:10px}
.collection-tile-title{min-height:0;display:flex;flex-direction:column;align-items:flex-start;gap:3px}
.collection-tile-title h2{margin:0;font-size:13px;line-height:1.3;font-weight:650;letter-spacing:-.025em}
.collection-tile-progress{margin-top:8px;padding-top:8px;border-top:1px solid #80808026}
.collection-tile-count{display:flex;align-items:baseline;justify-content:space-between;gap:5px;font-variant-numeric:tabular-nums}
.collection-tile-count>span>strong{font-size:17px;font-weight:650;letter-spacing:-.04em}
.collection-tile-count>span>span{font-size:11px;color:var(--tile-muted)}
.collection-tile-percent{font-size:12px;color:var(--tile-accent)}
.collection-tile-track{height:5px;overflow:hidden;border-radius:5px;background:#80808025;margin:6px 0 6px}
.collection-tile-track>span{display:block;height:100%;border-radius:inherit;background:var(--tile-accent);transition:width .65s cubic-bezier(.2,.7,.2,1)}
.collection-tile-detail{display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:9px;line-height:1.5;color:var(--tile-muted)}
.collection-tile-checklist{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.collection-tile-detail>svg{color:var(--tile-accent)}
.collection-tile:focus-visible{outline:2px solid var(--tile-accent);outline-offset:3px}
@media(hover:hover){.collection-tile:hover{border-color:var(--tile-accent);box-shadow:0 8px 25px #0002}.collection-tile:hover .collection-tile-image{transform:scale(1.035)}.collection-tile:hover .collection-tile-detail>span:last-child{color:var(--tile-accent)}}
@media(max-width:480px){.collection-tile-body{padding:9px}.collection-tile-title h2{font-size:13px}.collection-tile-count>span>strong{font-size:17px}.collection-tile-detail{font-size:8px}}
@media(prefers-reduced-motion:reduce){.collection-tile,.collection-tile *{transition:none!important}}
      `}</style>
    </Link>
  );
};
export default CollectionCard;
