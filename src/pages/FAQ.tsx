import { useEffect, useState } from "react";
import starOneBox from "/set-pictures/staronebox.webp";
import moonOneBox from "/set-pictures/moononebox.webp";
import moonTwoBox from "/set-pictures/moontwobox.webp";
import moonThreeBox from "/set-pictures/moonthreebox.webp";
import moonThreeBigBox from "/set-pictures/moonthreebigbox.webp";
import moonThreeCollectorsBox from "/set-pictures/moonthreecollectorsbox.webp";
import BlankBox from "/set-pictures/blankbigbox.webp";
import rainbowOneBox from "/set-pictures/rainbowonebox.webp";
import rainbowTwoBox from "/set-pictures/rainbowtwobox.webp";
import funMomentsOneBox from "/set-pictures/funmomentsonebox.webp";
import funMomentsTwoBox from "/set-pictures/funmomentstwobox.webp";
import funMomentsThreeBox from "/set-pictures/funmomentsthreeboxstone.webp";
import discordBox from "/set-pictures/discordselling.webp";
import fantasyWonderlandBox from "/set-pictures/fantasywonderlandbox.webp";
import friendshipsBeginBox from "/set-pictures/twilightbox.webp";
type Product = {
  id: string;
  title: string;
  image: string;
  tableCount: number;
  tableAssets?: {
    image?: string;
    label: string;
  }[];
};
type Category = {
  id: string;
  title: string;
  code: string;
  children?: Category[];
  product?: Product;
};
type OddsRow = {
  configuration: string;
  ratio: string;
};
type CaseResearchEntry = {
  title: string;
  observation: string;
  details?: string;
};
const categories: Category[] = [
  {
    id: "eternal-star",
    title: "STAR",
    code: "MLPSE",
    children: [
      {
        id: "star-one",
        title: "STAR ONE",
        code: "MLPSE01",
        product: {
          id: "star-one",
          title: "STAR ONE",
          image: starOneBox,
          tableCount: 1,
        },
      },
    ],
  },
  {
    id: "eternal-moon",
    title: "MOON",
    code: "MLPME",
    children: [
      {
        id: "moon-one",
        title: "MOON ONE",
        code: "MLPEM01",
        product: {
          id: "moon-one",
          title: "MOON ONE",
          image: moonOneBox,
          tableCount: 1,
        },
      },
      {
        id: "moon-two",
        title: "MOON TWO",
        code: "MLPME02",
        product: {
          id: "moon-two",
          title: "MOON TWO",
          image: moonTwoBox,
          tableCount: 4,
          tableAssets: [
            {
              image: moonTwoBox,
              label: "STANDARD BOX",
            },
            {
              image: BlankBox,
              label: "RETAIL SHELVES BOX",
            },
            {
              image: "/set-pictures/moontwoboxtwo.webp",
              label: "NYCC VARIANT",
            },
            {
              image: "/set-pictures/moontwocollectorsbox.webp",
              label: "COLLECTOR'S BOX",
            },
          ],
        },
      },
      {
        id: "moon-three",
        title: "MOON THREE",
        code: "MLPME03",
        product: {
          id: "moon-three",
          title: "MOON THREE",
          image: moonThreeBox,
          tableCount: 3,
          tableAssets: [
            {
              image: moonThreeBox,
              label: "STANDARD BOX",
            },
            {
              image: moonThreeBigBox,
              label: "RETAIL BOX",
            },
            {
              image: moonThreeCollectorsBox,
              label: "Collector's Box",
            },
          ],
        },
      },
    ],
  },
  {
    id: "eternal-rainbow",
    title: "RAINBOW",
    code: "RBE",
    children: [
      {
        id: "rainbow-one",
        title: "RAINBOW ONE",
        code: "RBE01",
        product: {
          id: "rainbow-one",
          title: "RAINBOW ONE",
          image: rainbowOneBox,
          tableCount: 1,
        },
      },
      {
        id: "rainbow-two",
        title: "RAINBOW TWO",
        code: "RBE02",
        product: {
          id: "rainbow-two",
          title: "RAINBOW TWO",
          image: rainbowTwoBox,
          tableCount: 1,
        },
      },
    ],
  },
  {
    id: "fun-moments",
    title: "FUN MOMENTS",
    code: "FME",
    children: [
      {
        id: "fun-moments-one",
        title: "FUN MOMENTS ONE",
        code: "FME01",
        product: {
          id: "fun-moments-one",
          title: "FUN MOMENTS ONE",
          image: funMomentsOneBox,
          tableCount: 1,
        },
      },
{
  id: "fun-moments-two",
  title: "FUN MOMENTS TWO",
  code: "FME02",
  product: {
    id: "fun-moments-two",
    title: "FUN MOMENTS TWO",
    image: funMomentsTwoBox,
    tableCount: 2,
    tableAssets: [
      {
        image: funMomentsTwoBox,
        label: "WALMART BOX",
      },
      {
        image: funMomentsTwoBox,
        label: "ROSS DRESS FOR LESS VARIANT",
      },
    ],
  },
},
      {
        id: "fun-moments-three",
        title: "FUN MOMENTS THREE",
        code: "FME03",
        product: {
          id: "fun-moments-three",
          title: "FUN MOMENTS THREE",
          image: funMomentsThreeBox,
          tableCount: 1,
        },
      },
    ],
  },
  {
    id: "trading-card-game",
    title: "TCG",
    code: "TCG",
    children: [
      {
        id: "fantasy-wonderland",
        title: "FANTASY WONDERLAND",
        code: "BP01",
        product: {
          id: "fantasy-wonderland",
          title: "FANTASY WONDERLAND",
          image: fantasyWonderlandBox,
          tableCount: 1,
        },
      },
      {
        id: "friendships-begin",
        title: "FRIENDSHIPS BEGIN",
        code: "SD01",
        product: {
          id: "friendships-begin",
          title: "FRIENDSHIPS BEGIN",
          image: friendshipsBeginBox,
          tableCount: 1,
        },
      },
            {
        id: "discord",
        title: "DISCORD",
        code: "BP02",
        product: {
          id: "discord",
          title: "DISCORD",
          image: discordBox,
          tableCount: 1,
        },
      },
    ],
  },
];
const packConfigurations: Record<string, OddsRow[][]> = {
  "star-one": [
    [
      { configuration: "1SCR + 2SSR + / UR", ratio: "10:16" },
      { configuration: "1SSR + 1SCR / UR + 1USR / AR", ratio: "5:16" },
      { configuration: "1OR / BP / ◇AR + 2SSR / SCR", ratio: "1:16" },
    ],
  ],
  "moon-one": [
    [
      { configuration: "3R + 1SR + 1HR + 1SSR + 2HR / SSR / UR / LSR", ratio: "20:24" },
      { configuration: "3R + 1SR + 1HR + 1SSR + 2LSR / SGR . SC", ratio: "4:24" },
    ],
  ],
  "moon-two": [
    [
      { configuration: "3R + 1SR + 1HR + 1SSR + 1HR / UR / LSR / SGR", ratio: "8:12" },
      { configuration: "3R + 1SR+ 2HR + 1SSR + 1LSR / ZR / SC / ◇ZR", ratio: "4:12" },
    ],
    [
      { configuration: "3R + 1SR + 1HR + 1SSR + 1UR", ratio: "7:24" },
      { configuration: "3R + 1SR + 1HR + 1LSR / HR + 1SSR + 1UR / SGR / ZR / SC / ◇ZR", ratio: "17:24" },
    ],
    [
      { configuration: "3R + 1SR + 1HR + 1SSR + 2HR / UR / LSR / SGR", ratio: "8:12" },
      { configuration: "3R + 1SR + 2HR + 1SSR + 1LSR / ZR /SC / ◇ZR", ratio: "4:12" },
    ],
    [
      { configuration: "3R + 1SR + 1HR + 1SSR + 1UR + 1LSR", ratio: "3:5" },
      { configuration: "3R + 1SR + 2HR + 1SSR + 1UR / SGR / ZR / SC / ◇ZR", ratio: "2:5" },
    ],
  ],
  "moon-three": [
    [
      { configuration: "3R + 2SR + 1SSR + 1HR + 1LSR", ratio: "6:12" },
      { configuration: "3R + 2SR + 1SSR + 1HR + 1 UR / SGR / ZR / SC / ◇ZR", ratio: "6:12" },
    ],
    [
      { configuration: "3R + 2SR + 1SSR + 1HR + 1LSR", ratio: "12:24" },
      { configuration: "3R + 2SR + 1SSR + 1HR + 1UR / SGR / ZR / SC / ◇ZR", ratio: "12:24" },
    ],
    [
      { configuration: "3R + 1SR + 1HR + 1SSR + 1UR + 1LSR", ratio: "3:5" },
      { configuration: "3R + 1SR + 2HR + 1SSR + 1UR / SGR / ZR / SC / ◇ZR", ratio: "2:5" },
    ],
  ],
  "rainbow-one": [
    [
      { configuration: "1R + 1SR + 1FR + 1TGR / TR + 1MTR / SSR", ratio: "13:20" },
      { configuration: "1R + 1FR + 1MTR + 1TGR / TR + 1FR / SSR / UR / USR / XR", ratio: "7:20" },
    ],
  ],
  "rainbow-two": [
    [
      { configuration: "1BASE + 1ST + 1TG / TGR + 1R + 1SSR / UR / USR / XR", ratio: "11:20" },
      { configuration: "1BASE + 1ST + 1TR / TGR + 1SR + 1FR", ratio: "9:20" },
    ],
  ],
  "fun-moments-one": [
    [
      { configuration: "2N + 1◇N + 1R + 1SR + 1SSR + 1UR + 1SR / SSR / UR", ratio: "11:20" },
      { configuration: "2N + 1◇N + 1R + 1SR + 1SSR + 1UR + 1CR", ratio: "9:20" },
    ],
  ],
  "fun-moments-two": [
    [
      { configuration: "2N/◇N + 2R + 1SR + 1SSR + 2SSR / UR / CR / UGR", ratio: "18:20" },
      { configuration: "2N/◇N + 2R + 1SR + 2SSR + 1UGR", ratio: "2:20" },
    ],
    [
      { configuration: "2N/◇N + 1R + 1SR + 1SSR + 1SSR / UR", ratio: "25:30" },
      { configuration: "2N/◇N + 1R + 1SR + 1SSR + 1UGR / CR", ratio: "5:30" },
    ],
  ],
  "fun-moments-three": [
    [
      { configuration: "2N/◇N + 2R + 1SR + 1SSR + 1R / 1SSR / UR", ratio: "17:20" },
      { configuration: "2N/◇N + 2R + 1SR + 1SSR + 1UGR / CR / ◇CR", ratio: "3:20" },
    ],
  ],
  "discord": [
    [
      { configuration: "2C + 2U / SPR + 1ER", ratio: "6:20" },
      { configuration: "2C + 1U / SPR + 1U / SPR / SR / RR / GR / CR / ※GR / ※SPR / ※CR / ※RR + 1ER / ※ER", ratio: "14:20" },
    ],
  ],
  "fantasy-wonderland": [
    [
      { configuration: "2C + 2U / SPR + 1ER", ratio: "6:20" },
      { configuration: "2C + 1U / SPR + 1SR / RR / GR / CR / ※SPR / ※CR / ※RR + 1ER / ※ER", ratio: "14:20" },
    ],
  ],
  "friendships-begin": [
    [
      { configuration: "2C + 1U / SPR + 1ER / ※ER + 1SR", ratio: "2:3" },
      { configuration: "2C + 1U / SPR + 1ER / ※ER + 1SR / GR / CR / ※RR", ratio: "1:3" },
    ],
  ],
};
const caseResearch: Record<string, CaseResearchEntry[]> = {
  "moon-three": [
    {
      title: "Average Case",
      observation: "An average case contains approximately 2 SC.",
    },
    {
      title: "God Case",
      observation:
        "A god case contains both kinds of ZR, SC, and one ◇ZR.",
    },
    {
      title: "ZR Case Distribution",
      observation:
        "A case containing ZR will only contain one kind of ZR. It will either be Childhood Memories or Crystal Forest.",
      details:
        "The only time both kinds of ZR are mixed within the same case is in a god case.",
    },
  ],
  "discord": [
    {
      title: "※RR Distribution",
      observation: "Only one ※RR is found per case.",
    },
    {
      title: "※SPR Distribution",
      observation: "Typically, only every few boxes contain an ※SPR.",
    },
    {
      title: "Double ※SPR Box",
      observation: "A box containing two ※SPR has been pulled.",
    },
  ],
  "star-one": [
    {
      title: "◇AR Distribution",
      observation: "It is possible for a case to contain no ◇AR.",
    },
    {
      title: "Box Hit",
      observation:
        "Every box will have exactly one box hit: one BP, OR, or ◇AR.",
    },
    {
      title: "AR Distribution",
      observation: "Every box contains two AR.",
    },
  ],
  "fun-moments-one": [
    {
      title: "Hidden CR Distribution",
      observation: "Each case contains 1–4 hidden CR.",
    },
    {
      title: "Duplicate Hidden CR",
      observation: "It is possible to have two of the same hidden CR in a case.",
    },
    {
      title: "Box CR Guarantee",
      observation: "Every box is guaranteed to contain one CR.",
    },
  ],
  "fun-moments-three": [
    {
      title: "Hit Distribution",
      observation:
        "Each box will have three of the same hit: 3 UGR, 3 CR, or 3 ◇CR.",
      details:
        "The hits will never be mixed. It will always be three of the same.",
    },
    {
      title: "Hit Rarity",
      observation:
        "UGR boxes are the most common. ◇CR boxes are the hardest to come by.",
    },
    {
      title: "◇CR Box Distribution",
      observation:
        "Most ◇CR boxes will have 2 pillars and 1 element.",
    },
  ],
  "rainbow-two": [
    {
      title: "Box Configurations",
      observation:
        "There are three box configurations: Level I — 1 USR; Level II — 2 USR; Level III — 1 USR and 1 XR.",
    },
    {
      title: "Hidden XR Distribution",
      observation: "Not every case contains the hidden XR.",
    },
    {
      title: "USR Minimum",
      observation: "There are no boxes with fewer than 1 USR.",
    },
  ],
};
const CategoryButton = ({
  category,
  selected,
  onSelect,
  isLightMode,
}: {
  category: Category;
  selected: boolean;
  onSelect: () => void;
  isLightMode: boolean;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
      selected
        ? isLightMode
          ? "border-[#d4b63d] bg-[#fff6c9]"
          : "border-[#E8CA55]/45 bg-[#E8CA55]/10"
        : isLightMode
        ? "border-black/10 bg-white hover:border-[#d4b63d]/60 hover:bg-[#fffdf5]"
        : "border-white/[0.08] bg-[#17191a] hover:border-[#E8CA55]/35 hover:bg-[#1c1e20]"
    }`}
  >
    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${
      selected ? "bg-[#d5ad16]" : isLightMode ? "bg-zinc-300" : "bg-zinc-600"
    }`} />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-semibold">{category.title}</span>
      <span className={`mt-0.5 block text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
        {category.code}
      </span>
    </span>
    {!!category.children?.length && <span className={isLightMode ? "text-zinc-400" : "text-zinc-500"}>›</span>}
  </button>
);
const ConfigurationTable = ({
  rows,
  tableNumber,
  totalTables,
  isLightMode,
}: {
  rows: OddsRow[];
  tableNumber: number;
  totalTables: number;
  isLightMode: boolean;
}) => (
  <div className={`overflow-hidden rounded-[22px] border ${
    isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#17191a]"
  }`}>
    {totalTables > 1 && (
      <div className={`border-b px-4 py-2.5 text-sm font-semibold ${
        isLightMode ? "border-black/[0.06] text-zinc-600" : "border-white/[0.06] text-zinc-300"
      }`}>
        Configuration {tableNumber}
      </div>
    )}
    <div className={`grid grid-cols-[minmax(0,1fr)_110px] border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wide ${
      isLightMode ? "border-black/[0.06] bg-zinc-50 text-zinc-500" : "border-white/[0.06] bg-white/[0.025] text-zinc-400"
    }`}>
      <span>Pack configuration</span><span className="text-right">Ratio</span>
    </div>
    {rows.map((row, index) => (
      <div key={index} className={`grid grid-cols-[minmax(0,1fr)_110px] gap-3 px-4 py-3 text-sm ${
        index !== rows.length - 1 ? isLightMode ? "border-b border-black/[0.05]" : "border-b border-white/[0.05]" : ""
      }`}>
        <div className={`break-words leading-6 ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>{row.configuration}</div>
        <div className={`text-right font-semibold ${isLightMode ? "text-[#745a00]" : "text-[#E8CA55]"}`}>{row.ratio}</div>
      </div>
    ))}
  </div>
);
const CaseResearchSection = ({ productId, isLightMode }: { productId: string; isLightMode: boolean }) => {
const entries = caseResearch[productId] ?? [];
  return (
    <section className="mt-7">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Case research</h3>
        <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
          Collector observations from opened cases.
        </p>
      </div>
      {entries.length === 0 ? (
        <div className={`rounded-[20px] border p-4 text-sm ${
          isLightMode ? "border-black/10 bg-white text-zinc-500" : "border-white/[0.08] bg-[#17191a] text-zinc-400"
        }`}>
          No research entries yet. Report observations in the MLPEKAYOU Discord server to see them here.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((entry, index) => (
            <article key={`${entry.title}-${index}`} className={`rounded-[20px] border p-4 ${
              isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#17191a]"
            }`}>
              <h4 className="text-sm font-semibold">{entry.title}</h4>
              <p className={`mt-2 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>{entry.observation}</p>
              {entry.details && (
                <p className={`mt-2 rounded-xl px-3 py-2 text-sm leading-5 ${
                  isLightMode ? "bg-[#fff8d8] text-zinc-600" : "bg-[#E8CA55]/[0.06] text-zinc-400"
                }`}>{entry.details}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
const FAQ = () => {
const [path, setPath] = useState<Category[]>([]);
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark");
});
useEffect(() => {
const syncTheme = () => {
const root = document.documentElement;
    setIsLightMode(root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark"));
  };
  syncTheme();
const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
  window.addEventListener("themechange", syncTheme);
  return () => {
    observer.disconnect();
    window.removeEventListener("themechange", syncTheme);
  };
}, []);
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const currentCategory = path.length > 0 ? path[path.length - 1] : null;
const selectCategory = (category: Category) => {
  if (category.product) {
    setSelectedProduct(category.product);
    return;
  }
  setSelectedProduct(null);
  setPath((current) => [...current, category]);
};
const goHome = () => {
  setPath([]);
  setSelectedProduct(null);
};
const goBack = () => {
  setSelectedProduct(null);
  setPath((current) => (current.length > 0 ? current.slice(0, -1) : current));
};
const goToBreadcrumb = (index: number) => {
  setSelectedProduct(null);
  setPath((current) => current.slice(0, index + 1));
};
const getRows = (productId: string, tableNumber: number) =>
  packConfigurations[productId]?.[tableNumber - 1] ?? [];
const getTableAsset = (product: Product, tableNumber: number) =>
  product.tableAssets?.[tableNumber - 1] ?? {
    image: product.image,
    label: `${product.title} BOX`,
  };
  return (
    <main className={`min-h-screen pb-24 transition-colors sm:pb-8 ${
      isLightMode ? "bg-[#f6f4ef] text-zinc-900" : "bg-[#0f1112] text-zinc-100"
    }`}>
      <header className={`border-b ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"}`}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Pack Configurations</h1>
            <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              Collector-reported box configurations and production ratios.
            </p>
          </div>
          <span className={`hidden rounded-full px-3 py-1.5 text-xs font-semibold sm:block ${
            isLightMode ? "bg-[#fff1ad] text-[#725800]" : "bg-[#E8CA55]/10 text-[#E8CA55]"
          }`}>Community data</span>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1400px]">
        <aside className={`hidden w-[250px] shrink-0 border-r p-4 lg:block ${
          isLightMode ? "border-black/10" : "border-white/[0.08]"
        }`}>
          <div className="sticky top-4">
            <div className={`mb-3 text-sm font-semibold ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>Collections</div>
            <div className="space-y-2">
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  selected={path[0]?.id === category.id}
                  onSelect={() => selectCategory(category)}
                  isLightMode={isLightMode}
                />
              ))}
            </div>
          </div>
        </aside>
        <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {(path.length > 0 || selectedProduct) && (
            <div className={`mb-5 flex flex-wrap items-center gap-2 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              <button type="button" onClick={goHome} className="transition hover:text-[#b18c00]">All collections</button>
              {path.map((category, index) => (
                <div key={category.id} className="flex items-center gap-2">
                  <span>›</span>
                  <button type="button" onClick={() => goToBreadcrumb(index)} className="transition hover:text-[#b18c00]">{category.title}</button>
                </div>
              ))}
              {selectedProduct && <><span>›</span><span className="font-semibold">{selectedProduct.title}</span></>}
            </div>
          )}
          {!currentCategory && !selectedProduct && (
            <section>
              <div className={`mb-5 rounded-[26px] border p-5 sm:p-6 ${
                isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#17191a]"
              }`}>
                <div className={`text-sm font-medium ${isLightMode ? "text-[#806100]" : "text-[#E8CA55]"}`}>Pack odds guide</div>
                <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Choose a collection</h2>
                <p className={`mt-2 max-w-2xl text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                  Select a product family to view known box configurations, production ratios, and case research.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <CategoryButton key={category.id} category={category} selected={false} onSelect={() => selectCategory(category)} isLightMode={isLightMode} />
                ))}
              </div>
            </section>
          )}
          {currentCategory && !selectedProduct && (
            <section>
              <button type="button" onClick={goBack} className={`mb-4 text-sm font-medium transition ${
                isLightMode ? "text-zinc-500 hover:text-zinc-900" : "text-zinc-400 hover:text-white"
              }`}>← Back</button>
              <div className="mb-4">
                <div className={`text-sm font-medium ${isLightMode ? "text-[#806100]" : "text-[#E8CA55]"}`}>Product family</div>
                <h2 className="mt-1 text-2xl font-semibold">{currentCategory.title}</h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {currentCategory.children?.map((child) => (
                  <CategoryButton key={child.id} category={child} selected={false} onSelect={() => selectCategory(child)} isLightMode={isLightMode} />
                ))}
              </div>
            </section>
          )}
          {selectedProduct && (
            <section>
              <button type="button" onClick={goBack} className={`mb-4 text-sm font-medium transition ${
                isLightMode ? "text-zinc-500 hover:text-zinc-900" : "text-zinc-400 hover:text-white"
              }`}>← Back to category</button>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <div className={`text-sm font-medium ${isLightMode ? "text-[#806100]" : "text-[#E8CA55]"}`}>Pack configuration</div>
                  <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{selectedProduct.title}</h2>
                </div>
                <div className={`hidden text-sm sm:block ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  {selectedProduct.tableCount} {selectedProduct.tableCount === 1 ? "configuration" : "configurations"}
                </div>
              </div>
              <div className="space-y-4">
                {Array.from({ length: selectedProduct.tableCount }).map((_, index) => {
const tableNumber = index + 1;
const tableAsset = getTableAsset(selectedProduct, tableNumber);
                  return (
                    <div key={tableNumber} className="space-y-3">
                      <div className={`flex items-center gap-4 rounded-[22px] border p-4 ${
                        isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#17191a]"
                      }`}>
                        {tableAsset.image ? (
                          <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl p-2 ${
                            isLightMode ? "bg-zinc-50" : "bg-black/20"
                          }`}>
                            <img src={tableAsset.image} alt={tableAsset.label} className="h-full w-full object-contain" draggable={false} />
                          </div>
                        ) : (
                          <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-dashed text-xs ${
                            isLightMode ? "border-zinc-300 text-zinc-400" : "border-zinc-700 text-zinc-500"
                          }`}>No image</div>
                        )}
                        <div>
                          <div className={`text-xs font-medium ${isLightMode ? "text-[#806100]" : "text-[#E8CA55]"}`}>
                            {selectedProduct.tableCount > 1 ? `Configuration ${tableNumber}` : "Box"}
                          </div>
                          <div className="mt-1 text-sm font-semibold">{tableAsset.label}</div>
                        </div>
                      </div>
                      <ConfigurationTable
                        tableNumber={tableNumber}
                        totalTables={selectedProduct.tableCount}
                        rows={getRows(selectedProduct.id, tableNumber)}
                        isLightMode={isLightMode}
                      />
                    </div>
                  );
                })}
              </div>
              <CaseResearchSection productId={selectedProduct.id} isLightMode={isLightMode} />
            </section>
          )}
        </section>
      </div>
    </main>
  );
};
export default FAQ;
