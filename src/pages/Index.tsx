import KayouHeader from "@/components/KayouHeader";
import logoWithCards from "@/assets/avatars/logowithcards.png";
import aboutMeButton from "@/assets/avatars/aboutmebutton.png";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div
     style={{
  backgroundImage: `
    radial-gradient(rgba(92, 64, 34, 0.12) 1px, transparent 1px),
    radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35)),
    linear-gradient(to bottom, #e2d3b0, #cbb892)
  `,
  backgroundSize: `
    16px 16px,
    cover,
    cover
  `,
}}
    >
      <KayouHeader />

      <section className="w-full flex justify-center mt-0 sm:-mt-10 pb-12 sm:pb-6">
        <div className="relative w-[1600px] max-w-full">

          {/* IMAGE */}
          <img
            src={logoWithCards}
            alt="MLPE Kayou Logo"
            className="w-full object-contain"
          />
          <img
  src={aboutMeButton}
  alt="About Me"
  onClick={() => navigate("/about")}
  className="
    absolute left-1/2 
    top-[80%] sm:top-[70%] 
    -translate-x-[54%] sm:-translate-x-[51%]
    w-[145px] sm:w-[450px] 
    cursor-pointer hover:scale-105 transition
  "
/>

        </div>
      </section>

<section className="w-full pt-0 pb-12 sm:-mt-16">

  <div className="flex flex-wrap justify-center sm:justify-between items-center gap-6 px-6">

    <img
      src="/website-assets/stepone.png"
      alt="Step One"
      className="w-[45%] sm:w-[22%] h-auto"
    />

    <img
      src="/website-assets/steptwo.png"
      alt="Step Two"
      className="w-[45%] sm:w-[22%] h-auto"
    />

    <img
      src="/website-assets/stepthree.png"
      alt="Step Three"
      className="w-[45%] sm:w-[22%] h-auto"
    />

    <img
      src="/website-assets/stepfour.png"
      alt="Step Four"
      className="w-[45%] sm:w-[22%] h-auto"
    />

  </div>
</section>

{/* GIVEAWAY / TIKTOK SECTION */}
<section className="w-full py-12 px-6">
  <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8">

    {/* IMAGE SIDE */}
    <div className="w-full sm:w-1/2 flex justify-center">
      <img
        src="/website-assets/giveaway002.jpg"
        alt="Kayou Giveaway"
        className="w-full max-w-md rounded-lg shadow-md"
      />
    </div>

    {/* TEXT SIDE */}
     <div className="w-full sm:w-1/2 text-center sm:text-left text-[#5c4022]">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
        Ongoing Giveaways
      </h2>

      <p className="mb-6 text-sm sm:text-base leading-relaxed">
        I am regularly hosting some type of giveaway, whether it is an SC or a box, in the Discord server. Whatever giveaway is active at the time will be attached to this announcement. Join our server to join the fun! I've also hosted giveaways in partnership with Kayou in the past, so keep an eye out for more of those!
      </p>

      <button
        onClick={() => window.open("https://www.tiktok.com/@YOURACCOUNT", "_blank")}
        className="
          px-6 py-3 
          bg-[#5c4022] text-[#e2d3b0] 
          rounded-md 
          hover:scale-105 hover:bg-[#4a321a]
          transition
        "
      >
        Join our Discord
      </button>
    </div>

  </div>
</section>


      {/* FOOTER */}
      <footer className="py-4 sm:py-5 text-center text-[10px] sm:text-xs text-black">
        <div className="max-w-lg mx-auto">
          <p className="mb-1 sm:mb-1.5">
            This website is not run or owned by Kayou.
          </p>

          <p className="text-[7px] sm:text-[8px] italic mb-1 sm:mb-1.5">
            All rights to respective owners. All rights to Kayou.
          </p>

          <p className="mb-2 sm:mb-2.5">
            This is a fan-made collector tool that generates zero profit and will not run ads. Ever.
          </p>

          <p className="mb-2 sm:mb-2.5">
            This homepage was designed with the help and guidance of Maissa B.
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

export default Index;