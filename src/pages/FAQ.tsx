import { useState } from "react";
import authentic1 from "@/faq-assets/authenticseal1.webp";
import authentic2 from "@/faq-assets/authenticseal2.webp";
import fake1 from "@/faq-assets/fakeseal.webp";
import fake2 from "@/faq-assets/fakeseal2.webp";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import tutorialCardBack from "/card-backs/third-moon-edition-backs/m3scback.webp";
import tutorialCard1 from "/cards/third-edition-moon/M3SC004.webp";
import tutorialCard2 from "/cards/third-edition-moon/M3SC002.webp";

/// FAQ BIBLE IMPORTS ///

/// STAR EDITION
import eternalStarFaq1 from "/faq-mlp-bibles/eternalstarfaq1.webp";
import eternalStarFaq2 from "/faq-mlp-bibles/eternalstarfaq2.webp";
import eternalStarFaq3 from "/faq-mlp-bibles/eternalstarfaq3.webp";
import eternalStarPackConfigs from "/faq-mlp-bibles/packconfigs-star.webp";

/// MOON EDITIONS
import eternalMoonFaq1 from "/faq-mlp-bibles/eternalmoonfaq1.webp";
import eternalMoonFaq2 from "/faq-mlp-bibles/eternalmoonfaq2.webp";
import eternalMoonPackConfigs from "/faq-mlp-bibles/packconfigs-moon1.webp";
import eternalMoon2Faq1 from "/faq-mlp-bibles/eternalmoon2faq1.webp";
import eternalMoon2Faq2 from "/faq-mlp-bibles/eternalmoon2faq2.webp";
import eternalMoon2Faq3 from "/faq-mlp-bibles/eternalmoon2faq3.webp";
import eternalMoon2PackConfigs from "/faq-mlp-bibles/packconfigs-moon2A.webp";
import eternalMoon2CPackConfigs from "/faq-mlp-bibles/packconfigs-moon2C.webp";
import eternalMoon21NAFaq1 from "/faq-mlp-bibles/eternalmoon21NAfaq1.webp";
import eternalMoon21NAFaq2 from "/faq-mlp-bibles/eternalmoon21NAfaq2.webp";
import eternalMoon21NAPackConfigs from "/faq-mlp-bibles/packconfigs-moon21NA.webp";
import eternalMoon21AFaq1 from "/faq-mlp-bibles/eternalmoon21Afaq1.webp";
import eternalMoon21APackConfigs from "/faq-mlp-bibles/packconfigs-moon21A.webp";
import eternalMoon3Faq1 from "/faq-mlp-bibles/eternalmoon3faq1.webp";
import eternalMoon3Faq2 from "/faq-mlp-bibles/eternalmoon3faq2.webp";
import eternalMoon3Faq3 from "/faq-mlp-bibles/eternalmoon3faq3.webp";
import eternalMoon3PackConfigs from "/faq-mlp-bibles/packconfigs-moon3.webp";

/// RAINBOW EDITIONS
import eternalRainbow1Faq1 from "/faq-mlp-bibles/eternalrainbow1faq1.webp";
import eternalRainbow1Faq2 from "/faq-mlp-bibles/eternalrainbow1faq2.webp";
import eternalRainbow1PackConfigs from "/faq-mlp-bibles/packconfigs-rainbow1.webp";
import eternalRainbow2Faq1 from "/faq-mlp-bibles/eternalrainbow2faq1.webp";
import eternalRainbow2Faq2 from "/faq-mlp-bibles/eternalrainbow2faq2.webp";
import eternalRainbow2PackConfigs from "/faq-mlp-bibles/packconfigs-rainbow2.webp";

/// FUN MOMENTS EDITION
import eternalFunMoments1Faq1 from "/faq-mlp-bibles/eternalfunmoments1faq1.webp";
import eternalFunMoments1Faq2 from "/faq-mlp-bibles/eternalfunmoments1faq2.webp";
import eternalFunMoments1PackConfigs from "/faq-mlp-bibles/packconfigs-funmoments1.webp";
import eternalFunMoments2Faq1 from "/faq-mlp-bibles/eternalfunmoments2faq1.webp";
import eternalFunMoments2Faq2 from "/faq-mlp-bibles/eternalfunmoments2faq2.webp";
import eternalFunMoments2PackConfigs from "/faq-mlp-bibles/packconfigs-funmoments2A.webp";
import eternalFunMoments2PackConfigsB from "/faq-mlp-bibles/packconfigs-funmoments2B.webp";
import eternalFunMoments3Faq1 from "/faq-mlp-bibles/eternalfunmoments3faq1.webp";
import eternalFunMoments3Faq2 from "/faq-mlp-bibles/eternalfunmoments3faq2.webp";
import eternalFunMoments3Faq3 from "/faq-mlp-bibles/eternalfunmoments3faq3.webp";
import eternalFunMoments3PackConfigs from "/faq-mlp-bibles/packconfigs-funmoments3.webp";

