import { ISOControlsDialog, ISOViewOptions, ISOToggle } from "@/components/iso/ISOShared";
interface ISOControlsProps {
    cardCodeSearch: string;
    onCardCodeSearchChange: (value: string) => void;
    characterSearch: string;
    onCharacterSearchChange: (value: string) => void;
    searchAllCards: boolean;
    onSearchAllCardsChange: (value: boolean) => void;
    wishlistMode: boolean;
    wishlistCharacterOnly?: boolean;
    onWishlistModeChange: (value: boolean) => void;
    availableSets: {
        id: string;
        name: string;
        children: {
            id: string;
            name: string;
        }[];
    }[];
    hiddenSetIds: string[];
    onHideSet: (setId: string) => void;
    hideISO: boolean;
    onToggleHideISO: () => void;
    onClose: () => void;
}
export default function ISOCONTROLS({ characterSearch, onCharacterSearchChange, searchAllCards, onSearchAllCardsChange, wishlistMode, wishlistCharacterOnly = false, onWishlistModeChange, availableSets, hiddenSetIds, onHideSet, hideISO, onToggleHideISO, onClose }: ISOControlsProps) {
 const field = "min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-primary";
 const character = <label className="block min-w-0 text-xs font-medium"><span className="mb-1.5 block">Character</span><input type="search" value={characterSearch} onChange={event => onCharacterSearchChange(event.target.value)} placeholder="Search character" className={field}/></label>;
 if (wishlistCharacterOnly) return <div className="max-w-sm">{character}</div>;
 return <ISOControlsDialog open onOpenChange={open => { if (!open) onClose(); }}>
 <ISOViewOptions viewAll={searchAllCards} wishlistMode={wishlistMode} onViewAll={onSearchAllCardsChange} onWishlistMode={onWishlistModeChange}/>
 <ISOToggle title="Hide your ISO" description="Other collectors will not see your list of needed cards on your profile." checked={hideISO} onChange={onToggleHideISO}/>
 <details className="border-t border-border"><summary className="flex min-h-11 cursor-pointer items-center py-3 text-sm font-medium">Hide sets you do not collect · {hiddenSetIds.length} hidden</summary><p className="mb-2 text-xs text-muted-foreground">Open a group below, then turn on the switch beside a set to leave it out of your needed cards. Your collection progress stays saved.</p>{availableSets.map(family => <details key={family.id} className="border-t border-border"><summary className="min-h-11 cursor-pointer py-3 text-sm">{family.name}</summary>{family.children.map(set => <ISOToggle key={set.id} title={set.name} checked={hiddenSetIds.includes(set.id)} onChange={() => onHideSet(set.id)}/>)}</details>)}</details>
 </ISOControlsDialog>;
}
