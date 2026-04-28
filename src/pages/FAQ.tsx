import KayouHeader from "@/components/KayouHeader";
import { useState } from "react";
import authentic1 from "@/faq-assets/authenticseal1.jpg";
import authentic2 from "@/faq-assets/authenticseal2.jpg";
import fake1 from "@/faq-assets/fakeseal.png";
import fake2 from "@/faq-assets/fakeseal2.png";
import faqBadge from "@/assets/avatars/faqbadge.png";

const sections = [
  {
    title: "General",
    content: (
      <>
        <h2 className="font-semibold mb-2">What is MLPEKAYOU?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          MLPEKAYOU is a fan-made collection website for all North American Kayou releases. Chinese and SEA cards will not be featured on this website.
        </p>

        <h2 className="font-semibold mb-2">How do I use it?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Open a set and flip over cards you already own. This will track your progress and update your ISO both privcately and publicly for you. You can mark cards for trade in the trades tab and monitor the leaderboards.
        </p>
        <h2 className="font-semibold mb-2">How is MLPEKAYOU funded?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          I fund MLPEKAYOU out of my own pocket. If you'd like to support, you can find my TikTok linked in the menu, and order KayouUS products directly from Kayou's store by finding products linked in my videos.
        </p>
        <h2 className="font-semibold mb-2">Why are the episode cards repeated twice in Fun Moments?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          This has been a popular question. Look closely at all of your "N" cards. There are 20 "N" cards and 20 "⬦N" cards, which are identical, but with for a golden foil.
        </p>
      </>
    )
  },
  {
    title: "Trading",
    content: (
      <>
        <h2 className="font-semibold mb-2">How does trading work?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Mark cards in "My Trades" and other users can find you.
        </p>

        <h2 className="font-semibold mb-2">Why don’t I show up?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          You must set your Discord username in your profile.
        </p>

        <h2 className="font-semibold mb-2">How do you keep high rarity ISOs from getting flooded will all users?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Only people who have interacted with a set will appear in the ISO section for high-rarity cards. If you've never collected part of a set, you will not appear in the ISO for the rarer cards.
        </p>
      </>
    )
  },
  {
    title: "Progress",
    content: (
      <>
        <h2 className="font-semibold mb-2">How is progress tracked?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          All cards are marked as 'not owned' when your account is created. Flipping a card to show its back means you own that card.
        </p>

        <h2 className="font-semibold mb-2">Why is my ISO so full?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Any and all cards you do not own will appear on your ISO both privately and publicly. Simply tap "Hide Sets" if you are not interested in owning a set.
        </p>
        <h2 className="font-semibold mb-2">How do I track duplicates?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Go to the "My Inventory" tab to both mark cards for trade and update your duplicates.
        </p>
      </>
    )
  },
  {
    title: "Resealing",
    content: (
      <>
        <h2 className="font-semibold mb-2">What is resealing in China?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Resealing is an extremely common practice in China's secondary market. A person or distributor will buy cases of product and sift through the boxes using machines that detect hits. These detectors look for boxes and packs that contain cards like SGR, ZR, SC, and ⬦ZR. These cards after often made of more detectable materials than common cards. Once the hit cards have been pulled, they will replace them with a common card, reseal the pack, and then reseal the box. Once it's put back together, they can sell the resealed boxes for MSRP or higher on websites like Aliexpress, and sell the hit cards on the secondary market.
        </p>

        <h2 className="font-semibold mb-2">Does this happen in America?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Resealing began in America's Pokemon market, and as those scalpers have begun picking up My Little Pony off the shelves, they've deployed the same tactics to scalp My Little Pony packs. They weigh the packs and remove packs that contain hits, then resell the packs they know contain nothing back to you at MSRP on websites like eBay and Mercari.
        </p>

        <h2 className="font-semibold mb-2">How can I avoid resealed packs and boxes?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Do not buy packs or boxes from random sellers on platforms like eBay and Mercari. Many of those people are resellers, and many of them are scalpers. Only ever buy Kayou packs and boxes from trusted sources.
        </p>

        <h2 className="font-semibold mb-2">Where can I find trusted sources?</h2>
        <div className="mb-4 space-y-3">

  {/* 🇺🇸 US SOURCES */}
  <div>
    <div className="text-xs font-semibold text-[#5c4022] mb-2">
      US Sources
    </div>

    <div className="flex flex-wrap gap-2">

      <a
        href="https://shop.kayouofficial.com/us"
        target="_blank"
        className="px-3 py-1.5 rounded-lg bg-[#5a3e84] text-[#f5e6a8] text-xs font-semibold border border-[#d4af37]/40 hover:brightness-110 transition"
      >
        KAYOUUS
      </a>

      <a
        href="https://crossingtcg.com/collections/kayou"
        target="_blank"
        className="px-3 py-1.5 rounded-lg bg-[#5a3e84] text-[#f5e6a8] text-xs font-semibold border border-[#d4af37]/40 hover:brightness-110 transition"
      >
        CROSSINGTCG
      </a>

      <a
        href="https://stonestradingco.com/"
        target="_blank"
        className="px-3 py-1.5 rounded-lg bg-[#5a3e84] text-[#f5e6a8] text-xs font-semibold border border-[#d4af37]/40 hover:brightness-110 transition"
      >
        STONE
      </a>
    </div>
  </div>

  {/* 🇨🇳 CHINESE SOURCES */}
  <div>
    <div className="text-xs font-semibold text-[#5c4022] mb-2">
      Chinese & SEA Sources
    </div>

    <div className="flex flex-wrap gap-2">
      <a
        href="https://funtcg.com/collections/my-little-pony-trading-cards"
        target="_blank"
        className="px-3 py-1.5 rounded-lg bg-[#5a3e84] text-[#f5e6a8] text-xs font-semibold border border-[#d4af37]/40 hover:brightness-110 transition"
      >
        KAYOUHK
      </a>

      <a
        href="https://www.myprismatcg.com/collections/all-products"
        target="_blank"
        className="px-3 py-1.5 rounded-lg bg-[#5a3e84] text-[#f5e6a8] text-xs font-semibold border border-[#d4af37]/40 hover:brightness-110 transition"
      >
        AMBER'S PONY COVE
      </a>
    </div>
  </div>

  <h2 className="font-semibold mb-2">What about Aliexpress?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Aliexpress is unfortunately the main cesspool of resealed product. You will not be able to find product that is not fake or resealed. Kayou explicitly asks that buyers stay away from Aliexpress while they figure out how to fix this problem.
        </p>

</div>
      </>
    )
  },
   {
    title: "Counterfiet Products",
    content: (
      <>
        <p className="mb-4 text-sm text-[#5c4022]">
  The explanation provided below uses images and knowledge from{" "}
  <a
    href="https://www.myprismatcg.com/blogs/guide/spot-fake-mlp-kayou-boxes"
    target="_blank"
    className="text-[#5a3e84] font-semibold hover:underline"
  >
    Amber's Pony Cove
  </a>
  , and pertains to Chinese products. There are currently no known fakes of American products.
</p>
         <h2 className="font-semibold mb-2">Where do all of these counterfiets come from?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Aliexpress is unfortunately the main cesspool of 假冒产品, or 'counterfiet products.' You will not be able to find product that is not fake or resealed on this website. Kayou explicitly asks that buyers stay away from Aliexpress while they figure out how to fix this problem.
        </p>
        <h2 className="font-semibold mb-2">What are the early signs that my box is resealed or counterfiet?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          The quality of a fake product varies around which distributor you bought your fake from. Some are better than others at hiding their evidence. The first thing you should look at is the quality of Kayou's logo on the seal.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4 w-full">

  <div>
    <div className="text-xs text-green-600 font-semibold mb-1">Authentic</div>
    <img src={authentic1} className="w-full h-32 object-cover block rounded-lg border border-[#d4af37]/40" />
  </div>

  <div>
    <div className="text-xs text-green-600 font-semibold mb-1">Authentic</div>
    <img src={authentic2} className="w-full h-32 object-cover block rounded-lg border border-[#d4af37]/40" />
  </div>

  <div>
    <div className="text-xs text-red-500 font-semibold mb-1">Fake</div>
    <img src={fake1} className="w-full h-32 object-cover block rounded-lg border border-[#d4af37]/40" />
  </div>

  <div>
    <div className="text-xs text-red-500 font-semibold mb-1">Fake</div>
    <img src={fake2} className="w-full h-32 object-cover block rounded-lg border border-[#d4af37]/40" />
  </div>
</div>
<p className="mt-2 text-xs text-[#5a3e84]">
  As a reminder, all knowledge and images were consentually provided by{" "}
  <a
    href="https://www.myprismatcg.com/blogs/guide/spot-fake-mlp-kayou-boxes"
    target="_blank"
    className="font-semibold hover:underline"
  >
    Amber's Pony Cove
  </a>.
</p>
<p className="mt-4 mb-4 text-sm text-[#5c4022]">
        As you can see, the logos printed on the seal on the resealed/counterfiet products often times are blurry and low-quality, whereas on Kayou's official boxes, they are much harder to see due to their opaque nature and finer print. This also pertains to the Kayou strip seal that surrounds the box, it should never be smudged or low quality.
        </p>
        <p className="mt-4 mb-4 text-sm text-[#5c4022]">
  If you'd rather see the explanation in a video, you can see{" "}
  <a
    href="https://www.youtube.com/watch?v=UVe_9kq_Yx4"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#5a3e84] font-semibold hover:underline"
  >
    Amber's Pony Cove's educational video
  </a>.
</p>
      </>
    )
  },
];

