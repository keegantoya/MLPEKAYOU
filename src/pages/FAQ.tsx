import KayouHeader from "@/components/KayouHeader";
import { useState } from "react";
import authentic1 from "@/faq-assets/authenticseal1.jpg";
import authentic2 from "@/faq-assets/authenticseal2.jpg";
import fake1 from "@/faq-assets/fakeseal.png";
import fake2 from "@/faq-assets/fakeseal2.png";
import faqBadge from "@/assets/avatars/faqbadge.png";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import tutorialCardBack from "/card-backs/third-moon-edition-backs/m3scback.jpg";
import tutorialCard1 from "/cards/third-edition-moon/M3SC004.jpg";
import tutorialCard2 from "/cards/third-edition-moon/M3SC002.jpg";

/// FAQ BIBLE IMPORTS ///

/// STAR EDITION
import eternalStarFaq1 from "/faq-mlp-bibles/eternalstarfaq1.png";
import eternalStarFaq2 from "/faq-mlp-bibles/eternalstarfaq2.png";
import eternalStarFaq3 from "/faq-mlp-bibles/eternalstarfaq3.png";
import eternalStarPackConfigs from "/faq-mlp-bibles/packconfigs-star.png";

/// MOON EDITIONS
import eternalMoonFaq1 from "/faq-mlp-bibles/eternalmoonfaq1.png";
import eternalMoonFaq2 from "/faq-mlp-bibles/eternalmoonfaq2.png";
import eternalMoonPackConfigs from "/faq-mlp-bibles/packconfigs-moon1.png";
import eternalMoon2Faq1 from "/faq-mlp-bibles/eternalmoon2faq1.png";
import eternalMoon2Faq2 from "/faq-mlp-bibles/eternalmoon2faq2.png";
import eternalMoon2Faq3 from "/faq-mlp-bibles/eternalmoon2faq3.png";
import eternalMoon2PackConfigs from "/faq-mlp-bibles/packconfigs-moon2A.png";
import eternalMoon2CPackConfigs from "/faq-mlp-bibles/packconfigs-moon2C.png";
import eternalMoon21NAFaq1 from "/faq-mlp-bibles/eternalmoon21NAfaq1.png";
import eternalMoon21NAFaq2 from "/faq-mlp-bibles/eternalmoon21NAfaq2.png";
import eternalMoon21NAPackConfigs from "/faq-mlp-bibles/packconfigs-moon21NA.png";
import eternalMoon21AFaq1 from "/faq-mlp-bibles/eternalmoon21Afaq1.png";
import eternalMoon21APackConfigs from "/faq-mlp-bibles/packconfigs-moon21A.png";
import eternalMoon3Faq1 from "/faq-mlp-bibles/eternalmoon3faq1.png";
import eternalMoon3Faq2 from "/faq-mlp-bibles/eternalmoon3faq2.png";
import eternalMoon3Faq3 from "/faq-mlp-bibles/eternalmoon3faq3.png";
import eternalMoon3PackConfigs from "/faq-mlp-bibles/packconfigs-moon3.png";

/// RAINBOW EDITIONS
import eternalRainbow1Faq1 from "/faq-mlp-bibles/eternalrainbow1faq1.png";
import eternalRainbow1Faq2 from "/faq-mlp-bibles/eternalrainbow1faq2.png";
import eternalRainbow1PackConfigs from "/faq-mlp-bibles/packconfigs-rainbow1.png";
import eternalRainbow2Faq1 from "/faq-mlp-bibles/eternalrainbow2faq1.png";
import eternalRainbow2Faq2 from "/faq-mlp-bibles/eternalrainbow2faq2.png";
import eternalRainbow2PackConfigs from "/faq-mlp-bibles/packconfigs-rainbow2.png";

/// FUN MOMENTS EDITION
import eternalFunMoments1Faq1 from "/faq-mlp-bibles/eternalfunmoments1faq1.png";
import eternalFunMoments1Faq2 from "/faq-mlp-bibles/eternalfunmoments1faq2.png";
import eternalFunMoments1PackConfigs from "/faq-mlp-bibles/packconfigs-funmoments1.png";
import eternalFunMoments2Faq1 from "/faq-mlp-bibles/eternalfunmoments2faq1.png";
import eternalFunMoments2Faq2 from "/faq-mlp-bibles/eternalfunmoments2faq2.png";
import eternalFunMoments2PackConfigs from "/faq-mlp-bibles/packconfigs-funmoments2A.png";
import eternalFunMoments2PackConfigsB from "/faq-mlp-bibles/packconfigs-funmoments2B.png";
import eternalFunMoments3Faq1 from "/faq-mlp-bibles/eternalfunmoments3faq1.png";
import eternalFunMoments3Faq2 from "/faq-mlp-bibles/eternalfunmoments3faq2.png";
import eternalFunMoments3Faq3 from "/faq-mlp-bibles/eternalfunmoments3faq3.png";
import eternalFunMoments3PackConfigs from "/faq-mlp-bibles/packconfigs-funmoments3.png";

