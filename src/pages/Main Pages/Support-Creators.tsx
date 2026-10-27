import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { FRAME_CATALOG, type ProfileAssetUser } from "@/pages/Everypony/profile-assets";
import { supabase } from "@/lib/supabase";
const membershipFrames = ["frame011", "frame012", "frame013"].map(id => FRAME_CATALOG.find(frame => frame.id === id)).filter((frame): frame is NonNullable<typeof frame> => Boolean(frame));
const pageCSS = `
.sc-page{--sc-bg:#101213;--sc-text:#f4f4f1;--sc-muted:#a2a7a6;--sc-border:rgba(255,255,255,.13);--sc-accent:hsl(var(--primary));width:100%;min-width:0;background:var(--sc-bg);color:var(--sc-text);padding:28px clamp(18px,3vw,64px) 50px;font-family:'Oxanium',sans-serif}
.sc-page[data-light=true]{--sc-bg:#f5f5f3;--sc-text:#242726;--sc-muted:#626864;--sc-border:rgba(0,0,0,.14)}
.sc-page *{box-sizing:border-box}.sc-page a:focus-visible{outline:2px solid var(--sc-accent);outline-offset:5px;border-radius:10px}.sc-page h1,.sc-page h2,.sc-page h3,.sc-page p{margin:0}.sc-page p{line-height:1.75}.sc-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:22px;border-bottom:1px solid var(--sc-border)}.sc-heading h1{font-size:clamp(25px,3vw,40px);line-height:1.15;font-weight:600;letter-spacing:-.035em}.sc-heading p{font-size:13px;color:var(--sc-muted);margin-top:8px}.sc-back{color:var(--sc-muted);font-size:12px;white-space:nowrap}.sc-section-title{font-size:23px;font-weight:600;letter-spacing:-.025em}.sc-body{font-size:14px;color:var(--sc-muted)}.sc-support{display:grid;grid-template-columns:minmax(200px,.65fr) minmax(0,1.7fr);gap:clamp(24px,4vw,70px);padding:32px 0}.sc-owner-image{width:100%;height:100%;max-height:355px;min-height:240px;object-fit:contain;border-radius:22px}.sc-support-intro{max-width:85ch;margin-top:12px!important}.sc-options{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:26px}.sc-options h3{font-size:17px;font-weight:600;margin-bottom:9px}.sc-options strong{color:var(--sc-text);font-weight:600}.sc-action{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:43px;padding:10px 16px;border:1px solid var(--sc-border);border-radius:12px;font-size:13px;font-weight:600;transition:background .18s,border-color .18s;max-width:100%;margin-top:17px}.sc-action:hover{border-color:var(--sc-accent);background:color-mix(in srgb,var(--sc-accent) 8%,transparent)}.sc-action svg{width:16px;height:16px;flex-shrink:0}.sc-action-primary{background:var(--sc-accent);border-color:transparent;color:hsl(var(--primary-foreground))}.sc-action-primary:hover{background:var(--sc-accent);filter:brightness(1.08)}
.sc-memberships{border-top:1px solid var(--sc-border);border-bottom:1px solid var(--sc-border);padding:30px 0;display:grid;grid-template-columns:minmax(230px,.85fr) minmax(0,1.5fr);gap:40px}.sc-memberships h3{font-size:19px;font-weight:600;margin-bottom:12px}.sc-memberships p+p{margin-top:12px}.sc-memberships strong{color:var(--sc-text);font-weight:600}.sc-preview-note{font-size:12px;color:var(--sc-muted);text-align:center}.sc-previews{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.sc-frame{text-align:center;min-width:0}.sc-frame-art{height:185px;display:flex;align-items:center;justify-content:center;padding:35px 22px}.sc-frame-avatar{width:90px;max-width:100%}.sc-price{font-size:21px;font-weight:600;white-space:nowrap}.sc-price span{font-size:11px;font-weight:400;color:var(--sc-muted)}.sc-frame-label{font-size:11px;color:var(--sc-muted);margin-top:5px!important}
.sc-community{padding-top:32px}.sc-creators{display:grid;grid-template-columns:1fr 1fr;column-gap:clamp(24px,4vw,70px);margin-top:24px}.sc-creator{min-width:0;display:flex;flex-direction:column;padding-bottom:28px}.sc-product{display:block;aspect-ratio:1.85;overflow:hidden;border-radius:22px;margin-bottom:20px}.sc-product img{display:block;width:100%;height:100%;object-fit:contain;transition:transform .35s}.sc-product:hover img{transform:scale(1.025)}.sc-creator h3{font-size:24px;font-weight:600;letter-spacing:-.025em}.sc-byline{font-size:12px;color:var(--sc-muted);margin-top:4px!important}.sc-creator .sc-body{margin-top:11px;max-width:65ch}.sc-creator .sc-action{align-self:flex-start}.sc-ponyrec{display:flex;justify-content:space-between;align-items:center;gap:24px;border-top:1px solid var(--sc-border);border-bottom:1px solid var(--sc-border);padding:25px 0;margin-top:4px}.sc-ponyrec h3{font-size:24px;font-weight:600;letter-spacing:-.025em}.sc-ponyrec .sc-body{margin-top:8px}.sc-ponyrec .sc-action{margin:0;flex-shrink:0}.sc-foot{padding-top:22px;font-size:12px;color:var(--sc-muted)}
@media(min-width:1600px){.sc-support{grid-template-columns:minmax(260px,.7fr) minmax(0,2fr)}.sc-owner-image{max-height:320px}.sc-frame-art{height:210px}.sc-frame-avatar{width:105px}}
@media(max-width:850px){.sc-support{grid-template-columns:180px minmax(0,1fr);gap:24px}.sc-options{grid-template-columns:1fr;gap:24px}.sc-owner-image{align-self:start;min-height:0;height:auto;max-height:290px}.sc-memberships{grid-template-columns:1fr;gap:14px}.sc-preview-note{text-align:left}.sc-frame-art{height:185px}.sc-frame-avatar{width:90px}}
@media(max-width:540px){.sc-page{padding-top:20px}.sc-heading{align-items:flex-start}.sc-back{font-size:11px;padding-top:5px}.sc-support{grid-template-columns:1fr;gap:18px;padding:24px 0}.sc-owner-image{width:150px;height:150px;justify-self:start;object-fit:contain}.sc-section-title{font-size:22px}.sc-options{margin-top:22px;gap:22px}.sc-previews{gap:4px}.sc-frame-art{height:145px;padding:30px 15px}.sc-frame-avatar{width:64px}.sc-price{font-size:20px}.sc-price span{display:block;margin-top:3px}.sc-frame-label{font-size:10px}.sc-creators{grid-template-columns:1fr;gap:24px}.sc-creator{padding-bottom:24px;border-bottom:1px solid var(--sc-border)}.sc-product{aspect-ratio:1.5}.sc-ponyrec{margin-top:0;border-top:0;padding-top:0;align-items:flex-start;flex-direction:column;gap:16px}.sc-creator h3,.sc-ponyrec h3{font-size:23px}}
@media(prefers-reduced-motion:reduce){.sc-page *{animation:none!important;transition:none!important}}
`;
function Outbound({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  return <a className={`sc-action${primary ? " sc-action-primary" : ""}`} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>;
}
export default function SupportCreators() {
  const [light, setLight] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.theme === "light");
  const client = useQueryClient();
  const { data: viewer, isPending, isError } = useQuery({
    queryKey: ["support-creators-avatar"],
    queryFn: async (): Promise<ProfileAssetUser | null> => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session?.user) return null;
      const result = await supabase.from("profiles").select("id, avatar_url, avatar_frame").eq("id", data.session.user.id).maybeSingle();
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  useEffect(() => {
    const sync = () => setLight(document.documentElement.dataset.theme === "light");
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === "SIGNED_OUT") client.setQueryData(["support-creators-avatar"], null);
      if (event === "SIGNED_IN" || event === "USER_UPDATED") void client.invalidateQueries({ queryKey: ["support-creators-avatar"] });
    });
    sync();
    return () => { observer.disconnect(); subscription.unsubscribe(); };
  }, [client]);
  return <main className="sc-page" data-light={light}>
    <style>{pageCSS}</style>
    <header className="sc-heading"><div><h1>Support creators</h1><p>MLPEKAYOU and other projects from the community.</p></div><Link to="/" className="sc-back">Back to home</Link></header>
    <section className="sc-support" aria-labelledby="sc-support-title">
      <img className="sc-owner-image" src="/kayou's-assets/IMG_0567.webp" alt="MLPEKAYOU" decoding="async"/>
      <div><h2 id="sc-support-title" className="sc-section-title">Support MLPEKAYOU</h2><p className="sc-body sc-support-intro">I’m Keegan, a disabled veteran running MLPEKAYOU with no advertisements or paywalls. If you’d like to help with the cost of keeping the website running, you can support me through StonesTradingCo or Ko-Fi.</p>
        <div className="sc-options"><div><h3>StonesTradingCo</h3><p className="sc-body">Shop their My Little Pony collection and select <strong>MLPEKAYOU</strong> under “Where did you hear about us?” at checkout. Your purchase earns me a commission at no additional cost to you.</p><Outbound href="https://stonestradingco.com/collections/my-little-pony" primary>Shop StonesTradingCo</Outbound></div><div><h3>Ko-Fi</h3><p className="sc-body">Support me directly with a contribution or a monthly membership. The $20, $50, and $100 USD monthly memberships also come with the profile frames shown below.</p><Outbound href="https://ko-fi.com/mlpekayou">Support on Ko-Fi</Outbound></div></div>
      </div>
    </section>
    <section className="sc-memberships" aria-labelledby="sc-frames-title">
      <div><h3 id="sc-frames-title">Ko-Fi membership frames</h3><p className="sc-body">After subscribing, open your avatar settings and request the matching frame. Enter the public name your membership appears under on the MLPEKAYOU Ko-Fi homepage so a moderator can verify it.</p><p className="sc-body"><strong>These frames are permanent.</strong> I never take these frames away if your membership ends. They’re a thank-you from me for supporting MLPEKAYOU.</p><Link className="sc-action" to="/Personal/change-avatar">View frames &amp; request approval <ArrowUpRight aria-hidden="true"/></Link></div>
      <div><p className="sc-preview-note">{isPending ? "Loading your avatar…" : viewer ? "Your current avatar with each membership frame" : isError ? "Example previews · your avatar could not be loaded" : "Sign in to preview these with your avatar"}</p><div className="sc-previews">{membershipFrames.map(frame => <div className="sc-frame" key={frame.id}><div className="sc-frame-art"><ProfileAvatar profile={viewer} preview frameId={frame.id} alt={`${frame.name} preview`} className="sc-frame-avatar rounded-2xl"/></div><div className="sc-price">${frame.kofiMonthly} <span>USD / month</span></div><p className="sc-frame-label">Permanent unlock</p></div>)}</div></div>
    </section>
    <section className="sc-community" aria-labelledby="sc-community-title"><h2 className="sc-section-title" id="sc-community-title">Community creators</h2><div className="sc-creators">
      <article className="sc-creator"><a className="sc-product" href="https://www.doodlebinder.com" target="_blank" rel="noopener noreferrer" aria-label="Browse Eternal’s binders on DoodleBinder (opens in a new tab)"><img src="/website-assets/binder3custom.webp" alt="Eternal’s custom binder" loading="lazy" decoding="async"/></a><h3>Eternal’s custom binders</h3><p className="sc-byline">DoodleBinder</p><p className="sc-body">Custom binders by Eternal, available at DoodleBinder.</p><Outbound href="https://www.doodlebinder.com">Browse binders</Outbound></article>
      <article className="sc-creator"><a className="sc-product" href="https://trulynerdy.com/collections/playmats" target="_blank" rel="noopener noreferrer" aria-label="Browse Carly K’s work on Truly Nerdy (opens in a new tab)"><img src="/website-assets/carlykmats.webp" alt="Carly K’s custom playmats" loading="lazy" decoding="async"/></a><h3>Carly K’s custom creations</h3><p className="sc-byline">Truly Nerdy</p><p className="sc-body">Custom playmats, binders, and more from Carly K.</p><Outbound href="https://trulynerdy.com/collections/playmats">Visit Truly Nerdy</Outbound></article>
    </div><article className="sc-ponyrec"><div><h3>PonyRec</h3><p className="sc-byline">By Tangent</p><p className="sc-body">Tangent’s website for the My Little Pony trading card game.</p></div><Outbound href="https://ponyrec.net">Visit PonyRec</Outbound></article></section>
    <footer className="sc-foot">Purchases and Ko-Fi support are optional. MLPEKAYOU remains free to use.</footer>
  </main>;
}
