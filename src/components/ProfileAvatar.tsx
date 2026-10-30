import type { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { FRAME_CATALOG, getAvatar, getAvatarFrame, type ProfileAssetUser } from "@/pages/Everypony/profile-assets";
const db = supabase as unknown as SupabaseClient;
const wingMotionCSS = `
@keyframes mlpe-kofi-left-wing{0%,16%,100%{transform:rotate(0deg) scaleX(1)}48%,56%{transform:rotate(9deg) scaleX(.77)}}
@keyframes mlpe-kofi-right-wing{0%,16%,100%{transform:rotate(0deg) scaleX(1)}48%,56%{transform:rotate(-9deg) scaleX(.77)}}
.mlpe-kofi-wing{position:absolute;inset:0;transform-origin:50% 43%;animation-duration:4.8s;animation-timing-function:cubic-bezier(.45,0,.25,1);animation-iteration-count:infinite;pointer-events:none}
.mlpe-kofi-wing-left{clip-path:inset(0 50% 0 0);-webkit-clip-path:inset(0 50% 0 0);animation-name:mlpe-kofi-left-wing}
.mlpe-kofi-wing-right{clip-path:inset(0 0 0 50%);-webkit-clip-path:inset(0 0 0 50%);animation-name:mlpe-kofi-right-wing}
.mlpe-kofi-halo{opacity:.48;filter:brightness(0) invert(1) sepia(.28) blur(9px);animation:mlpe-kofi-heavenly-halo 8s ease-in-out infinite;pointer-events:none}.mlpe-kofi-halo-core{filter:brightness(0) invert(1) sepia(.16) blur(2.5px)}
@keyframes mlpe-kofi-heavenly-halo{0%,100%{opacity:.4}50%{opacity:.78}}
@media(prefers-reduced-motion:reduce){.mlpe-kofi-wing{animation:none;transform:none}.mlpe-kofi-halo{animation:none;opacity:.58}}
`;
type ProfileAvatarProps = { profile?: ProfileAssetUser | null; src?: string; frameId?: string | null; preview?: boolean; alt?: string; className?: string; style?: CSSProperties };
export const avatarFrameQueryKey = (userId: string) => ["avatar-frame", userId] as const;
export default function ProfileAvatar({ profile, src, frameId, preview = false, alt = "", className = "h-12 w-12 rounded-2xl", style }: ProfileAvatarProps) {
  const [isLightMode, setIsLightMode] = useState(() => document.documentElement.dataset.theme === "light");
  useEffect(() => {
    const syncTheme = () => setIsLightMode(document.documentElement.dataset.theme === "light");
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    syncTheme();
    return () => observer.disconnect();
  }, []);
  const userId = profile?.id ?? "";
  const { data } = useQuery({
    queryKey: avatarFrameQueryKey(userId), enabled: Boolean(userId) && !preview,
    queryFn: async () => {
      const { data, error } = await db.from("profiles").select("avatar_frame").eq("id", userId).maybeSingle();
      if (error) throw error;
      return data?.avatar_frame ?? null;
    },
    staleTime: 30000, refetchInterval: query => query.state.data ? 30000 : false,
    gcTime: 1800000, refetchOnWindowFocus: false, retry: 1,
  });
  const selectedFrame = preview ? frameId : data !== undefined ? data : frameId !== undefined ? frameId : profile?.avatar_frame;
  const frame = preview ? FRAME_CATALOG.find(frame => frame.id === selectedFrame) ?? null : getAvatarFrame({ ...profile, avatar_frame: selectedFrame });
  useEffect(() => {
    if ((frame?.id !== "frame012" && frame?.id !== "frame013") || document.getElementById("mlpe-kofi-frame-effects-v4")) return;
    const sheet = document.createElement("style");
    sheet.id = "mlpe-kofi-frame-effects-v4";
    sheet.textContent = wingMotionCSS;
    document.head.appendChild(sheet);
  }, [frame?.id]);
  const layerStyle: CSSProperties | undefined = frame ? { position: "absolute", pointerEvents: "none", maxWidth: "none", width: `${frame.scale * 100}%`, height: `${frame.scale * 100}%`, left: "50%", top: `${frame.top}%`, transform: "translate(-50%, -50%)", objectFit: "contain" } : undefined;
  return <span className={className} style={{ ...style, display: "inline-block", position: "relative", flexShrink: 0, aspectRatio: "1 / 1", height: "auto", boxSizing: "border-box", overflow: "visible", verticalAlign: "middle", borderRadius: "22%", isolation: "isolate" }}>
    {frame?.backImage && (frame.id === "frame013" ? <span aria-hidden="true" style={{ ...layerStyle, top: `${frame.top - 12}%`, display: "block", zIndex: 0 }}>
      {(["left", "right"] as const).map(side => <span key={side} className={`mlpe-kofi-wing mlpe-kofi-wing-${side}`}><img src={frame.backImage} alt="" draggable={false} decoding="async" style={{ display: "block", position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", objectFit: "contain", pointerEvents: "none" }} /></span>)}
    </span> : <img src={frame.backImage} alt="" aria-hidden="true" draggable={false} style={{ ...layerStyle, zIndex: 0 }} />)}
    <img src={src || getAvatar(profile?.avatar_url)} alt={alt} draggable={false} decoding="async" style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", maxWidth: "none", maxHeight: "none", aspectRatio: "1 / 1", borderRadius: "inherit", objectFit: "cover", zIndex: 1 }} />
    {frame?.id === "frame012" && <><img className="mlpe-kofi-halo" src={frame.image} alt="" aria-hidden="true" draggable={false} decoding="async" style={{ ...layerStyle, zIndex: 2 }} /><img className="mlpe-kofi-halo mlpe-kofi-halo-core" src={frame.image} alt="" aria-hidden="true" draggable={false} decoding="async" style={{ ...layerStyle, zIndex: 2 }} /></>}
    {frame && <img src={isLightMode ? frame.lightImage ?? frame.image : frame.image} alt="" aria-hidden="true" draggable={false} style={{ ...layerStyle, zIndex: 2, filter: frame.id === "frame012" ? "drop-shadow(0 0 3px rgba(255,255,255,.95)) drop-shadow(0 0 10px rgba(255,239,194,.65))" : undefined }} />}
  </span>;
}
