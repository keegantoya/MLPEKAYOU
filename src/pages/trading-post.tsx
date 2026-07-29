import { useState } from "react";
import { Link } from "react-router-dom";

const setButtons = [
  {
    title: "Eternal Moon I",
    subtitle: "186 Cards",
    to: "/trading-post/1",
    image: "/thumbnails/moon-fe.webp",
  },
  {
    title: "Eternal Moon II",
    subtitle: "189 Cards",
    to: "/trading-post/2",
    image: "/thumbnails/moon-se.webp",
  },
  {
    title: "Eternal Moon III",
    subtitle: "290 Cards",
    to: "/trading-post/3",
    image: "/thumbnails/moon-te.webp",
  },
  {
    title: "Star I",
    subtitle: "105 Cards",
    to: "/trading-post/4",
    image: "/thumbnails/s1-thumbnail.webp",
  },
  {
    title: "Rainbow I",
    subtitle: "146 Cards",
    to: "/trading-post/5",
    image: "/thumbnails/rainbow1thumbnail.webp",
  },
  {
    title: "Rainbow II",
    subtitle: "170 Cards",
    to: "/trading-post/6",
    image: "/thumbnails/rainbow2thumbnail.webp",
  },
  {
    title: "Fun Moments I",
    subtitle: "127 Cards",
    to: "/trading-post/7",
    image: "/thumbnails/fme01TN.webp",
  },
  {
    title: "Fun Moments II",
    subtitle: "136 Cards",
    to: "/trading-post/8",
    image: "/thumbnails/fme02TN.webp",
  },
  {
    title: "Fun Moments III",
    subtitle: "188 Cards",
    to: "/trading-post/11",
    image: "/thumbnails/fme03TN.webp",
  },
  {
    title: "Promo Cards",
    subtitle: "5 Cards",
    to: "/trading-post/9",
    image: "/thumbnails/promos-thumbnail.webp",
  },
  {
    title: "Friendships Begin",
    subtitle: "244 Cards",
    to: "/trading-post/friendshipsbegin",
    image: "/thumbnails/friendship-begins-thumbnail.webp",
  },
  {
    title: "Fantasy Wonderland",
    subtitle: "201 Cards",
    to: "/trading-post/FW",
    image: "/thumbnails/fantasy-wonderland-thumbnail.webp",
  },
  {
    title: "Discord",
    subtitle: "191 Cards",
    to: "/trading-post/12",
    image: "/thumbnails/discord.webp",
  },
  {
    title: "TCG Promos",
    subtitle: "18 Cards",
    to: "/trading-post/tcgpromos",
    image: "/thumbnails/tcgpromosthumbnail.webp",
  },
];

export default function TradingPost() {

const [activeGroup, setActiveGroup] = useState("Moon");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#121212] text-white">

  <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[180px]" />

  <div className="pointer-events-none absolute bottom-[-250px] right-[-200px] h-[600px] w-[600px] rounded-full bg-yellow-500/5 blur-[180px]" />

  <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_0%,white_50%,transparent_100%)] bg-[length:100%_5px]" />

      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black uppercase tracking-[0.35em] text-yellow-300 drop-shadow-[0_0_25px_rgba(250,204,21,0.5)]">
            Trading Post
          </h1>

          <div className="mx-auto mt-3 h-px w-56 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

          <p className="mt-4 text-sm tracking-widest uppercase text-gray-500">
            Select a collection
          </p>
        </div>

<div className="flex flex-wrap justify-center gap-3 mb-8">
  {[
    { label: "Moon", ids: ["1", "2", "3"] },
    { label: "Star", ids: ["4"] },
    { label: "Rainbow", ids: ["5", "6"] },
    { label: "Fun Moments", ids: ["7", "8", "11"] },
    { label: "Promos", ids: ["9", "tcgpromos"] },
    { label: "TCG", ids: ["friendshipsbegin", "FW", "12"] },
  ].map((group) => (
    <button
      key={group.label}
      onClick={() => setActiveGroup(group.label)}
      className={`rounded-xl px-5 py-2 font-bold uppercase tracking-wide transition ${
        activeGroup === group.label
          ? "bg-gradient-to-b from-yellow-300 to-yellow-500 text-black shadow-[0_0_18px_rgba(250,204,21,0.45)]"
          : "bg-gradient-to-b from-[#252525] to-[#151515] border border-[#3a3a3a] text-zinc-300 hover:border-yellow-400 hover:shadow-[0_0_18px_rgba(250,204,21,0.25)]"
      }`}
    >
      {group.label}
    </button>
  ))}
</div>

<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
  {setButtons
    .filter((set) => {
      switch (activeGroup) {
        case "Moon":
          return ["1", "2", "3"].includes(set.to.split("/").pop()!);
        case "Star":
          return ["4"].includes(set.to.split("/").pop()!);
        case "Rainbow":
          return ["5", "6"].includes(set.to.split("/").pop()!);
        case "Fun Moments":
          return ["7", "8", "11"].includes(set.to.split("/").pop()!);
        case "Promos":
          return ["9", "tcgpromos"].includes(set.to.split("/").pop()!);
        case "TCG":
          return ["friendshipsbegin", "FW", "12"].includes(
            set.to.split("/").pop()!
          );
        default:
          return true;
      }
    })
    .map((set) => (
      <Link
        key={set.title}
        to={set.to}
        className="group relative overflow-hidden rounded-3xl border border-yellow-400/15 bg-gradient-to-b from-[#202020] via-[#171717] to-[#101010] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-all duration-300 hover:-translate-y-2 hover:border-yellow-400 hover:shadow-[0_0_35px_rgba(250,204,21,0.35)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />

        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-yellow-400/15 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

<div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-yellow-400/30 transition-all duration-300" />

        <img
          src={set.image}
          alt={set.title}
          className="aspect-[16/9] w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-110"
        />

        <div className="relative p-5 bg-gradient-to-b from-transparent to-black/20">
          <h2 className="text-lg font-bold uppercase tracking-wide text-white">
            {set.title}
          </h2>
        </div>

        <div className="border-t border-yellow-400/10 bg-gradient-to-r from-[#101010] via-[#161616] to-[#101010] px-6 py-3 text-right text-xs font-bold uppercase tracking-[0.3em] text-yellow-300">
          Open →
        </div>
      </Link>
    ))}
</div>

      </div>

    </div>
  );
}