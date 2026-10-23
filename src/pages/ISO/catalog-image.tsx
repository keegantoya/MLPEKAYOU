import { supabase } from "@/lib/supabase";
import { getCachedCardImage } from "@/lib/card-image-cache";
import { CARD_IMAGE_WORKER_URL } from "@/lib/card-images";
import { useEffect, useState } from "react";
import CardImage from "@/components/CardImage";
import { getEnglishCardImageStyle, type EnglishCard } from "@/lib/english-card-catalog";
import { resolveISOCard, type ISOCard } from "./catalog-adapter";
type Props = {
    card: ISOCard | {
        set_id: string;
        card_key: string;
    };
    alt?: string;
};
function MerchandiseImage({ card, alt }: { card: ISOCard; alt?: string }) {
    const [image, setImage] = useState<{ path: string; url: string } | null>(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        let disposed = false;
        let release: (() => void) | undefined;
        setFailed(false);
        setImage(null);
        void (async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            if (!session || disposed) return;
            const userId = session.user.id;
            const url = `${CARD_IMAGE_WORKER_URL.replace(/\/$/, "")}/${card.front.split("/").map(encodeURIComponent).join("/")}`;
            const source = await getCachedCardImage(card.front, userId, async signal => {
                const request = (token: string) => fetch(url, { signal, credentials: "omit", headers: { Authorization: `Bearer ${token}` } });
                let response = await request(session.access_token);
                if (response.status === 401 && !signal.aborted) {
                    const refreshed = await supabase.auth.refreshSession();
                    if (!refreshed.error && refreshed.data.session?.user.id === userId && !signal.aborted) response = await request(refreshed.data.session.access_token);
                }
                return response;
            });
            if (disposed) { source?.release(); return; }
            if (!source) { setFailed(true); return; }
            release = source.release;
            setImage({ path: card.front, url: source.url });
        })().catch(() => { if (!disposed) setFailed(true); });
        return () => { disposed = true; release?.(); };
    }, [card.front]);
    return failed ? <div className="absolute inset-0 flex items-center justify-center bg-muted p-2 text-center text-xs text-muted-foreground">Image unavailable</div> : <img src={image?.path === card.front ? image.url : undefined} alt={alt ?? card.code} className="absolute inset-0 h-full w-full object-contain" loading="lazy" draggable={false} onError={() => setFailed(true)}/>;
}
export default function ISOCardImage({ card, alt }: Props) {
    const entry = "setId" in card ? card : resolveISOCard(card.set_id, card.card_key);
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [entry?.front]);
    if (!entry || failed)
        return <div className="absolute inset-0 flex items-center justify-center bg-zinc-300 grayscale dark:bg-zinc-700"><span className="rounded-lg bg-zinc-800/80 px-2 py-1 text-center text-[10px] font-black tracking-wider text-white sm:text-xs">COMING SOON</span></div>;
    if (entry.family === "merch") return <MerchandiseImage card={entry} alt={alt}/>;
    return <CardImage src={entry.front} alt={alt ?? entry.code} className="absolute block max-w-none object-cover object-center" style={{ ...getEnglishCardImageStyle(entry as EnglishCard), backgroundColor: "transparent", backgroundImage: "none" }} imageSize={entry.original ? "original" : "grid"} loading="lazy" draggable={false} onError={() => setFailed(true)}/>;
}