/// FANTASY WONDERLAND 
import fantasyWonderlandFaq1 from "/faq-mlp-bibles/fantasywonderlandfaq1.webp";
import fantasyWonderlandFaq2 from "/faq-mlp-bibles/fantasywonderlandfaq2.webp";
import fantasyWonderlandFaq3 from "/faq-mlp-bibles/fantasywonderlandfaq3.webp";
import fantasyWonderlandPackConfigs from "/faq-mlp-bibles/packconfigs-fantasywonderland.webp";

/// FRIENDSHIPS BEGIN
import friendshipsBeginFaq1 from "/faq-mlp-bibles/friendshipsbeginfaq1.webp";
import friendshipsBeginFaq2 from "/faq-mlp-bibles/friendshipsbeginfaq2.webp";
import friendshipsBeginFaq3 from "/faq-mlp-bibles/friendshipsbeginfaq3.webp";
import friendshipsBeginPackConfigs from "/faq-mlp-bibles/packconfigs-friendshipsbegin.webp";

// OTHERS CATEGORY
import crossingPlushies from "/faq-mlp-bibles/crossingplushies.webp";
import crossingPlushies2 from "/faq-mlp-bibles/crossingplushies2.webp";

const FAQ = () => {
const [active, setActive] = useState(2);
const [menuOpen, setMenuOpen] =
  useState<string | null>("MLPEKayou Tutorial");
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
  title: "MLPEKayou Tutorial",
  content: (
    <div className="space-y-4">
      {[
        "How do I track my collection?",
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
  title: "How do I track my collection?",
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
            Tap on these cards to flip them over!
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
          </div>
        )}
      </div>
    </div>
    
  ),
},
{
  title: "How do I use my ISO?",
  content: (
    <div className="space-y-8">
      <div className="rounded-3xl border border-violet-100 bg-white/80 backdrop-blur-sm shadow-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-violet-900 mb-3">
          How do I use my ISO?
        </h2>

        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
          Your ISO is curated based on the idea of mastersetting every collection. On a fresh account with zero cards owned,
          every card in every set will already populate in your ISO.
        </p>
        <h2 className="text-3xl font-bold text-violet-900 mb-3">
          How do I hide sets I don't want to collect?
        </h2>

        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
          In your ISO bar, you'll see a button called "Hide Sets." If you check off a set, it will disappear from
          your personal ISO and your public ISO, as well as disappear from your collections page. If you still want to see
          that set, you can. Go to collections and toggle the set's category in the sidebar - for example, to bring up a hidden
          Moon 2 set, you'd click "Eternal Moon."
        </p>
        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
          Removing the set from your view will also remove it from the progress bar at the top of collections, meaning it will no 
          longer be counted toward the overall progress on your account.
        </p>
        <h2 className="text-3xl font-bold text-violet-900 mb-3">
          How do I keep track of cards that I have on the way?
        </h2>

        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
          In your ISO, you can tap on a card to bring up a small menu. On that menu, you can mark a card as "Trade in Progress," or
          "Purchase in Progress." A checkmark will appear beside that card's code. This will leave the card marked as uncollected until you
          have it in your hands, and will remove the card from your public ISO.
        </p>
        <h2 className="text-3xl font-bold text-violet-900 mb-3">
          What if I only want some specific cards?
        </h2>

        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
          If you are a free-floater who only collects cards they find appealing, you can go to "My Wishlist" for
          instructions on how to curate your account to that.
        </p>
         <h2 className="text-3xl font-bold text-violet-900 mb-3">
          How do I know if people can see my ISO?
        </h2>
        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
          Go to the forum and look yourself up.
        </p>
      </div>
    </div>
  ),
},
{
  title: "How do I use my wishlist?",
  content: (
    <div className="space-y-8">
      <div className="rounded-3xl border border-violet-100 bg-white/80 backdrop-blur-sm shadow-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-violet-900 mb-3">
          How do I use my wishlist?
        </h2>
        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
          Your wishlist is for special curations. If you'd like to remove your entire ISO from public view, but keep it
          in your personal view, you can click "DO NOT SHOW ISO" in your wishlist. You may also use your wishlist personally,
          but hide it from public view by clicking "DO NOT SHOW WISHLIST."
        </p>
        <h2 className="text-3xl font-bold text-violet-900 mb-3">
          How do I set my wishlist?
        </h2>
        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
          Click on any card in your wishlist to add it to your wishlist, which updates both personally and publicly. Simply click
          a card a second time to remove it from your wishlist.
        </p>
        <h2 className="text-3xl font-bold text-violet-900 mb-3">
          How do I know if people can see my wishlist?
        </h2>
        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
          Go to the forum and look yourself up. Adding one card to your wishlist will activate it for public view, unless you select that
          you do not want it to be publicly viewable.
        </p>
      </div>
    </div>
  ),
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
  title: "MLPEKayou Tutorial",
  children: [
  "How do I track my collection?",
  "How do I use my ISO?",
  "How do I use my wishlist?",
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
  title: "MLPEKayou Tutorial",
  children: [
  "How do I track my collection?",
  "How do I use my ISO?",
  "How do I use my wishlist?",
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