import { useEffect, useRef, useState, type CSSProperties } from "react";
type MLPEKAYOUFooterProps = { className?: string; reserveMobileNavigationSpace?: boolean };
const email = "mlpekayou@gmail.com";
const footerStyles = `
.mlpekayou-footer{box-sizing:border-box;position:relative;width:100%;min-width:0;border-top:1px solid hsl(var(--border));background:hsl(var(--background));color:hsl(var(--foreground));font-family:inherit;padding:26px clamp(16px,3vw,48px) 22px;isolation:isolate}
.mlpekayou-footer *{box-sizing:border-box}.mlpf-inner{display:grid;grid-template-columns:minmax(150px,1fr) minmax(260px,1.4fr) auto;grid-template-areas:"brand contact links";align-items:center;gap:22px;max-width:1600px;margin:0 auto}.mlpf-brand{grid-area:brand}.mlpf-name{margin:0;font-size:15px;font-weight:750;letter-spacing:.025em}.mlpf-copyright{margin:6px 0 0;color:hsl(var(--muted-foreground));font-size:11px;line-height:1.5}.mlpf-contact{grid-area:contact;min-width:0}.mlpf-heading{margin:0 0 5px;font-size:12px;font-weight:650;color:hsl(var(--muted-foreground))}.mlpf-email-row{display:flex;align-items:center;gap:10px;min-width:0}.mlpf-email{display:inline-flex;align-items:center;gap:9px;min-width:0;min-height:44px;color:hsl(var(--foreground));font-size:15px;font-weight:600;text-decoration:none}.mlpf-email span{overflow-wrap:anywhere}.mlpf-email svg{flex:none;width:18px;height:18px;color:hsl(var(--primary))}.mlpf-email:hover span{text-decoration:underline;text-decoration-color:hsl(var(--primary));text-underline-offset:5px}.mlpf-copy{display:inline-flex;flex:none;align-items:center;justify-content:center;width:44px;height:44px;border:0;border-radius:8px;background:transparent;color:hsl(var(--muted-foreground));cursor:pointer;transition:background .18s,color .18s}.mlpf-copy:hover{background:hsl(var(--muted));color:hsl(var(--foreground))}.mlpf-copy svg{width:17px;height:17px}.mlpf-links{grid-area:links;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px 20px}.mlpf-link{display:inline-flex;align-items:center;gap:6px;min-height:44px;color:hsl(var(--muted-foreground));font-size:12px;text-decoration:none;transition:color .18s}.mlpf-link:hover{color:hsl(var(--foreground));text-decoration:underline;text-underline-offset:5px}.mlpf-link svg{width:13px;height:13px}.mlpekayou-footer a:focus-visible,.mlpf-copy:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:4px;border-radius:4px}.mlpf-status{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
@media(max-width:767px){.mlpekayou-footer{padding:20px 16px calc(18px + env(safe-area-inset-bottom,0px) + var(--mlpf-mobile-clearance,0px))}.mlpf-inner{grid-template-columns:minmax(0,1fr);grid-template-areas:"contact" "links" "brand";gap:8px}.mlpf-heading{font-size:14px;color:hsl(var(--foreground));margin-bottom:2px}.mlpf-email{font-size:clamp(13px,4vw,16px)}.mlpf-email-row{justify-content:space-between;gap:4px}.mlpf-links{justify-content:flex-start;gap:4px 22px}.mlpf-brand{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 12px;margin-top:4px;padding-top:12px;border-top:1px solid hsl(var(--border))}.mlpf-name{font-size:12px}.mlpf-copyright{margin:0;font-size:10px}}
@media(prefers-reduced-motion:reduce){.mlpekayou-footer *{transition:none!important}}
`;
export default function MLPEKAYOUFooter({ className = "", reserveMobileNavigationSpace = true }: MLPEKAYOUFooterProps) {
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); }; }, []);
  const copyEmail = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(email);
      if (!mounted.current) return;
      setCopied(true); setAnnouncement("Email address copied.");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { setCopied(false); setAnnouncement(""); }, 2200);
    } catch { if (mounted.current) setAnnouncement("Select the email address to copy it, or click it to send an email."); }
  };
  return <footer className={`mlpekayou-footer ${className}`} aria-label="MLPEKAYOU contact and community" style={{ "--mlpf-mobile-clearance": reserveMobileNavigationSpace ? "96px" : "0px" } as CSSProperties}>
    <style>{footerStyles}</style>
    <div className="mlpf-inner">
      <div className="mlpf-brand"><p className="mlpf-name">MLPEKAYOU</p><p className="mlpf-copyright">© {new Date().getFullYear()} MLPEKAYOU</p></div>
      <div className="mlpf-contact"><h2 className="mlpf-heading">Contact MLPEKAYOU</h2><div className="mlpf-email-row"><a className="mlpf-email" href={`mailto:${email}`} aria-label={`Email Keegan at ${email}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg><span>{email}</span></a><button className="mlpf-copy" type="button" onClick={() => void copyEmail()} aria-label={copied ? "Email address copied" : "Copy email address"} title={copied ? "Copied" : "Copy email address"}>{copied ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>}</button></div></div>
      <nav className="mlpf-links" aria-label="Community and support"><a className="mlpf-link" href="https://discord.gg/mlpekayou" target="_blank" rel="noopener noreferrer">Discord<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg><span className="mlpf-status"> (opens in a new tab)</span></a><a className="mlpf-link" href="https://ko-fi.com/Q2Y429HP6N" target="_blank" rel="noopener noreferrer">Support MLPEKAYOU<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg><span className="mlpf-status"> (opens in a new tab)</span></a></nav>
    </div>
    <span className="mlpf-status" role="status" aria-live="polite">{announcement}</span>
  </footer>;
}
