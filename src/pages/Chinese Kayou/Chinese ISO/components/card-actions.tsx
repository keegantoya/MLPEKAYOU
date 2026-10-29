import { useEffect, useState } from "react";
import { ISOActionButtons, ISOCardActionDialog } from "@/components/iso/ISOShared";
import { getChineseCardLabel, type ChineseISOCard } from "../catalog/catalog";
import type { ChineseStatus } from "../data/model";
import type { ChineseISOController } from "../data/use-chinese-iso";
import ChineseISOImage from "./card-image";
type Props = { card: ChineseISOCard | null; onClose: () => void; controller: ChineseISOController; status?: ChineseStatus; wishlisted: boolean; owned: boolean; wishlistOnly?: boolean };
export default function ChineseCardActions({ card, onClose, controller, status, wishlisted, owned, wishlistOnly = false }: Props) {
 const [error, setError] = useState("");
 useEffect(() => setError(""), [card?.identity]);
 const act = async (operation: () => Promise<void>) => { if (controller.busy) return; setError(""); try { await operation(); onClose(); } catch (cause) { setError(cause instanceof Error ? cause.message : "The update could not be saved."); } };
 return <ISOCardActionDialog open={!!card} onOpenChange={open => { if (!open) onClose(); }} code={getChineseCardLabel(card)} setName={card?.setName ?? ""} busy={controller.busy} image={card ? <ChineseISOImage card={card}/> : null}>
 {card && <ISOActionButtons status={status} wishlisted={wishlisted} owned={owned} wishlistOnly={wishlistOnly} busy={controller.busy} onStatus={value => void act(() => controller.status(card,status === value ? null : value))} onComplete={() => void act(() => controller.complete(card))} onClear={() => void act(() => controller.status(card,null))} onWishlist={() => void act(() => controller.wishlist(card,!wishlisted))}/>}
 {controller.busy && <p role="status" className="mt-2 text-xs text-muted-foreground">Saving...</p>}{error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
 </ISOCardActionDialog>;
}