const FAQ = () => {
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
  }}
    >
      <KayouHeader />

      <div className="max-w-5xl mx-auto p-4 sm:p-6">

        {/* HEADER */}
        <div className="text-center mb-6">
  <img
    src={faqBadge}
    alt="FAQ"
    className="mx-auto h-20 object-contain"
  />
        </div>

        {/* LAYOUT */}
        {/* TABS */}
<div className="md:hidden mb-4">

  {/* TOGGLE BUTTON */}
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    className="w-full px-4 py-2 bg-[#5a3e84] text-[#f5e6a8] rounded-lg"
  >
    {sections[active].title} {menuOpen ? "▲" : "▾"}
  </button>

  {/* DROPDOWN MENU */}
  {menuOpen && (
    <div className="mt-2 bg-white rounded-lg border border-[#d4af37]/40 overflow-hidden">
      {sections.map((section, index) => (
        <button
          key={index}
          onClick={() => {
            setActive(index);
            setMenuOpen(false);
          }}
          className="w-full text-left px-4 py-2 text-[#3b2a1a] hover:bg-gray-100"
        >
          {section.title}
        </button>
      ))}
    </div>
  )}

</div>

{/* DESKTOP LAYOUT */}
<div className="hidden md:flex gap-6">

  {/* CONTENT */}
  <div className="flex-1 bg-white/70 backdrop-blur-sm border border-[#d4af37]/40 rounded-xl p-5">
    {sections[active].content}
  </div>

  {/* TABS (RIGHT SIDE DESKTOP ONLY) */}
  <div className="w-48 flex flex-col gap-2">
    {sections.map((section, index) => (
      <button
        key={index}
        onClick={() => setActive(index)}
        className={`text-left px-4 py-2 rounded-lg transition ${
          active === index
            ? "bg-[#5a3e84] text-[#f5e6a8]"
            : "bg-white/60 text-[#3b2a1a] hover:bg-white"
        }`}
      >
        {section.title}
      </button>
    ))}
  </div>

</div>

{/* MOBILE CONTENT */}
<div className="md:hidden bg-white/70 backdrop-blur-sm border border-[#d4af37]/40 rounded-xl p-5">
  {sections[active].content}
</div>

        </div>
<footer className="py-4 sm:py-5 text-center text-[10px] sm:text-xs text-black">
        <div className="max-w-lg mx-auto">
          <p>This website is not run or owned by Kayou.</p>

          <p className="text-[7px] sm:text-[8px] italic">
            All rights to respective owners. All rights to Kayou.
          </p>

          <p>
            This is a fan-made collector tool that generates zero profit and will not run ads or promote a subscription.
          </p>

          <img
            src="/logos/collab-logo.png"
            alt="MLPEKAYOU x KAYOU"
            className="mx-auto h-10 sm:h-14 opacity-90"
          />
        </div>
      </footer>
      </div>

  );
};

export default FAQ;