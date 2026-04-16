import KayouHeader from "@/components/KayouHeader";
import aboutCard from "@/assets/avatars/abmasset1.jpg";
import wikiImage from "@/assets/avatars/mlpekayouwikidark.png";

export default function AboutMe() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <KayouHeader />

      {/* ✨ GLITTER FIELD */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <span key={i} className={`glitter glitter-${i}`} />
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 space-y-6">

        {/* BOX 1 - CREATOR */}
        <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">

          <div className="w-full md:w-[40%]">
            <img
              src={aboutCard}
              alt="Creator"
              className="rounded-lg border border-gray-300 w-full object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-left">

            <h3 className="text-lg font-semibold text-center mb-4 text-pink-400">
              About the Creator
            </h3>

            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                Hello everypony! My name is Keegan and I am an active duty service member. I currently hold a bachelors degree of Technical and Professional Studies with minors in Criminal Justice, Criminology, Forensics, and Biology.
              </p>
              <p>
                I am getting ready to start my second bachelors degree when I get out of service this year. I will be studying Earth & Planetary Sciences. With that degree, I will go on to eventually achieve a PhD in Paleontology.
              </p>
              <p>
                I have been collecting Kayou cards since the first release of Chinese Moon 3, and as soon as the US launch dropped, I abandoned all other languages to master US English.
              </p>
              <p>
                For anyone curious, my MOS is 11C.
              </p>
            </div>

          </div>
        </div>

        {/* BOX 2 - ABOUT SITE */}
        <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">

          <div className="flex-1 text-center md:text-left">

            <h3 className="text-lg font-semibold text-center mb-4 text-pink-400">
              About MLPEKAYOU
            </h3>

            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                Collecting Chinese Kayou was extremely hard. The Silver Tree and Hei Man Tou made excellent resources, but often it was impossible to find those resources up-to-date with new releases.
              </p>
              <p>
                Once Kayou debuted in the US, I never wanted anyone to feel that same frustration again.
              </p>
              <p>
                MLPEKAYOU was created to give collectors a clear, visual way to track their cards, understand sets, and actually enjoy collecting instead of guessing. 
              </p>
              <p>
                On launch week, a US E-Commerce representative reached out to me and sent me all of the cards used on this website! That is why I have such great images for both the fronts and backs of each individual card that you can't find anywhere else.
              </p>

              <p>
                When I host personal giveaways, or when Kayou and I host giveaways together, I want them to be accessible to everyone, not just Americans. If you win a Discord giveaway and you are not American, I will personally take on the cost of Kayou sending me your prize, and then I send it to you. (Restrictions keep Kayou from sending US product outside of the US, but I am not limited like they are.) I have already done this once with an Australian giveaway winner, and I am happy to do it for anyone.
              </p>
            </div>

          </div>

          <div className="w-full md:w-[40%]">
            <img
              src={wikiImage}
              alt="MLPEKAYOU"
              className="rounded-lg border border-white shadow-sm w-full object-contain bg-white p-2"
            />
          </div>

        </div>

        {/* BOX 3 - COLLAB */}
<div className="bg-card/80 backdrop-blur-sm border rounded-xl p-6 flex flex-col items-center gap-4">

  {/* IMAGE */}
  <img
    src="/logos/collab-logo.png"
    alt="Collab Logo"
    className="w-40 h-auto object-contain"
  />

  {/* TEXT */}
  <div className="text-sm text-muted-foreground space-y-4 text-center w-full">

    <p>
      When MLPEKAYOU was born the first time, it was on Google Sites. The second time, it was on Canva. The third time is the version you see now, built from thousand on thousands of lines of handmade code. (This is why bugs are so common, and if I am made aware, they can be fixed.)
    </p>

    <p>
      Website cost is something I have chosen to fund alone, but I have had many requests to take donations to help with the burden. Launch week combined with constant debugs set my bill for the month to just over $100. I have come to the decision through calculated thought that I will not be taking donations, however, you can still help me fund MLPEKAYOU!
    </p>

    <p>
      Below you can find a link to my TikTok account. Kayou was kind enough to partner with me not only on MLPEKAYOU, but on TikTok as well! If you order your future MLP Kayou products through my sponsored posts, I will earn a small commission that goes straight back into this website.
    </p>

    <p>
      Psst... between you and me, when I get big hits, I give them away in the Discord server. At the time of this page being made, there is a Moon 2 Fluttershy SC I pulled from a single currently available for giveaway. After that, I have a Fun Moments 1 CR from a Kayou sponsored post. When you buy product through my affiliate link, it funds my website AND allows me to give back to the community.
    </p>

    {/* BUTTON */}
    <div className="pt-2">
      <a
        href="https://www.tiktok.com/@keanaex"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="bg-pink-300 hover:bg-pink-400 text-black font-semibold px-5 py-2 rounded-lg">
          My TikTok
        </button>
      </a>
    </div>

    {/* DISCLAIMER */}
    <p className="text-xs text-gray-400 max-w-md mx-auto">
      If you get a warning about me having a video that makes people uncomfortable, it was me doing my job in the Army and blowing up a cheese charge pile. (A giant fire of explosive charges.)
    </p>

  </div>

</div>

      </div>

      {/* GLITTER STYLES */}
      <style>
        {`
        .glitter {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #f9a8d4;
          border-radius: 50%;
          opacity: 0.12;
          animation: sparkle 3s infinite ease-in-out;
          box-shadow:
            0 0 2px rgba(249,168,212,0.3),
            0 0 6px rgba(251,207,232,0.2);
        }

        .glitter:nth-child(odd) {
          width: 4px;
          height: 4px;
        }

        .glitter:nth-child(even) {
          width: 7px;
          height: 7px;
        }

        ${[...Array(40)]
          .map(
            (_, i) => `
          .glitter-${i} {
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 3}s;
          }
        `
          )
          .join("")}

        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0.5) translateY(0px); }
          50% { opacity: 1; transform: scale(1.2) translateY(-6px); }
          100% { opacity: 0; transform: scale(0.5) translateY(0px); }
        }
      `}
      </style>
    </div>
  );
}