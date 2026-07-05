import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const LeapingPonies = () => {
  const navigate = useNavigate();

const merchItems = [
  {
    id: 1,
    title: "Twilight Sparkle",
    image: "/otherkayoumerch/twilightplushone.webp",
  },
  {
    id: 2,
    title: "Pinkie Pie",
    image: "/otherkayoumerch/pinkieplushone.webp",
  },
  {
    id: 3,
    title: "Fluttershy",
    image: "/otherkayoumerch/fluttershyplushone.webp",
  },
  {
    id: 4,
    title: "Rainbow Dash",
    image: "/otherkayoumerch/rainbowdashplushone.webp",
  },
  {
    id: 5,
    title: "Rarity",
    image: "/otherkayoumerch/rarityplushone.webp",
  },
  {
    id: 6,
    title: "Applejack",
    image: "/otherkayoumerch/applejackplushone.webp",
  },
];
  
const [completed, setCompleted] = useState<number[]>([]);

useEffect(() => {
  const loadProgress = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) return;

    const { data } = await supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", user.id)
      .eq("set_id", "OTHERMERCH")
      .single();

    if (data?.progress) {
      const completedIds = Object.entries(data.progress)
        .filter(([_, value]) => value)
        .map(([key]) => Number(key));

      setCompleted(completedIds);
    }
  };

  loadProgress();
}, []);

  return (
    <div className="min-h-screen bg-[#e3e3e3]">
      <div className="mx-auto max-w-[1800px] px-6 py-8">

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">

          {/* LEFT SIDEBAR */}
          <aside
  className="sidebar-scroll xl:sticky xl:top-[84px] self-start max-h-[calc(100vh-100px)] overflow-y-auto pr-2"
>

            <div className="bg-zinc-800 border border-zinc-600 rounded-xl shadow-lg overflow-hidden text-zinc-100">

             {/* Set Header */}
<div className="p-6 border-b border-zinc-700">

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                 Plushie Collections
                </p>

                <button
  onClick={() => navigate("/collections")}
  className="mt-6 mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
>
  ← Back to Collections
</button>

                <h1 className="mt-2 text-5xl font-black uppercase leading-none">
                  Plushies
                </h1>

                <p className="mt-2 text-lg text-zinc-400">
  Leaping Ponies
</p>

<p className="mt-4 text-xs leading-relaxed text-gray-400">
  Click on a plushie to mark it as owned. All items in the "Other" category do not build an ISO and only
  exist as a checklist on this page.
</p>

              </div>

              {/* Product Info */}
              <div className="border-t border-zinc-700 p-6">

                <h2 className="text-lg font-bold uppercase mb-5">
                  Product Information
                </h2>

                <div className="space-y-5">

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400">
                      Product Name
                    </p>

                    <p className="font-semibold">
                      Leaping Ponies
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </aside>

{/* RIGHT SIDE */}
<main
  className="card-scroll overflow-y-auto pr-3 xl:h-[calc(100vh-100px)]"
>
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

    {merchItems.map((item) => (
      <div
        key={item.id}
        onClick={async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          const user = session?.user;

          if (!user) return;

          let updated: number[];

          if (completed.includes(item.id)) {
            updated = completed.filter((id) => id !== item.id);
          } else {
            updated = [...completed, item.id];
          }

          setCompleted(updated);

          const progressObject = updated.reduce(
            (acc, id) => {
              acc[id] = true;
              return acc;
            },
            {} as Record<number, boolean>
          );

          await supabase
            .from("collection_progress_raw")
            .upsert(
              {
                user_id: user.id,
                set_id: "OTHERMERCH",
                progress: progressObject,
              },
              {
                onConflict: "user_id,set_id",
              }
            );
        }}
        className={`relative bg-white border rounded-xl overflow-hidden shadow transition cursor-pointer hover:scale-[1.02]
          ${
            completed.includes(item.id)
              ? "border-yellow-400 ring-2 ring-yellow-300"
              : "border-gray-200"
          }`}
      >
        <img
          src={item.image}
          alt={item.title}
          className={`w-full aspect-square object-contain bg-white transition ${
            completed.includes(item.id) ? "brightness-110" : ""
          }`}
        />

        {completed.includes(item.id) && (
          <>
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#5a3e84] text-[#f5e6a8] flex items-center justify-center text-sm font-bold">
              ✓
            </div>

            <div className="absolute inset-0 pointer-events-none bg-yellow-300/10" />
          </>
        )}

        <div className="p-3 text-center">
          <h2 className="font-semibold text-[#5a3e84]">
            {item.title}
          </h2>
        </div>
      </div>
    ))}

  </div>
</main>

        </div>

      </div>
    </div>
  );
};

export default LeapingPonies;