/// FANTASY WONDERLAND 
import fantasyWonderlandFaq1 from "/faq-mlp-bibles/fantasywonderlandfaq1.png";
import fantasyWonderlandFaq2 from "/faq-mlp-bibles/fantasywonderlandfaq2.png";
import fantasyWonderlandFaq3 from "/faq-mlp-bibles/fantasywonderlandfaq3.png";
import fantasyWonderlandPackConfigs from "/faq-mlp-bibles/packconfigs-fantasywonderland.png";

/// FRIENDSHIPS BEGIN
import friendshipsBeginFaq1 from "/faq-mlp-bibles/friendshipsbeginfaq1.png";
import friendshipsBeginFaq2 from "/faq-mlp-bibles/friendshipsbeginfaq2.png";
import friendshipsBeginFaq3 from "/faq-mlp-bibles/friendshipsbeginfaq3.png";
import friendshipsBeginPackConfigs from "/faq-mlp-bibles/packconfigs-friendshipsbegin.png";

// OTHERS CATEGORY
import crossingPlushies from "/faq-mlp-bibles/crossingplushies.jpg";
import crossingPlushies2 from "/faq-mlp-bibles/crossingplushies2.jpg";

const FAQ = () => {
  const [active, setActive] = useState(0);
const [menuOpen, setMenuOpen] = useState<string | null>(null);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const navigate = useNavigate();

const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({
  "What is MLPEKAYOU?": true,
});

const [tutorialFlipped, setTutorialFlipped] = useState({
  card1: false,
  card2: false,
});

const FAQItem = ({ question, children }) => {
  const isOpen = !!openQuestions[question];

  const toggleQuestion = () => {
    setOpenQuestions((prev) => ({
      ...prev,
      [question]: !prev[question],
    }));
  };

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-white/80 shadow-sm">
      <button
        onClick={toggleQuestion}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/60 transition"
      >
        <h2 className="font-semibold text-xl text-[#2f1b4d]">
          {question}
        </h2>

        <div className="w-10 h-10 rounded-full bg-[#5a3e84] text-[#f5e6a8] flex items-center justify-center shadow-md shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 text-sm text-[#5c4022] leading-7">
          {children}
        </div>
      )}
    </div>
  );
};

