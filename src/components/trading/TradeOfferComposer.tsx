import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Root as Dialog, Portal as DialogPortal, Overlay as DialogOverlay, Content as DialogContent, Title as DialogTitle, Description as DialogDescription } from "@radix-ui/react-dialog";
import { chineseSets, getChineseCard } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
import { HEARTHSWARMING_EVE_RARITIES } from "@/lib/hearthswarming-eve";
import { TradeCard, InventoryCard, OFFER_SET_ORDER, OFFER_RARITY_ORDER, getListingDisplayCode, isOwnedProgress, inventoryRarity, rarityMap, comparePromoCards, isFriendshipsBeginSet, getOfferCollectionSet, getFriendshipsBeginImageKey, InventoryCardImage, isWideTradeCard, getOfferRarityLabel, getOfferSetName } from "@/components/trading/trade-card-display";
export function buildOfferInventory(rows: { set_id: string; progress: Record<string, unknown> | null }[]): InventoryCard[] {
  const cards = new Map<string, InventoryCard>();
  for (const row of rows) {
    const savedSetId = String(row.set_id);
    const setId = getOfferCollectionSet(savedSetId);
    if (!OFFER_SET_ORDER.includes(setId) && !savedSetId.startsWith("cn-")) continue;
    for (const [savedKey, value] of Object.entries(row.progress ?? {})) {
      if (!isOwnedProgress(value)) continue;
      if (savedSetId.startsWith("cn-") && !getChineseCard(savedSetId, savedKey)) continue;
      const key = isFriendshipsBeginSet(savedSetId) ? getFriendshipsBeginImageKey(savedKey) : savedKey;
      const databaseSet = isFriendshipsBeginSet(savedSetId) ? "friendshipsbegin" : savedSetId;
      const id = `${databaseSet}:${key}`;
      cards.set(id, { id, set_id: databaseSet, card_key: key });
    }
  }
  const setOrder = [...OFFER_SET_ORDER, ...chineseSets.map(set => set.id)];
  return [...cards.values()].sort((a, b) => setOrder.indexOf(getOfferCollectionSet(a.set_id)) - setOrder.indexOf(getOfferCollectionSet(b.set_id)) || a.card_key.localeCompare(b.card_key, undefined, { numeric: true }));
}
function InventoryPreview({ card }: { card: InventoryCard }) {
  return <><span className="absolute inset-x-0 top-0 z-10 bg-black/65 px-1 py-0.5 text-center text-[9px] font-semibold text-white">{card.set_id.startsWith("cn-") ? "Chinese" : "English"}</span><InventoryCardImage card={card} offerMode /></>;
}
export default function TradeOfferComposer({ target: offerTarget, currentUserId, defaultContact = "", isLightMode, onClose, onSent }: { target: TradeCard; currentUserId: string; defaultContact?: string; isLightMode: boolean; onClose: () => void; onSent: (target: TradeCard) => void }) {
  const sendingRef = useRef(false);
  const [inventoryLanguage, setInventoryLanguage] = useState<"english" | "chinese">(offerTarget.set_id.startsWith("cn-") ? "chinese" : "english");
  const [inventoryPage, setInventoryPage] = useState(0);
  const [inventoryCards, setInventoryCards] = useState<InventoryCard[]>([]);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [selectedOfferCards, setSelectedOfferCards] = useState<InventoryCard[]>(
    [],
  );
  const [offerContact, setOfferContact] = useState(defaultContact);
  const [offerSet, setOfferSet] = useState("");
  const [offerRarity, setOfferRarity] = useState("ALL");
  const [offerStep, setOfferStep] = useState<"compose" | "review" | "sent">(
    "compose",
  );
  const [offerError, setOfferError] = useState("");
  const [isSendingOffer, setIsSendingOffer] = useState(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;
        if (session?.user.id !== currentUserId) throw new Error("Sign in again before making an offer.");
        const rows: { set_id: string; progress: Record<string, unknown> | null }[] = [];
        for (let from = 0; ; from += 500) {
          const { data, error } = await supabase.from("collection_progress_raw").select("set_id, progress").eq("user_id", currentUserId).order("set_id").range(from, from + 499);
          if (!active) return;
          if (error) throw error;
          rows.push(...(data ?? []));
          if (!data || data.length < 500) break;
        }
        const cards = buildOfferInventory(rows);
        if (!active) return;
        setInventoryCards(cards);
        const firstLanguage = offerTarget.set_id.startsWith("cn-") ? "chinese" : "english";
        setInventoryLanguage(firstLanguage);
        setOfferSet(getOfferCollectionSet(cards.find(card => card.set_id.startsWith("cn-") === (firstLanguage === "chinese"))?.set_id ?? ""));
        setInventoryLoaded(true);
      } catch (cause) {
        if (active) { setInventoryLoaded(true); setOfferError(cause instanceof Error ? cause.message : "Your inventory could not be loaded."); }
      }
    })();
    return () => { active = false; };
  }, [currentUserId, offerTarget.id]);
  const toggleOfferCard = (card: InventoryCard) => {
    setOfferError("");
    setSelectedOfferCards((current) => {
      if (current.some((selected) => selected.id === card.id)) {
        return current.filter((selected) => selected.id !== card.id);
      }
      if (current.length >= 10) {
        setOfferError("You can include a maximum of 10 cards.");
        return current;
      }
      return [...current, card];
    });
  };
  const reviewOffer = () => {
    const discordUsername = offerContact.trim();
    if (selectedOfferCards.length === 0) {
      setOfferError("Choose at least one card from your inventory.");
      return;
    }
    if (!discordUsername) {
      setOfferError("Enter your Discord username to send an offer.");
      return;
    }
    if (discordUsername.length > 100) {
      setOfferError("Your Discord username must be 100 characters or fewer.");
      return;
    }
    setOfferError("");
    setOfferStep("review");
  };
  const submitOffer = async () => {
    if (!offerTarget || !currentUserId || sendingRef.current) return;
    const contact = offerContact.trim();
    if (selectedOfferCards.length === 0) {
      setOfferError("Choose at least one card from your inventory.");
      return;
    }
    if (!contact) {
      setOfferError("Enter your Discord username to send an offer.");
      return;
    }
    if (contact.length > 100) {
      setOfferError("Your Discord username must be 100 characters or fewer.");
      return;
    }
    sendingRef.current = true;
    setIsSendingOffer(true);
    setOfferError("");
    try {
    const { error } = await supabase.from("trade_offers").insert({
      sender_id: currentUserId,
      recipient_id: offerTarget.user_id,
      target_set_id: offerTarget.set_id,
      target_card_key: offerTarget.card_key,
      offered_cards: selectedOfferCards.map((card) => ({
        set_id: card.set_id,
        card_key: card.card_key,
      })),
      contact,
    });
    if (error) {
      console.error("Unable to send trade offer:", error);
      setOfferError(
        error.message?.includes("offer_recipient_active_limit")
          ? "You already have 2 active offers sent to this user."
          : error.message?.includes("offer_attempt_limit_reached")
            ? "You have used both offers for this card."
            : error.message?.includes("offer_retry_requires_decline") ||
                error.code === "23505"
              ? "You can only offer again after the first offer is declined."
              : error.code === "42501"
                ? "This card is no longer available for trade."
                : "Your offer could not be sent. Please try again.",
      );
      setOfferStep("compose");
      sendingRef.current = false;
      setIsSendingOffer(false);
      return;
    }
    onSent(offerTarget);
    setOfferStep("sent");
    } catch (cause) {
      setOfferError(cause instanceof Error ? cause.message : "Your offer could not be sent. Please try again.");
    } finally {
      sendingRef.current = false;
      setIsSendingOffer(false);
    }
  };
  const getOfferRarity = (card: InventoryCard) =>
    getChineseCard(card.set_id, card.card_key)?.rarity ?? (card.set_id === "tcgpromos" ? "PR" : inventoryRarity(isFriendshipsBeginSet(card.set_id) ? getFriendshipsBeginImageKey(card.card_key) : card.card_key));
  const getOfferRarityRank = (offerSetId: string, rarity: string) => {
    if (offerSetId.startsWith("cn-")) return (rarityMap[offerSetId] ?? []).indexOf(rarity);
    if (offerSetId === "hearthswarming-eve") return Object.keys(HEARTHSWARMING_EVE_RARITIES).indexOf(rarity);
    if (["SHINING ZR", "SZR"].includes(rarity)) return 1001;
    if (offerSetId === "4" && rarity === "SAR") return 1002;
    if (["7", "8", "11"].includes(offerSetId) && rarity === "SCR") return 1002;
    const rank = OFFER_RARITY_ORDER.indexOf(rarity);
    return rank === -1 ? 0 : rank;
  };
  const offerSetOptionsFor = (language: "english" | "chinese") => [...OFFER_SET_ORDER, ...chineseSets.map(set => set.id)].filter(setId => setId.startsWith("cn-") === (language === "chinese") && inventoryCards.some(card => getOfferCollectionSet(card.set_id) === setId));
  const offerSetOptions = offerSetOptionsFor(inventoryLanguage);
  const currentOfferSetIndex = Math.max(0, offerSetOptions.indexOf(offerSet));
  const changeOfferSet = (direction: -1 | 1) => {
    const nextSet = offerSetOptions[currentOfferSetIndex + direction];
    if (!nextSet) return;
    setOfferSet(nextSet);
    setInventoryPage(0);
    setOfferRarity("ALL");
  };
  const offerRarityOptions = Array.from(
    new Set(
      inventoryCards
        .filter((card) => getOfferCollectionSet(card.set_id) === offerSet)
        .map((card) => getOfferRarity(card)),
    ),
  ).sort(
    (a, b) =>
      getOfferRarityRank(offerSet, a) - getOfferRarityRank(offerSet, b) ||
      a.localeCompare(b),
  );
  const filteredOfferInventory = inventoryCards
    .filter((card) => {
      return (
        getOfferCollectionSet(card.set_id) === offerSet &&
        (offerRarity === "ALL" || getOfferRarity(card) === offerRarity)
      );
    })
    .sort((a, b) => {
      if (offerSet === "9") return comparePromoCards(a, b);
      if (offerRarity === "ALL") {
        const rarityDifference =
          getOfferRarityRank(offerSet, getOfferRarity(b)) -
          getOfferRarityRank(offerSet, getOfferRarity(a));
        if (rarityDifference !== 0) return rarityDifference;
      }
      return a.card_key.localeCompare(b.card_key, undefined, {
        numeric: true,
      });
    });
  const inventoryPageCount = Math.ceil(filteredOfferInventory.length / 80);
  const safeInventoryPage = Math.min(inventoryPage, Math.max(0, inventoryPageCount - 1));
  const visibleOfferInventory = filteredOfferInventory.slice(safeInventoryPage * 80, (safeInventoryPage + 1) * 80);
  return <Dialog open onOpenChange={open => { if (!open && !sendingRef.current) onClose(); }}><DialogPortal><DialogOverlay className="fixed inset-0 z-[120000] bg-black/70 backdrop-blur-sm" />
          <DialogContent
            onEscapeKeyDown={event => { if (sendingRef.current) event.preventDefault(); }}
            onPointerDownOutside={event => { if (sendingRef.current) event.preventDefault(); }}
            aria-modal="true"
            aria-labelledby="offer-title"
            onMouseDown={(event) => event.stopPropagation()}
            className={`fixed left-1/2 top-1/2 z-[120001] -translate-x-1/2 -translate-y-1/2 p-0 gap-0 flex max-h-[88dvh] w-[calc(100%-1.5rem)] max-w-[680px] flex-col overflow-hidden rounded-[18px] border shadow-2xl lg:max-w-5xl ${
              isLightMode
                ? "border-black/10 bg-white text-zinc-900"
                : "border-white/10 bg-[#17191a] text-white"
            }`}
          >
            <div
              className={`flex items-center justify-between gap-3 border-b p-2.5 sm:p-3 ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#b88a00] dark:text-[#FFE27A]">
                  {offerStep === "sent" ? "Complete" : "Trade offer"}
                </div>
                <DialogTitle
                  id="offer-title"
                  className="mt-0.5 truncate text-lg font-bold"
                >
                  {offerStep === "compose"
                    ? "Choose your cards"
                    : offerStep === "review"
                      ? "Are you sure you want to send this?"
                      : "Offer sent"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-zinc-500">
                  {offerStep === "compose"
                    ? "Choose up to 10 cards. This offer expires after 7 days."
                    : offerStep === "review"
                      ? "Review both sides of the trade before confirming."
                      : "The collector will see your offer in their inbox."}
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => { if (!sendingRef.current) onClose(); }}
                disabled={isSendingOffer}
                aria-label="Close offer"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isLightMode ? "bg-zinc-100" : "bg-white/[0.07]"
                }`}
              >
                <X size={18} />
              </button>
            </div>
            {offerStep === "compose" && (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3">
                  <div className="grid min-h-0 gap-3 md:grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
                    <div className="space-y-2.5">
                      <div
                        className={`rounded-xl border p-2.5 ${
                          isLightMode
                            ? "border-black/10 bg-zinc-50"
                            : "border-white/[0.08] bg-white/[0.03]"
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          You want
                        </div>
                        <div className={`relative mx-auto mt-2 ${isWideTradeCard(offerTarget) ? "aspect-[10/7]" : "aspect-[5/7]"} w-full max-w-[112px] overflow-hidden rounded-[6px]`}>
                          <InventoryPreview card={offerTarget} />
                        </div>
                        <div className="mt-1 text-center text-xs text-zinc-500">
                          {getOfferSetName(offerTarget.set_id)}
                        </div>
                      </div>
                      <label className="block">
                        <span className="mb-1 block text-sm font-semibold">
                          Discord username{" "}
                          <span className="text-red-500">*</span>
                        </span>
                        <span className="mb-1.5 block text-[11px] leading-snug text-zinc-500">
                          Required so the other collector can contact you about
                          the trade.
                        </span>
                        <input
                          value={offerContact}
                          onChange={(event) =>
                            setOfferContact(event.target.value)
                          }
                          maxLength={100}
                          placeholder="Discord username"
                          required
                          autoCapitalize="none"
                          spellCheck={false}
                          className={`w-full rounded-xl border px-3 py-2 text-base outline-none focus:border-[#d5ad24] ${
                            isLightMode
                              ? "border-black/10 bg-white"
                              : "border-white/10 bg-white/[0.05]"
                          }`}
                        />
                      </label>
                    </div>
                    <div className="min-h-0 min-w-0">
                      <div>
                        <div>
                          <h3 className="font-semibold">Your inventory</h3>
                          <p className="text-sm text-zinc-500">
                            {selectedOfferCards.length} of 10 cards selected
                          </p>
                        </div>
                      </div>
                      <div role="group" aria-label="Inventory language" className="mb-3 flex gap-5 border-b border-current/10">
                        {(["english", "chinese"] as const).map(language => <button type="button" key={language} aria-pressed={inventoryLanguage === language} onClick={() => { setInventoryLanguage(language); setOfferSet(offerSetOptionsFor(language)[0] ?? ""); setOfferRarity("ALL"); setInventoryPage(0); }} className={`border-b-2 pb-2 text-sm font-semibold ${inventoryLanguage === language ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "border-transparent text-zinc-500"}`}>{language === "english" ? "English" : "Chinese"}</button>)}
                      </div>
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
                        {offerSetOptions.map((setId) => (
                          <button
                            key={setId}
                            type="button"
                            onClick={() => {
                              setOfferSet(setId);
                              setInventoryPage(0);
                              setOfferRarity("ALL");
                            }}
                            className={
                              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold " +
                              (offerSet === setId
                                ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#b88a00] dark:text-[#FFE27A]"
                                : isLightMode
                                  ? "border-black/10 bg-zinc-50 text-zinc-600"
                                  : "border-white/10 bg-white/[0.04] text-zinc-400")
                            }
                          >
                            {getOfferSetName(setId)}
                          </button>
                        ))}
                      </div>
                      {offerSetOptions.length > 0 && (
                        <div
                          className={`mt-3 hidden grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 rounded-xl border p-1.5 md:grid ${
                            isLightMode
                              ? "border-black/10 bg-zinc-50"
                              : "border-white/10 bg-white/[0.03]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => changeOfferSet(-1)}
                            disabled={currentOfferSetIndex === 0}
                            aria-label="Previous set"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xl font-bold disabled:opacity-25 ${
                              isLightMode
                                ? "bg-white text-zinc-700 shadow-sm"
                                : "bg-white/[0.07] text-zinc-200"
                            }`}
                          >
                            &lsaquo;
                          </button>
                          <div className="min-w-0 text-center">
                            <div className="truncate text-sm font-semibold text-[#b88a00] dark:text-[#FFE27A]">
                              {getOfferSetName(offerSet)}
                            </div>
                            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                              Set {currentOfferSetIndex + 1} of{" "}
                              {offerSetOptions.length}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => changeOfferSet(1)}
                            disabled={
                              currentOfferSetIndex >= offerSetOptions.length - 1
                            }
                            aria-label="Next set"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xl font-bold disabled:opacity-25 ${
                              isLightMode
                                ? "bg-white text-zinc-700 shadow-sm"
                                : "bg-white/[0.07] text-zinc-200"
                            }`}
                          >
                            &rsaquo;
                          </button>
                        </div>
                      )}
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {["ALL", ...offerRarityOptions].map((rarity) => (
                          <button
                            key={rarity}
                            type="button"
                            onClick={() => { setOfferRarity(rarity); setInventoryPage(0); }}
                            className={
                              "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold " +
                              (offerRarity === rarity
                                ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#b88a00] dark:text-[#FFE27A]"
                                : isLightMode
                                  ? "border-black/10 bg-white text-zinc-600"
                                  : "border-white/10 bg-white/[0.03] text-zinc-400")
                            }
                          >
                            {getOfferRarityLabel(offerSet, rarity)}
                          </button>
                        ))}
                      </div>
                      {!inventoryLoaded ? (
                        <div role="status" className="tp-inventory-loading">
                          <div className="tp-loading-bars" aria-hidden="true" style={{ marginLeft: 0 }}><i /><i /><i /></div>
                          <strong>Opening your collection</strong>
                          <p>Finding owned cards you can include in this offer.</p>
                          <div className="tp-load-track"><span /></div>
                        </div>
                      ) : visibleOfferInventory.length === 0 ? (
                        <div
                          className={`mt-4 rounded-2xl border p-8 text-center text-sm ${
                            isLightMode
                              ? "border-black/10 bg-zinc-50 text-zinc-500"
                              : "border-white/[0.08] bg-white/[0.03] text-zinc-400"
                          }`}
                        >
                          You do not own any cards in this set and rarity.
                        </div>
                      ) : (
                        <div className="mt-2.5 grid max-h-[230px] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
                          {visibleOfferInventory.map((card) => {
                            const selected = selectedOfferCards.some(
                              (item) => item.id === card.id,
                            );
                            const selectionFull =
                              selectedOfferCards.length >= 10 && !selected;
                            return (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => toggleOfferCard(card)}
                                disabled={selectionFull}
                                className={`group relative overflow-hidden rounded-[6px] border-0 bg-transparent p-0 text-left transition ${
                                  selected
                                    ? "ring-2 ring-[#FFD54A] ring-offset-1 ring-offset-transparent"
                                    : isLightMode
                                      ? "hover:ring-2 hover:ring-[#c89d13]/40"
                                      : "hover:ring-2 hover:ring-[#FFD54A]/30"
                                } disabled:opacity-35`}
                              >
                                <span className={`relative block ${isWideTradeCard(card) ? "aspect-[10/7]" : "aspect-[5/7]"} overflow-hidden rounded-[6px]`}>
                                  <InventoryPreview card={card} />
                                </span>
                                {selected && (
                                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD54A] text-zinc-900 shadow-lg">
                                    <Check size={14} />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  {offerStep === "compose" && inventoryPageCount > 1 && <nav aria-label="Inventory card pages" className="flex items-center justify-center gap-4 py-3"><button type="button" disabled={safeInventoryPage === 0} onClick={() => setInventoryPage(value => Math.max(0, value - 1))}>Previous</button><span className="text-xs">{safeInventoryPage + 1} / {inventoryPageCount}</span><button type="button" disabled={safeInventoryPage + 1 >= inventoryPageCount} onClick={() => setInventoryPage(value => value + 1)}>Next</button></nav>}
                  {selectedOfferCards.length > 0 && (
                    <div
                      className={`mt-2.5 rounded-xl border p-2 ${
                        isLightMode
                          ? "border-[#c89d13]/20 bg-[#c89d13]/[0.05]"
                          : "border-[#FFD54A]/15 bg-[#FFD54A]/[0.05]"
                      }`}
                    >
                      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Cards in your offer
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedOfferCards.map((card) => (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => toggleOfferCard(card)}
                            aria-label={`Remove ${getListingDisplayCode(card)} from your offer`}
                            className={`relative h-12 ${isWideTradeCard(card) ? "aspect-[10/7]" : "aspect-[5/7]"} overflow-hidden rounded-[6px] border border-[#FFD54A]/40`}
                          >
                            <InventoryPreview card={card} />
                            <span className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-white">
                              <X size={11} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {offerError && (
                    <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                      {offerError}
                    </p>
                  )}
                </div>
                <div
                  className={`grid grid-cols-2 gap-2 border-t p-2.5 sm:flex sm:justify-end ${
                    isLightMode ? "border-black/10" : "border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => { if (!sendingRef.current) onClose(); }}
                    disabled={isSendingOffer}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      isLightMode
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-white/[0.07] text-zinc-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={reviewOffer}
                    disabled={isSendingOffer || !inventoryLoaded}
                    className="rounded-xl bg-[#FFD54A] px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                  >
                    Review offer
                  </button>
                </div>
              </>
            )}
            {offerStep === "review" && (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
                    <div
                      className={`flex flex-col rounded-2xl border p-3 md:min-h-[230px] ${
                        isLightMode
                          ? "border-black/10 bg-zinc-50"
                          : "border-white/[0.08] bg-white/[0.03]"
                      }`}
                    >
                      <div className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        You are offering
                      </div>
                      <div className="mt-3 flex flex-1 flex-col items-center justify-center overflow-y-auto">
                        <div className="flex flex-wrap justify-center gap-2">
                          {selectedOfferCards.map((card) => (
                            <div
                              key={card.id}
                              className={`relative h-32 ${isWideTradeCard(card) ? "aspect-[10/7]" : "aspect-[5/7]"} overflow-hidden rounded-[6px]`}
                            >
                              <InventoryPreview card={card} />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-sm font-bold">
                          {selectedOfferCards.length}{" "}
                          {selectedOfferCards.length === 1 ? "card" : "cards"}
                        </div>
                      </div>
                    </div>
                    <div className="self-center text-center text-xl font-black text-[#c89d13]">
                      for
                    </div>
                    <div
                      className={`flex flex-col rounded-2xl border p-3 text-center md:min-h-[230px] ${
                        isLightMode
                          ? "border-black/10 bg-zinc-50"
                          : "border-white/[0.08] bg-white/[0.03]"
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        You want
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center">
                        <div className={`relative h-32 ${isWideTradeCard(offerTarget) ? "aspect-[10/7]" : "aspect-[5/7]"} overflow-hidden rounded-[6px]`}>
                          <InventoryPreview card={offerTarget} />
                        </div>
                        <div className="mt-2 text-sm font-bold">
                          {getOfferSetName(offerTarget.set_id)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
                      isLightMode
                        ? "border-black/10 bg-white"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <span className="font-semibold">Discord username:</span>{" "}
                    {offerContact.trim()}
                  </div>
                  {offerError && (
                    <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                      {offerError}
                    </p>
                  )}
                </div>
                <div
                  className={`grid grid-cols-2 gap-2 border-t p-2.5 sm:flex sm:justify-end ${
                    isLightMode ? "border-black/10" : "border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOfferStep("compose")}
                    disabled={isSendingOffer}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      isLightMode
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-white/[0.07] text-zinc-200"
                    }`}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => void submitOffer()}
                    disabled={isSendingOffer}
                    className="rounded-xl bg-[#FFD54A] px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                  >
                    {isSendingOffer ? "Sending..." : "Confirm and send"}
                  </button>
                </div>
              </>
            )}
            {offerStep === "sent" && (
              <>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-3xl font-black text-emerald-500">
                    &#10003;
                  </div>
                  <h3 className="mt-3 text-xl font-bold">
                    Your offer was sent
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-zinc-500">
                    Your offer is active for 7 days. You will be notified when
                    the collector responds.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {selectedOfferCards.map((card) => (
                      <div
                        key={card.id}
                        className={`relative h-20 ${isWideTradeCard(card) ? "aspect-[10/7]" : "aspect-[5/7]"} overflow-hidden rounded-[6px]`}
                      >
                        <InventoryPreview card={card} />
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className={`border-t p-2.5 sm:flex sm:justify-end ${
                    isLightMode ? "border-black/10" : "border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setSelectedOfferCards([]);
                    }}
                    className="w-full rounded-xl bg-[#FFD54A] px-5 py-2 text-sm font-semibold text-zinc-900 sm:w-auto"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </DialogContent>
</DialogPortal></Dialog>;
}
