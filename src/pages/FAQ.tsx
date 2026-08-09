import { useState } from "react";

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


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

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



/*
|--------------------------------------------------------------------------
| PRODUCT HIERARCHY
|--------------------------------------------------------------------------
*/

const categories: Category[] = [
  {
    id: "eternal-star",
    title: "STAR",
    code: "MLPSE",
    children: [
      {
        id: "star-one",
        title: "STAR ONE",
        code: "ES-01",
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
        code: "01",
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
        code: "02",
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
        code: "03",
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
        code: "01",
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
        code: "02",
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
        code: "01",
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
  code: "02",
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
        code: "03",
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
    code: "BP/SD",
    children: [
      {
        id: "fantasy-wonderland",
        title: "FANTASY WONDERLAND",
        code: "01",
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
        code: "01",
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
        code: "02",
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


/*
|--------------------------------------------------------------------------
| PACK CONFIGURATIONS
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| CASE RESEARCH
|--------------------------------------------------------------------------
| Manually maintained observations gathered from opening cases.
| Add, remove, or edit entries here. Nothing is stored in Supabase.
*/
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


/*
|--------------------------------------------------------------------------
| CATEGORY NAVIGATION ITEM
|--------------------------------------------------------------------------
*/

const CategoryButton = ({
  category,
  selected,
  onSelect,
}: {
  category: Category;
  selected: boolean;
  onSelect: () => void;
}) => {
  const hasChildren = !!category.children?.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex w-full items-center gap-3 overflow-hidden border px-4 py-3 text-left transition-all duration-200 ${
        selected
          ? "border-yellow-400/70 bg-yellow-400/[0.08]"
          : "border-zinc-800/80 bg-[#111214] hover:border-yellow-400/40 hover:bg-[#181a1d]"
      }`}
    >
      {/* LEFT STATUS BAR */}

      <span
        className={`absolute left-0 top-0 h-full w-[2px] transition ${
          selected
            ? "bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)]"
            : "bg-transparent group-hover:bg-yellow-400/50"
        }`}
      />

      {/* NODE */}

      <span
        className={`relative flex h-7 w-7 shrink-0 items-center justify-center border ${
          selected
            ? "border-yellow-400/70 text-yellow-400"
            : "border-zinc-700 text-zinc-500 group-hover:border-yellow-400/50 group-hover:text-yellow-400"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      </span>

      {/* TEXT */}

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[11px] font-bold tracking-[0.13em] ${
            selected
              ? "text-yellow-300"
              : "text-zinc-200 group-hover:text-white"
          }`}
        >
          {category.title}
        </span>

        <span className="mt-0.5 block font-mono text-[8px] tracking-[0.2em] text-zinc-600">
          {category.code}
        </span>
      </span>

      {/* ARROW */}

      {hasChildren && (
        <span
          className={`font-mono text-xs ${
            selected
              ? "text-yellow-400"
              : "text-zinc-600 group-hover:text-yellow-400"
          }`}
        >
          ›
        </span>
      )}
    </button>
  );
};


/*
|--------------------------------------------------------------------------
| PACK CONFIGURATION TABLE
|--------------------------------------------------------------------------
*/

const ConfigurationTable = ({
  rows,
  tableNumber,
  totalTables,
}: {
  rows: OddsRow[];
  tableNumber: number;
  totalTables: number;
}) => {
  return (
    <div className="relative overflow-hidden border border-yellow-400/25 bg-[#0c0d0f]">

      {/* CORNER MARKERS */}

      <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-yellow-400" />
      <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-yellow-400" />
      <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-yellow-400" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-yellow-400" />

      {/* TABLE ID */}

      {totalTables > 1 && (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-[#111214] px-4 py-2.5">

          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            CONFIGURATION MATRIX
          </span>

          <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-yellow-500">
            TABLE {String(tableNumber).padStart(2, "0")}
          </span>

        </div>
      )}

      {/* COLUMN HEADERS */}

      <div className="grid grid-cols-2 border-b border-yellow-400/20">

        <div className="px-4 py-3 sm:px-5">
          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-400">
            PACK CONFIGURATIONS
          </div>
        </div>

        <div className="border-l border-yellow-400/20 px-4 py-3 sm:px-5">
          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-400">
            PRODUCTION RATIO
          </div>
        </div>

      </div>


      {/* INPUT ROWS */}

      {rows.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-2 border-b border-zinc-800/80"
        >

          <div className="p-2 sm:p-3">

          <div
            aria-label={`Pack configuration ${index + 1}`}
            className="w-full min-h-[48px] whitespace-normal break-words border border-zinc-800 bg-[#08090a] px-3 py-3 font-mono text-xs leading-5 text-white"
          >
        {row.configuration}
      </div>

          </div>


          <div className="border-l border-zinc-800/80 p-2 sm:p-3">

            <input
              type="text"
              value={row.ratio}
              readOnly
              aria-label={`Production ratio ${index + 1}`}
              className="w-full border border-zinc-800 bg-[#08090a] px-3 py-3 font-mono text-xs text-white outline-none"
            />

          </div>

        </div>
      ))}


    </div>
  );
};

const CaseResearchSection = ({
  productId,
}: {
  productId: string;
}) => {
  const entries = caseResearch[productId] ?? [];

  if (entries.length === 0) {
    return (
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-4 w-[2px] bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />

          <div>
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-300">
              CASE RESEARCH
            </div>

            <div className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-700">
              FIELD OBSERVATIONS / OPENING DATA
            </div>
          </div>
        </div>

        <div className="border border-dashed border-zinc-800 bg-[#0b0c0e] px-4 py-5">
          <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-700">
            NO RESEARCH ENTRIES LOGGED
          </div>

          <div className="mt-2 font-mono text-[8px] leading-5 text-zinc-600">
            Add case-opening observations to the hardcoded caseResearch section.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-4 w-[2px] bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />

          <div>
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-300">
              CASE RESEARCH
            </div>

            <div className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-700">
              FIELD OBSERVATIONS / OPENING DATA
            </div>
          </div>
        </div>

        <div className="font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-yellow-500">
          {String(entries.length).padStart(2, "0")} ENTRIES
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <article
            key={`${entry.title}-${index}`}
            className="relative overflow-hidden border border-zinc-800 bg-[#0b0c0e]"
          >
            <div className="absolute left-0 top-0 h-4 w-4 border-l border-t border-yellow-400/40" />
            <div className="absolute right-0 top-0 h-4 w-4 border-r border-t border-yellow-400/40" />
            <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-yellow-400/40" />
            <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-yellow-400/40" />

            <div className="border-b border-zinc-800 bg-[#0f1012] px-4 py-3">
              <div className="mb-1 font-mono text-[7px] font-bold uppercase tracking-[0.22em] text-yellow-500">
                OBSERVATION {String(index + 1).padStart(2, "0")}
              </div>

              <div
                className="text-sm font-black uppercase tracking-[0.04em] text-white"
                style={{ fontFamily: "Oxanium, sans-serif" }}
              >
                {entry.title}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                OBSERVATION
              </div>

              <p className="mt-2 whitespace-pre-wrap font-mono text-[10px] leading-6 text-zinc-300">
                {entry.observation}
              </p>

              {entry.details && (
                <div className="mt-4 border-l-2 border-yellow-400/30 pl-3">
                  <div className="font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-yellow-500">
                    RESEARCH NOTES
                  </div>

                  <p className="mt-1 whitespace-pre-wrap font-mono text-[9px] leading-5 text-zinc-500">
                    {entry.details}
                  </p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};


/*
|--------------------------------------------------------------------------
| MAIN PAGE
|--------------------------------------------------------------------------
*/

const FAQ = () => {
  const [path, setPath] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const currentCategory =
    path.length > 0
      ? path[path.length - 1]
      : null;


  /*
   |--------------------------------------------------------------------------
   | NAVIGATION
   |--------------------------------------------------------------------------
   */

  const selectCategory = (category: Category) => {
    if (category.product) {
      setSelectedProduct(category.product);
      return;
    }

    setSelectedProduct(null);

    setPath((current) => [
      ...current,
      category,
    ]);
  };


  const goHome = () => {
    setPath([]);
    setSelectedProduct(null);
  };


  const goBack = () => {
    setSelectedProduct(null);

    setPath((current) =>
      current.length > 0
        ? current.slice(0, -1)
        : current,
    );
  };


  const goToBreadcrumb = (index: number) => {
    setSelectedProduct(null);

    setPath((current) =>
      current.slice(0, index + 1),
    );
  };


  /*
   |--------------------------------------------------------------------------
   | PACK CONFIGURATION LOOKUP
   |--------------------------------------------------------------------------
   | These values are hardcoded in packConfigurations above.
   | The website only displays them; users cannot edit them.
   */

  const getRows = (
    productId: string,
    tableNumber: number,
  ) => {
    return (
      packConfigurations[productId]?.[tableNumber - 1] ?? []
    );
  };

  const getTableAsset = (
    product: Product,
    tableNumber: number,
  ) => {
    return product.tableAssets?.[tableNumber - 1] ?? {
      image: product.image,
      label: `${product.title} BOX`,
    };
  };


  /*
   |--------------------------------------------------------------------------
   | RENDER
   |--------------------------------------------------------------------------
   */

  return (
   <main className="min-h-screen bg-[#08090a] pb-24 text-white sm:pb-0">

      {/* ================================================================
          BACKGROUND HUD GRID
      ================================================================ */}

      <div className="pointer-events-none fixed inset-0 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.7) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>


      {/* ================================================================
          TOP SYSTEM BAR
      ================================================================ */}

      <header className="relative z-10 mt-0 border-b border-zinc-800 bg-[#0c0d0f]/95 backdrop-blur">

        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-4 sm:px-6">

          <div className="flex items-center gap-4">

            <div className="relative flex h-8 w-8 items-center justify-center border border-yellow-400/70">

              <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-yellow-400" />
              <span className="absolute right-0 top-0 h-2 w-2 border-r border-t border-yellow-400" />
              <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-yellow-400" />
              <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-yellow-400" />

              <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.9)]" />

            </div>

            <div>

              <div
                className="text-sm font-black tracking-[0.16em] text-white"
                style={{
                  fontFamily: "Oxanium, sans-serif",
                }}
              >
                MLPEKAYOU
              </div>

              <div className="font-mono text-[7px] uppercase tracking-[0.28em] text-zinc-600">
                PACK CONFIGURATION SYSTEM
              </div>

            </div>

          </div>


          <div className="hidden items-center gap-5 sm:flex">

            <div className="text-right">
              <div className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-600">
                SYSTEM
              </div>

              <div className="font-mono text-[9px] font-bold tracking-[0.16em] text-yellow-400">
                ONLINE
              </div>
            </div>

            <div className="h-6 w-px bg-zinc-800" />

            <div className="text-right">
              <div className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-600">
                MODULE
              </div>

              <div className="font-mono text-[9px] font-bold tracking-[0.16em] text-zinc-300">
                PC-01
              </div>
            </div>

          </div>

        </div>

      </header>


      {/* ================================================================
          MAIN
      ================================================================ */}

      <div className="relative z-10 mx-auto flex max-w-[1500px]">

        {/* ================================================================
            LEFT NAVIGATION
        ================================================================ */}

        <aside className="hidden w-[270px] shrink-0 border-r border-zinc-800 bg-[#0b0c0e] lg:block">

          <div className="sticky top-0 p-5">

            <div className="mb-5">

              <div className="mb-1 font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-yellow-500">
                NAVIGATION MATRIX
              </div>

              <div className="font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-700">
                NORTH AMERICAN PRODUCTS
              </div>

            </div>


            <div className="space-y-1.5">

              {categories.map(
                (category) => (
                  <CategoryButton
                    key={category.id}
                    category={category}
                    selected={
                      path[0]?.id ===
                      category.id
                    }
                    onSelect={() =>
                      selectCategory(
                        category,
                      )
                    }
                  />
                ),
              )}

            </div>


            {/* STATUS PANEL */}

            <div className="mt-8 border border-zinc-800 bg-[#0f1012] p-4">

              <div className="mb-3 flex items-center justify-between">

                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
                  DATABASE
                </span>

                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_7px_rgba(250,204,21,0.8)]" />

              </div>

              <div className="font-mono text-[8px] leading-5 text-zinc-600">
                PACK ODDS
                <br />
                CONFIGURATION DATA GATHERED BY COLLECTORS
              </div>

            </div>

          </div>

        </aside>


        {/* ================================================================
            CONTENT
        ================================================================ */}

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">

          {/* ==============================================================
              BREADCRUMB / SYSTEM PATH
          ============================================================== */}

          <div className="mb-6 flex flex-wrap items-center gap-2">

            <button
              type="button"
              onClick={goHome}
              className={`font-mono text-[8px] uppercase tracking-[0.16em] transition ${
                path.length === 0 &&
                !selectedProduct
                  ? "text-yellow-400"
                  : "text-zinc-600 hover:text-yellow-400"
              }`}
            >
              ROOT
            </button>

            {path.map(
              (category, index) => (
                <div
                  key={category.id}
                  className="flex items-center gap-2"
                >

                  <span className="font-mono text-[9px] text-zinc-700">
                    /
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      goToBreadcrumb(
                        index,
                      )
                    }
                    className={`font-mono text-[8px] uppercase tracking-[0.16em] transition ${
                      index ===
                      path.length - 1
                        ? "text-yellow-400"
                        : "text-zinc-600 hover:text-yellow-400"
                    }`}
                  >
                    {category.code}
                  </button>

                </div>
              ),
            )}

            {selectedProduct && (
              <>
                <span className="font-mono text-[9px] text-zinc-700">
                  /
                </span>

                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-yellow-400">
                  {selectedProduct.id}
                </span>
              </>
            )}

          </div>


          {/* ==============================================================
              ROOT
          ============================================================== */}

          {!currentCategory &&
            !selectedProduct && (
              <section>

                <div className="relative mt-10 overflow-hidden border border-zinc-800 bg-[#0d0e10] sm:mt-0">

                  <div className="absolute left-0 top-0 h-8 w-8 border-l border-t border-yellow-400/70" />
                  <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-yellow-400/70" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-yellow-400/70" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-yellow-400/70" />

                  <div className="p-6 sm:p-8">

                    <div className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-yellow-400">
                      SYSTEM MODULE / PC-01
                    </div>

                    <h1
                      className="text-3xl font-black uppercase tracking-[0.05em] text-white sm:text-5xl"
                      style={{
                        fontFamily:
                          "Oxanium, sans-serif",
                      }}
                    >
                      Pack
                      <span className="text-yellow-400">
                        {" "}
                        Configurations
                      </span>
                    </h1>

                    <p className="mt-4 max-w-xl font-mono text-[10px] leading-6 text-zinc-600">
                      SELECT A PRODUCT FAMILY
                      TO ACCESS BOX CONFIGURATION
                      DATA AND PRODUCTION RATIO
                      ENTRY.
                    </p>

                  </div>

                  <div className="border-t border-zinc-800 bg-[#0a0b0c] px-6 py-3 sm:px-8">

                    <div className="flex items-center gap-2">

                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />

                      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
                        AWAITING PRODUCT SELECTION
                      </span>

                    </div>

                  </div>

                </div>


                {/* ROOT CATEGORY GRID */}

                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">

                  {categories.map(
                    (category) => (
                      <CategoryButton
                        key={category.id}
                        category={category}
                        selected={false}
                        onSelect={() =>
                          selectCategory(
                            category,
                          )
                        }
                      />
                    ),
                  )}

                </div>

              </section>
            )}


          {/* ==============================================================
              CATEGORY
          ============================================================== */}

          {currentCategory &&
            !selectedProduct && (
              <section>

                <button
                  type="button"
                  onClick={goBack}
                  className="mb-5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-600 transition hover:text-yellow-400"
                >
                  ← RETURN
                </button>


                <div className="mb-5 flex items-end justify-between border-b border-zinc-800 pb-4">

                  <div>

                    <div className="mb-2 font-mono text-[8px] uppercase tracking-[0.25em] text-yellow-500">
                      PRODUCT FAMILY
                    </div>

                    <h2
                      className="text-2xl font-black uppercase tracking-[0.05em] text-white sm:text-3xl"
                      style={{
                        fontFamily:
                          "Oxanium, sans-serif",
                      }}
                    >
                      {currentCategory.title}
                    </h2>

                  </div>

                  <div className="hidden text-right sm:block">

                    <div className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-700">
                      FAMILY CODE
                    </div>

                    <div className="font-mono text-[10px] font-bold text-yellow-500">
                      {currentCategory.code}
                    </div>

                  </div>

                </div>


                <div className="grid gap-2 sm:grid-cols-2">

                  {currentCategory.children?.map(
                    (child) => (
                      <CategoryButton
                        key={child.id}
                        category={child}
                        selected={false}
                        onSelect={() =>
                          selectCategory(
                            child,
                          )
                        }
                      />
                    ),
                  )}

                </div>

              </section>
            )}


          {/* ==============================================================
              PRODUCT
          ============================================================== */}

          {selectedProduct && (
            <section>

              {/* PRODUCT HEADER */}

              <div className="mb-7 flex items-end justify-between border-b border-zinc-800 pb-5">

                <div>

                  <button
                    type="button"
                    onClick={goBack}
                    className="mb-4 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-600 transition hover:text-yellow-400"
                  >
                    ← RETURN TO CATEGORY
                  </button>

                  <div className="mb-2 flex items-center gap-3">

                    <span className="h-2 w-2 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />

                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-yellow-500">
                      PRODUCT PROFILE
                    </span>

                  </div>

                  <h2
                    className="text-3xl font-black uppercase tracking-[0.05em] text-white sm:text-4xl"
                    style={{
                      fontFamily:
                        "Oxanium, sans-serif",
                    }}
                  >
                    {selectedProduct.title}
                  </h2>

                </div>


                <div className="hidden text-right sm:block">

                  <div className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-700">
                    CONFIG MATRICES
                  </div>

                  <div className="font-mono text-xl font-bold text-yellow-400">
                    {String(
                      selectedProduct.tableCount,
                    ).padStart(2, "0")}
                  </div>

                </div>

              </div>


              {/* ==========================================================
                  CONFIGURATION MATRICES
              ========================================================== */}

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <span className="h-4 w-[2px] bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />

                    <div>

                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-300">
                        PRODUCTION DATA
                      </div>

                      <div className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-700">
                        MANUAL CONFIGURATION INPUT
                      </div>

                    </div>

                  </div>

                  <div className="hidden font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-700 sm:block">
                    RATIO
                  </div>

                </div>


                <div className="space-y-4">

                  {Array.from({
                    length:
                      selectedProduct.tableCount,
                  }).map(
                    (_, index) => {

                      const tableNumber =
                        index + 1;

                      const tableAsset = getTableAsset(
                        selectedProduct,
                        tableNumber,
                      );

                      return (
                        <div
                          key={tableNumber}
                          className="space-y-3"
                        >
                          <div className="relative overflow-hidden border border-zinc-800 bg-[#0b0c0e] p-4 sm:p-5">
                            <div className="absolute left-0 top-0 h-5 w-5 border-l border-t border-yellow-400/50" />
                            <div className="absolute right-0 top-0 h-5 w-5 border-r border-t border-yellow-400/50" />
                            <div className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-yellow-400/50" />
                            <div className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-yellow-400/50" />

                            <div className="flex items-center gap-4">
                              {tableAsset.image ? (
                                <div className="flex h-28 w-28 shrink-0 items-center justify-center bg-[#08090a] p-2">
                                  <img
                                    src={tableAsset.image}
                                    alt={tableAsset.label}
                                    className="h-full w-full object-contain"
                                    draggable={false}
                                  />
                                </div>
                              ) : (
                                <div className="flex h-28 w-28 shrink-0 items-center justify-center border border-dashed border-zinc-700 bg-[#08090a] px-2 text-center">
                                  <span className="font-mono text-[7px] uppercase leading-4 tracking-[0.12em] text-zinc-600">
                                    NO IMAGE
                                  </span>
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="mb-1 font-mono text-[7px] font-bold uppercase tracking-[0.22em] text-yellow-500">
                                  ASSET {String(tableNumber).padStart(2, "0")}
                                </div>
                                <div className="font-mono text-[10px] font-bold uppercase leading-5 tracking-[0.1em] text-zinc-200">
                                  {tableAsset.label}
                                </div>
                              </div>
                            </div>
                          </div>

                          <ConfigurationTable
                            tableNumber={
                              tableNumber
                            }
                            totalTables={
                              selectedProduct.tableCount
                            }
                            rows={getRows(
                              selectedProduct.id,
                              tableNumber,
                            )}
                          />
                        </div>
                      );
                    },
                  )}

                </div>

              </div>

              <CaseResearchSection
                productId={selectedProduct.id}
              />


              {/* FOOTER STATUS */}

              <div className="mt-6 flex items-center justify-between border-t border-zinc-900 pt-4">

                <div className="flex items-center gap-2">

                  <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_7px_rgba(250,204,21,0.8)]" />

                  <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-700">
                    INPUT MODULE READY
                  </span>

                </div>

                <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-800">
                  PC-01
                </span>

              </div>

            </section>
          )}

        </section>

      </div>

    </main>
  );
};


export default FAQ;