const TutorialCard = ({ image, flipped, onClick }) => {
  return (
    <div
      className="aspect-[5/7] cursor-pointer perspective relative w-36 sm:w-44"
      onClick={onClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        <img
          src={image}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover rounded-lg backface-hidden"
        />

        <img
          src={tutorialCardBack}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
        />
      </div>
    </div>
  );
};
  const sections = [
    {
  title: "General",
  content: (
    <div className="space-y-4">
      {[
        "MLPEKAYOU Tutorial",
        "General",
        "Trading",
        "Progress",
        "Resealed Products",
        "Counterfeit Products",
        "Are My Cards Fake?"
      ].map((topic) => (
        <button
          key={topic}
          onClick={() => {
            const targetIndex = sections.findIndex(
              (section) => section.title === topic
            );
            if (targetIndex !== -1) setActive(targetIndex);
          }}
          className="w-full text-left px-5 py-4 rounded-2xl font-semibold
                     bg-violet-50 text-violet-900 hover:bg-violet-100
                     border border-violet-100 transition"
        >
          {topic}
        </button>
      ))}
    </div>
  ),
},

{
  title: "North American Products",
  content: (
    <div className="space-y-4">
      {[
        "Eternal Star",
        "Eternal Moon",
        "Eternal Rainbow",
        "Fun Moments",
        "Trading Card Game",
        "Others"
      ].map((topic) => (
        <button
          key={topic}
          onClick={() => {
            const targetIndex = sections.findIndex(
              (section) => section.title === topic
            );
            if (targetIndex !== -1) setActive(targetIndex);
          }}
          className="w-full text-left px-5 py-4 rounded-2xl font-semibold
                     bg-violet-50 text-violet-900 hover:bg-violet-100
                     border border-violet-100 transition"
        >
          {topic}
        </button>
      ))}
    </div>
  ),
},
{
  title: "MLPEKAYOU Tutorial",
  content: (
    <div className="space-y-8">
      <div className="rounded-3xl border border-violet-100 bg-white/80 backdrop-blur-sm shadow-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-violet-900 mb-3">
          How do I track the cards I own?
        </h2>

        <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8">
          Open the set you are tracking in{" "}
          <Link
            to="/collections"
            className="text-violet-600 font-semibold hover:underline"
          >
            Collections
          </Link>{" "}
          and flip over the cards you already own.
        </p>

        {/* Tutorial Cards */}
        <div className="text-center mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-500 mb-4">
            Flip Them Over!
          </p>

          <div className="flex justify-center gap-6 flex-wrap">
            <TutorialCard
              image={tutorialCard1}
              flipped={tutorialFlipped.card1}
              onClick={() =>
                setTutorialFlipped((prev) => ({
                  ...prev,
                  card1: !prev.card1,
                }))
              }
            />

            <TutorialCard
              image={tutorialCard2}
              flipped={tutorialFlipped.card2}
              onClick={() =>
                setTutorialFlipped((prev) => ({
                  ...prev,
                  card2: !prev.card2,
                }))
              }
            />
          </div>
        </div>

        {/* Completion Message */}
        {tutorialFlipped.card1 && tutorialFlipped.card2 && (
          <div className="animate-in fade-in duration-700 mt-8">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5 text-center">
              <p className="text-lg font-bold text-emerald-800 mb-2">
                Congratulations! You just tracked your progress.
              </p>
              <p className="text-sm text-emerald-700">
                (This is only a tutorial, this doesn't count. Don't worry.)
              </p>
            </div>
            <div className="pt-8 mt-8 border-t border-violet-100">
  <h2 className="text-3xl font-bold text-violet-900 mb-3">
    Where is my user data?
  </h2>

  <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
    If you are on PC, you will find your user data (progress, wishlist, iso, and more) saved in the sidebar
    menu that appears when you click your profile picture. On mobile,
    tap the profile icon in the bottom-right corner and open{" "}
    <span className="font-semibold text-violet-600">
      My Kayou Collection
    </span>{" "}
    to access all of your personal collection statistics.
  </p>
</div>
<div className="pt-8 mt-8 border-t border-violet-100">
  <h2 className="text-3xl font-bold text-violet-900 mb-3">
    How do I trade with someone?
  </h2>

  <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
    If someone has their Discord username linked to their account,
    it will always appear on their profile. Someone with their Discord
    linked can typically be found in the MLPEKAYOU Discord server.
    If the person you trade with is not honest or attempts to scam
    you, please alert the MLPEKAYOU Staff. Their account will be banned
    from the Discord, as well as their MLPEKAYOU account.
  </p>
</div>
          </div>
        )}
      </div>
    </div>
    
  ),
},
  {
    title: "General",
content: (
  <>
    <FAQItem question="What is MLPEKAYOU?">
      <p>
        MLPEKAYOU is a fan-made collection website for all North American
        Kayou releases. Chinese and SEA cards will not be featured on this
        website.
      </p>
    </FAQItem>

    <FAQItem question="How do I use it?">
      <p>
        Open a set and flip over cards you already own. This will track your
        progress and update your ISO both privately and publicly for you.
        You can mark cards for trade in the Trades tab and monitor the
        leaderboards.
      </p>
    </FAQItem>

    <FAQItem question="How is MLPEKAYOU funded?">
      <p>
        I fund MLPEKAYOU out of my own pocket. If you'd like to support,
        you can find my TikTok linked in the menu and order KayouUS
        products directly from Kayou's store by finding products linked
        in my videos.
      </p>
    </FAQItem>

    <FAQItem question="Why are the episode cards repeated twice in Fun Moments?">
      <p>
        Look closely at your "N" cards. There are 20 "N" cards and
        20 "⬦N" cards. They are identical, but the ⬦N versions
        feature gold foil.
      </p>
    </FAQItem>
  </>
)
  },
  {
    title: "Trading",
    content: (
  <>
    <FAQItem question="How does trading work?">
      <p>
        Mark cards in "My Trades" and other users can find you.
      </p>
    </FAQItem>

    <FAQItem question="Why don’t I show up?">
      <p>
        You must set your Discord username in your profile.
      </p>
    </FAQItem>
  </>
)
  },
  {
    title: "Progress",
content: (
  <>
    <FAQItem question="How is progress tracked?">
      <p>
        All cards are marked as "not owned" when your account is created.
        Flipping a card to show its back means you own that card.
      </p>
    </FAQItem>

    <FAQItem question="Why is my ISO so full?">
      <p>
        Any cards you do not own will appear on your ISO both privately
        and publicly. Simply tap "Hide Sets" if you are not interested
        in owning a set.
      </p>
    </FAQItem>

    <FAQItem question="How do I track duplicates?">
      <p>
        Go to the "My Inventory" tab to mark cards for trade and update
        your duplicate counts.
      </p>
    </FAQItem>
  </>
)
  },
  {
    title: "Resealed Products",
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
  {
    title: "Are my Cards Fake?",
    content: (
      <>
        <h2 className="font-semibold mb-2">"Are My Cards Fake?"</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Lately on the r/MLPKAYOU subreddit, this seems to be the most popular question among those who are not well versed in Kayou products. I will answer your questions here.
        </p>

        <h2 className="font-semibold mb-2">U.S. Cards - Are these fake?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          Many people have posted two identical cards side-by-side, but noted the difference in codes and the card's texture. This has been raising the question - is my card fake? Why is one sparklier than the other?
          First, let's take a look at the card codes. In the United States, the following codes correspond with these CCG sets:
        </p>
        <p
  onClick={() =>
    navigate("/collections", { state: { category: "fun-moments" } })
  }
    className="w-full mb-3 px-4 py-2 rounded-lg text-sm font-semibold text-[#3b2a1a]
             border border-[#d4af37]/60 shadow-md transition
             bg-gradient-to-r from-[#f5e6a8] via-[#d4af37] to-[#b8962e]
             hover:brightness-110 active:scale-[0.98]"
>
  FME - Fun Moments Edition
</p>
        <p
  onClick={() =>
    navigate("/collections", { state: { category: "rainbow" } })
  }
    className="w-full mb-3 px-4 py-2 rounded-lg text-sm font-semibold text-[#3b2a1a]
             border border-[#d4af37]/60 shadow-md transition
             bg-gradient-to-r from-[#f5e6a8] via-[#d4af37] to-[#b8962e]
             hover:brightness-110 active:scale-[0.98]"
>
  RBE - Rainbow Edition
</p>
        <p
  onClick={() =>
    navigate("/collections", { state: { category: "eternal-moon" } })
  }
    className="w-full mb-3 px-4 py-2 rounded-lg text-sm font-semibold text-[#3b2a1a]
             border border-[#d4af37]/60 shadow-md transition
             bg-gradient-to-r from-[#f5e6a8] via-[#d4af37] to-[#b8962e]
             hover:brightness-110 active:scale-[0.98]"
>
  MLPME - My Little Pony Moon Edition
</p>
        <p
  onClick={() =>
    navigate("/collections", { state: { category: "star" } })
  }
    className="w-full mb-3 px-4 py-2 rounded-lg text-sm font-semibold text-[#3b2a1a]
             border border-[#d4af37]/60 shadow-md transition
             bg-gradient-to-r from-[#f5e6a8] via-[#d4af37] to-[#b8962e]
             hover:brightness-110 active:scale-[0.98]"
>
  MLPSE - My Little Pony Star Edition
</p>
        <p className="mb-4 text-sm text-[#5c4022]">
          Any number that follows that code (MLPME01, RBE02, FME03, etc...) simply tells you what volume that set is. For example, FME03 represents 'Fun Moments Edition 3.' 
        </p>
        <h2 className="font-semibold mb-2">My cards are identical but different?</h2>
        <p className="mb-4 text-sm text-[#5c4022]">
          This seems to be where all of the newer collectors on r/MLPKAYOU are thinking they have purchased counterfeit cards. Below is images of the same card, but from two different sets.
        </p>
        <img
  src="/website-assets/fakecardxp1.png"
  alt="Example of similar cards from different sets"
  className="w-full h-auto mt-4 rounded-lg"
/>
<p className="mb-4 text-sm text-[#5c4022]">
        </p>
<p className="mb-4 text-sm text-[#5c4022]">
          Upon first glance, you would think these two cards are identical - but in print, they are not. Looking in the upper right-hand corner, you will see two different identification codes. One card is a Fun Moments card, and one is a Moon Edition card. Here art pictures of the cards from my personal collection, where you can see the differences.
        </p>
        <img
  src="/website-assets/fakecardxp2.png"
  alt="Example of similar cards from different sets"
  className="w-full h-auto mt-4 rounded-lg"
/>
<p className="mb-4 text-sm text-[#5c4022]">
        </p>
<p className="mb-4 text-sm text-[#5c4022]">
          Rest assured that both cards in this image are real. The card on the left holds significantly more detail than the card on the right despite them being the same card.
          </p>
          <p className="mb-4 text-sm text-[#5c4022]">
          Why? Because the card on the left comes from the Moon Editions, a set that is much more expensive than the card on the right, which comes from the Fun Moments Editions. A box of moon has higher quality prints due to the box price, and Fun Moments is the budget set version, which utilizes reprints with less expensive qualities to make a cheaper box.
          </p>
          <p className="mb-4 text-sm text-[#5c4022]">
            This applies to the Chinese sets. Their version of Moon Edition will begin with "HY," and the identical card to the one above will be "HY08-SR-001." The identical Fun Moments card will be in their Shadow set, with the code "QY05-SR-001."
        </p>
        <img
  src="/website-assets/fakecardxp3.png"
  alt="Example of similar cards from different sets but Chinese"
  className="w-full h-auto mt-4 rounded-lg"
/>
<p className="mb-4 text-sm text-[#5c4022]">
        </p>
        <p className="mb-4 text-sm text-[#5c4022]">
          Most fake cards you find are going to be Chinese, as the Western market has only seen scalpers thus far, not fakes. There is no benefit in these distributors who reseal Chinese boxes to plant fakes unless they are higher rarity cards, as the cost to reprint a fake cannot be justified with such a low tier card.
        </p>
        <p className="mb-2 text-sm text-[#5c4022]">
  The only time you will see genuine fakes is with cards like CR, ZR, SC, and ⬦ZR. These are the most profitable cards to turn into fakes for selling purposes. If you find a fake of a lower tier card, it is most likely a fake box, which is only an option in Chinese and often something people fall victim to on Aliexpress.
</p>

<p className="mb-4 text-sm font-semibold text-[#5c4022]">
  (PSA: KAYOUUS ASKS THAT YOU PLEASE AVOID ALIEXPRESS AT ALL COSTS! THE PLATFORM IS FULL OF NOTHING BUT RESEALED PRODUCT. IF YOU ARE LOOKING FOR REPUTABLE SOURCES TO BUY FROM, SEE{" "}
  <span
    onClick={() => setActive(3)}
    className="text-[#5a3e84] cursor-pointer hover:underline"
  >
    HERE
  </span>
  .)
</p>
<p className="mb-4 text-sm text-[#5c4022]">
  See true fake cards below.
        </p>
        <img
  src="/website-assets/fakecardxp4.png"
  alt="Straight up fake cards"
  className="w-full h-auto mt-4 rounded-lg"
/>
      </>
    )
  },
{
  title: "Eternal Star",
  content: (
    <div className="space-y-6">

      <div className="text-center">
  <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
    STAR ONE
  </span>
</div>

      <img
        src={eternalStarFaq1}
        alt="Eternal Star FAQ Page 1"
        className="w-full h-auto"
      />

      <img
        src={eternalStarFaq2}
        alt="Eternal Star FAQ Page 2"
        className="w-full h-auto"
      />

      <img
        src={eternalStarFaq3}
        alt="Eternal Star FAQ Page 3"
        className="w-full h-auto"
      />

      <img
        src={eternalStarPackConfigs}
        alt="Eternal Star Pack Configurations"
        className="w-full h-auto"
      />
    </div>
  ),
},

{
  title: "Eternal Moon",
  content: (
    <div className="space-y-6">
      <div className="text-center">
        <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
          MOON ONE
        </span>
      </div>

      <img
        src={eternalMoonFaq1}
        alt="Eternal Moon FAQ Page 1"
        className="w-full h-auto"
      />

      <img
        src={eternalMoonFaq2}
        alt="Eternal Moon FAQ Page 2"
        className="w-full h-auto"
      />

      <img
        src={eternalMoonPackConfigs}
        alt="Eternal Moon Pack Configurations"
        className="w-full h-auto"
      />

      <div className="text-center pt-4">
        <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
          MOON TWO
        </span>
      </div>

      <img
        src={eternalMoon2Faq1}
        alt="Eternal Moon Volume 2 FAQ Page 1"
        className="w-full h-auto"
      />

      <img
        src={eternalMoon2Faq2}
        alt="Eternal Moon Volume 2 FAQ Page 2"
        className="w-full h-auto"
      />

      <img
        src={eternalMoon2Faq3}
        alt="Eternal Moon Volume 2 FAQ Page 3"
        className="w-full h-auto"
      />

      <img
        src={eternalMoon2PackConfigs}
        alt="Eternal Moon Volume 2 Pack Configurations"
        className="w-full h-auto"
      />

      <img
        src={eternalMoon2CPackConfigs}
        alt="Eternal Moon Volume 2C Pack Configurations"
        className="w-full h-auto"
      />

      <img
  src={eternalMoon21NAFaq1}
  alt="Eternal Moon 2.1 North American Variant FAQ Page 1"
  className="w-full h-auto"
/>

<img
  src={eternalMoon21NAFaq2}
  alt="Eternal Moon 2.1 North American Variant FAQ Page 2"
  className="w-full h-auto"
/>

<img
  src={eternalMoon21NAPackConfigs}
  alt="Eternal Moon 2.1 North American Variant Pack Configurations"
  className="w-full h-auto"
/>

<img
  src={eternalMoon21AFaq1}
  alt="Eternal Moon 2.1A Variant FAQ Page 1"
  className="w-full h-auto"
/>

<img
  src={eternalMoon21APackConfigs}
  alt="Eternal Moon 2.1A Variant Pack Configurations"
  className="w-full h-auto"
/>

<div className="text-center pt-4">
  <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
    MOON THREE
  </span>
</div>

<img
  src={eternalMoon3Faq1}
  alt="Eternal Moon Volume 3 FAQ Page 1"
  className="w-full h-auto"
/>

<img
  src={eternalMoon3Faq2}
  alt="Eternal Moon Volume 3 FAQ Page 2"
  className="w-full h-auto"
/>

<img
  src={eternalMoon3Faq3}
  alt="Eternal Moon Volume 3 FAQ Page 3"
  className="w-full h-auto"
/>

<img
  src={eternalMoon3PackConfigs}
  alt="Eternal Moon Volume 3 Pack Configurations"
  className="w-full h-auto"
/>
    </div>
  ),
},

{
  title: "Eternal Rainbow",
  content: (
    <div className="space-y-6">
      <div className="text-center">
        <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
          RAINBOW ONE
        </span>
      </div>

      <img
        src={eternalRainbow1Faq1}
        alt="Eternal Rainbow Volume 1 FAQ Page 1"
        className="w-full h-auto"
      />

      <img
        src={eternalRainbow1Faq2}
        alt="Eternal Rainbow Volume 1 FAQ Page 2"
        className="w-full h-auto"
      />

      <img
        src={eternalRainbow1PackConfigs}
        alt="Eternal Rainbow Volume 1 Pack Configurations"
        className="w-full h-auto"
      />

      <div className="text-center pt-4">
        <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
          RAINBOW TWO
        </span>

        <img
  src={eternalRainbow2Faq1}
  alt="Eternal Rainbow Volume 2 FAQ Page 1"
  className="w-full h-auto mt-10"
/>

<img
  src={eternalRainbow2Faq2}
  alt="Eternal Rainbow Volume 2 FAQ Page 2"
  className="w-full h-auto"
/>

<img
  src={eternalRainbow2PackConfigs}
  alt="Eternal Rainbow Volume 2 Pack Configurations"
  className="w-full h-auto"
/>
      </div>
    </div>
  ),
},

{
  title: "Fun Moments",
  content: (
    <div className="space-y-6">
      <div className="text-center">
        <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
          FUN MOMENTS ONE
        </span>
      </div>

      <img
        src={eternalFunMoments1Faq1}
        alt="Fun Moments Volume 1 FAQ Page 1"
        className="w-full h-auto"
      />

      <img
        src={eternalFunMoments1Faq2}
        alt="Fun Moments Volume 1 FAQ Page 2"
        className="w-full h-auto"
      />

      <img
        src={eternalFunMoments1PackConfigs}
        alt="Fun Moments Volume 1 Pack Configurations"
        className="w-full h-auto"
      />

      <div className="text-center pt-4">
  <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
    FUN MOMENTS TWO
  </span>
</div>

<div className="pt-2">
  <img
    src={eternalFunMoments2Faq1}
    alt="Fun Moments Volume 2 FAQ Page 1"
    className="w-full h-auto"
  />
</div>

<img
  src={eternalFunMoments2Faq2}
  alt="Fun Moments Volume 2 FAQ Page 2"
  className="w-full h-auto"
/>

<img
  src={eternalFunMoments2PackConfigs}
  alt="Fun Moments Volume 2A Pack Configurations"
  className="w-full h-auto"
/>

<img
  src={eternalFunMoments2PackConfigsB}
  alt="Fun Moments Volume 2B Pack Configurations"
  className="w-full h-auto"
/>

<div className="text-center pt-4">
  <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
    FUN MOMENTS THREE
  </span>
</div>

<div className="pt-2">
  <img
    src={eternalFunMoments3Faq1}
    alt="Fun Moments Volume 3 FAQ Page 1"
    className="w-full h-auto"
  />
</div>

<img
  src={eternalFunMoments3Faq2}
  alt="Fun Moments Volume 3 FAQ Page 2"
  className="w-full h-auto"
/>

<img
  src={eternalFunMoments3Faq3}
  alt="Fun Moments Volume 3 FAQ Page 3"
  className="w-full h-auto"
/>

<img
  src={eternalFunMoments3PackConfigs}
  alt="Fun Moments Volume 3 Pack Configurations"
  className="w-full h-auto"
/>

    </div>
  ),
},

{
  title: "Trading Card Game",
  content: (
    <div className="space-y-6">

      <div className="text-center">
        <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
          FANTASY WONDERLAND
        </span>
      </div>

      <img
        src={fantasyWonderlandFaq1}
        alt="Fantasy Wonderland FAQ Page 1"
        className="w-full h-auto"
      />

      <img
        src={fantasyWonderlandFaq2}
        alt="Fantasy Wonderland FAQ Page 2"
        className="w-full h-auto"
      />

      <img
        src={fantasyWonderlandFaq3}
        alt="Fantasy Wonderland FAQ Page 3"
        className="w-full h-auto"
      />

      <img
        src={fantasyWonderlandPackConfigs}
        alt="Fantasy Wonderland Pack Configurations"
        className="w-full h-auto"
      />

<div className="text-center pt-4">
  <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
    FRIENDSHIPS BEGIN
  </span>
</div>

<img
  src={friendshipsBeginFaq1}
  alt="Friendships Begin FAQ Page 1"
  className="w-full h-auto"
/>

<img
  src={friendshipsBeginFaq2}
  alt="Friendships Begin FAQ Page 2"
  className="w-full h-auto"
/>

<img
  src={friendshipsBeginFaq3}
  alt="Friendships Begin FAQ Page 3"
  className="w-full h-auto"
/>

<img
  src={friendshipsBeginPackConfigs}
  alt="Friendships Begin Pack Configurations"
  className="w-full h-auto"
/>

    </div>
  ),
},

{
  title: "Others",
  content: (
    <div className="space-y-6">

      <div className="text-center">
        <span className="inline-block px-6 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-[0.3em]">
          PLUSH MERCH
        </span>
      </div>

      <img
        src={crossingPlushies}
        alt="CrossingTCG Plush Merch"
        className="w-full h-auto rounded-lg"
      />

      <img
        src={crossingPlushies2}
        alt="CrossingTCG Plush Merch 2"
        className="w-full h-auto rounded-lg"
      />

      <p className="text-sm text-violet-900 leading-7">
        These plushies showed up on CrossingTCG's website alongside the release
        of Kayou's trading cards. They are over a foot tall (16.5in) and over
        a foot long (17.3in). They retail for $29.99 each. Purchase through{" "}
        <a
          href="https://www.tiktok.com/t/ZP9YXypBLC65Q-hhq5j/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 font-semibold hover:underline"
        >
          this link
        </a>{" "}
        for free shipping through their TikTok Shop, otherwise the shipping fee
        on their website is $8.99 unless you are purchasing over $100 of product.
      </p>

    </div>
  ),
},
];

  return (
    <div
      className="min-h-screen"
    style={{
  backgroundColor: "#F8F3FF",
  backgroundImage: `
    radial-gradient(circle at 15% 20%, rgba(244, 200, 74, 0.12) 0%, transparent 35%),
    radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.08) 0%, transparent 30%),
    radial-gradient(circle at 25% 75%, rgba(168, 85, 247, 0.10) 0%, transparent 35%),
    radial-gradient(circle at 75% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 30%),
    linear-gradient(
      180deg,
      #FCF9FF 0%,
      #F8F1FF 35%,
      #F5EEFF 65%,
      #FAF6FF 100%
    )
  `,
}}
    >
      <KayouHeader />

<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

  {/* HERO HEADER */}
  <section className="relative mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/85 backdrop-blur-xl shadow-2xl">
    <div className="absolute inset-0 bg-gradient-to-r from-violet-100/60 via-white/30 to-yellow-100/50" />
    <div className="absolute top-0 inset-x-0 h-px bg-white/80" />

    <div className="relative z-10 px-8 py-10 text-center">
    <div className="flex flex-col items-center">
  <h1
    className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight
           bg-gradient-to-r from-violet-700 via-purple-600 to-violet-400
           bg-clip-text text-transparent drop-shadow-sm"
    style={{
      fontFamily: '"Cinzel Decorative", "Trajan Pro", serif',
      textShadow: "0 4px 20px rgba(124, 58, 237, 0.15)",
    }}
  >
    KAYOUUS FAQ
  </h1>

  <div className="mt-4 flex items-center gap-3">
    <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-400" />
    <span className="text-yellow-500 text-xl">✦</span>
    <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-400" />
  </div>
</div>

      <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-violet-800 leading-relaxed">
        If the answer to your question does not lie in this FAQ, feel free to leave it
        in the questions section of the MLPEKAYOU Discord server. A staff member or server owner
        will get back to you as soon as possible.
      </p>
    </div>
  </section>

{/* MOBILE CATEGORY SELECTOR */}
<div className="md:hidden mb-6">
  {(() => {
    const groups = [
      {
        title: "General",
        children: [
          "MLPEKAYOU Tutorial",
          "General",
          "Trading",
          "Progress",
          "Resealed Products",
          "Counterfiet Products",
          "Are my Cards Fake?",
        ],
      },
      {
        title: "North American Products",
        children: [
          "Eternal Star",
          "Eternal Moon",
          "Eternal Rainbow",
          "Fun Moments",
          "Trading Card Game",
          "Others",
        ],
      },
    ];

    const selectedGroup =
      groups.find((group) => group.title === menuOpen) ?? groups[0];

    return (
      <>
        {/* Current Parent Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full px-5 py-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-violet-100 shadow-lg text-violet-900 font-semibold flex items-center justify-between"
        >
          <span>{selectedGroup.title}</span>
          <span className="text-xl">{mobileMenuOpen ? "▲" : "▾"}</span>
        </button>

        {mobileMenuOpen && (
          <div className="mt-3 p-2 rounded-2xl bg-white/95 backdrop-blur-sm border border-violet-100 shadow-xl">
            {/* Parent Categories */}
            <div className="space-y-2">
              {groups.map((group) => (
                <button
                  key={group.title}
                  onClick={() => setMenuOpen(group.title)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition ${
                    menuOpen === group.title
                      ? "bg-gradient-to-r from-[#6E4BA8] via-[#7C5CB8] to-[#8E72CC] text-white shadow-md"
                      : "text-violet-900 hover:bg-violet-50"
                  }`}
                >
                  {group.title}
                </button>
              ))}
            </div>

            {/* Children of Selected Parent */}
            <div className="mt-3 pt-3 border-t border-violet-100 space-y-2">
              {selectedGroup.children.map((child) => {
                const index = sections.findIndex(
                  (section) => section.title === child
                );

                if (index === -1) return null;

                return (
                  <button
                    key={child}
                    onClick={() => {
  setActive(index);

  const parentGroup = groups.find((group) =>
    group.children.includes(child)
  );

  if (parentGroup) {
    setMenuOpen(parentGroup.title);
  }

  setMobileMenuOpen(false);
}}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      active === index
                        ? "bg-violet-600 text-white shadow-md"
                        : "bg-violet-50 text-violet-900 hover:bg-violet-100"
                    }`}
                  >
                    {child}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  })()}
</div>

  {/* DESKTOP LAYOUT */}
  <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-8 items-start">

{/* LEFT SIDEBAR */}
<aside className="sticky top-24">
  <div className="rounded-[28px] border border-white/70 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden">
    <div className="px-6 py-5 bg-gradient-to-r from-[#6E4BA8] via-[#7C5CB8] to-[#8E72CC]">
      <h2 className="text-white text-xl font-bold tracking-wide">
        Help Topics
      </h2>
    </div>

    <div className="p-4 space-y-3">
      {[
        {
          title: "General",
          children: [
            "MLPEKAYOU Tutorial",
            "General",
            "Trading",
            "Progress",
            "Resealed Products",
            "Counterfiet Products",
            "Are my Cards Fake?",
          ],
        },
        {
          title: "North American Products",
          children: [
            "Eternal Star",
            "Eternal Moon",
            "Eternal Rainbow",
            "Fun Moments",
            "Trading Card Game",
            "Others",
          ],
        },
      ].map((group) => {
        const isOpen = menuOpen === group.title;

        return (
          <div key={group.title}>
            {/* Parent Button */}
            <button
              onClick={() =>
                setMenuOpen(isOpen ? null : group.title)
              }
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl
                         font-bold text-left bg-gradient-to-r
                         from-[#6E4BA8] via-[#7C5CB8] to-[#8E72CC]
                         text-white shadow-lg"
            >
              <span>{group.title}</span>
              <span className="text-lg">
                {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* Child Pages */}
            {isOpen && (
              <div className="mt-2 ml-3 space-y-2">
                {group.children.map((child) => {
                  const index = sections.findIndex(
                    (section) => section.title === child
                  );

                  if (index === -1) return null;

                  return (
                    <button
                      key={child}
                      onClick={() => setActive(index)}
                      className={`w-full text-left px-4 py-2 rounded-xl
                                 text-sm font-semibold transition ${
                        active === index
                          ? "bg-violet-600 text-white shadow-md"
                          : "bg-violet-50 text-violet-900 hover:bg-violet-100"
                      }`}
                    >
                      {child}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
</aside>

    {/* MAIN CONTENT */}
    <main className="rounded-[32px] border border-white/70 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="px-8 py-6 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white">
        <h1 className="text-3xl font-bold text-violet-900">
          {sections[active].title}
        </h1>
      </div>

      <div className="p-8">
        {sections[active].content}
      </div>
    </main>
  </div>

  {/* MOBILE CONTENT */}
  <div className="md:hidden rounded-[28px] border border-white/70 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden">
    <div className="px-6 py-5 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white">
      <h1 className="text-2xl font-bold text-violet-900">
        {sections[active].title}
      </h1>
    </div>

    <div className="p-6">
      {sections[active].content}
    </div>
  </div>

</div>
      </div>

  );
};

export default FAQ;