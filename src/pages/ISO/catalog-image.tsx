import { useEffect, useState } from "react";
import CardImage from "@/components/CardImage";
import { getEnglishCardImageStyle, type EnglishCard } from "@/lib/english-card-catalog";
import { resolveISOCard } from "./catalog-adapter";
type Props = {
    card: EnglishCard | {
        set_id: string;
        card_key: string;
    };
    alt?: string;
};
export default function ISOCardImage({ card, alt }: Props) {
    const entry = "setId" in card ? card : resolveISOCard(card.set_id, card.card_key);
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [entry?.front]);
    if (!entry || failed)
        return <div className="absolute inset-0 flex items-center justify-center bg-zinc-300 grayscale dark:bg-zinc-700"><span className="rounded-lg bg-zinc-800/80 px-2 py-1 text-center text-[10px] font-black tracking-wider text-white sm:text-xs">COMING SOON</span></div>;
    return <CardImage src={entry.front} alt={alt ?? entry.code} className="absolute block max-w-none object-cover object-center" style={{ ...getEnglishCardImageStyle(entry), backgroundColor: "transparent", backgroundImage: "none" }} imageSize={entry.original ? "original" : "grid"} loading="lazy" draggable={false} onError={() => setFailed(true)}/>;
}
