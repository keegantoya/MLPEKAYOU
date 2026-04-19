import KayouHeader from "@/components/KayouHeader";

export default function Selling() {
  return (
    <div
  className="min-h-screen text-neutral-800"
  style={{
    backgroundColor: "#f5f5f5",
    backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
    backgroundSize: "16px 16px",
  }}
>
      <KayouHeader />

      <main className="p-6 max-w-6xl mx-auto">

        {/* Main Title */}
        <h1 className="text-3xl font-bold text-center mb-10">
          Selling and Buying Kayou Cards
        </h1>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT SIDE */}
          <div className="text-center">

            <h2 className="text-2xl font-bold mb-3">
              Buying Sealed Product
            </h2>

            <p className="text-neutral-600 mb-6 leading-relaxed">
              Never buy sealed product unless it comes from a fully verified source. 
              Many people will buy boxes, open them and remove the hits, then reseal 
              them expertly and sell you a bad box for full price or more. This is a 
              common practice in the Chinese Kayou market and will eventually show 
              its face in the Western market. Here are some verified sources for you -
            </p>

            <div className="flex justify-center gap-3 flex-wrap">

              <a
                href="https://stonestradingco.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full text-black font-medium shadow-sm transition hover:shadow-md"
                style={{
                  background: "linear-gradient(180deg, #fde047 0%, #facc15 50%, #eab308 100%)"
                }}
              >
                Stone
              </a>

              <a
                href="https://shop.kayouofficial.com/us"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full text-black font-medium shadow-sm transition hover:shadow-md"
                style={{
                  background: "linear-gradient(180deg, #fde047 0%, #facc15 50%, #eab308 100%)"
                }}
              >
                KayouUS
              </a>

              <a
                href="https://crossingtcg.com/collections/kayou"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full text-black font-medium shadow-sm transition hover:shadow-md"
                style={{
                  background: "linear-gradient(180deg, #fde047 0%, #facc15 50%, #eab308 100%)"
                }}
              >
                CrossingTCG
              </a>

            </div>

<div className="mt-10 mb-6 p-4 rounded-lg bg-neutral-50 text-sm text-neutral-600 text-center border">
  Fantasy Wonderland and Friendship Begins are not yet added to this guide
  because not enough information is known about them.
</div>

          </div>

          {/* RIGHT SIDE */}
          <div>

            <h2 className="text-2xl font-bold text-center mb-4">
              Pricing Guide
            </h2>

            <div className="space-y-4">

              {/* Lower Tier */}
              <div className="border rounded-lg p-4 bg-neutral-50">
                <h3 className="font-bold mb-2">
                  Lower Tier Cards
                </h3>

                <div className="space-y-1 text-xs sm:text-sm text-neutral-700">

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">Moon Editions</span> - R, SR, HR, SSR, UR
                    </span>
                    <span className="text-[10px] sm:text-sm">Not Valuable</span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">Rainbow Editions</span> - BASE, ST, R, SR, FR, TR
                    </span>
                    <span className="text-[10px] sm:text-sm">Not Valuable</span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">Fun Moments Editions</span> - N, R, SR, SSR, UR
                    </span>
                    <span className="text-[10px] sm:text-sm">Not Valuable</span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">Star Editions</span> - SSR, SCR, UR
                    </span>
                    <span className="text-[10px] sm:text-sm">Not Valuable</span>
                  </div>

                </div>
              </div>

              {/* Higher Tier */}
              <div className="border rounded-lg p-4 bg-neutral-50">
                <h3 className="font-bold mb-2">
                  Higher Tier Cards
                </h3>

                <div className="space-y-1 text-xs sm:text-sm text-neutral-700">

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">Moon Editions</span> - LSR, SGR, ZR, SC, ◇ZR
                    </span>
                    <span className="text-[10px] sm:text-sm">Valuable</span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">Rainbow Editions</span> - TGR, USR, XR
                    </span>
                    <span className="text-[10px] sm:text-sm">Valuable</span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">Fun Moments Editions</span> - UGR, CR
                    </span>
                    <span className="text-[10px] sm:text-sm">Valuable</span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">Star Editions</span> - USR, AR, OR, BP, ◇AR
                    </span>
                    <span className="text-[10px] sm:text-sm">Valuable</span>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Edition Pricing Tables */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">

          {/* Moon 1 */}

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Star Edition One</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>USR</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>AR</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>OR</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>BP</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>◇AR</span><span>NOT YET RELEASED</span></div>
          </div>
          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Moon Edition One</h3>

            <div className="space-y-1 text-xs text-neutral-700">
              <div className="flex justify-between text-sm text-neutral-700"><span>LSR</span><span>$5</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SGR</span><span>$10</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SC</span><span>$55</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN SC</span><span>$200</span></div>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Moon Edition Two</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>LSR</span><span>$5</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SGR</span><span>$10</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>ZR</span><span>$25</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN ZR</span><span>$170</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SC</span><span>$55</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN SC</span><span>$200</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>◇ZR</span><span>$200</span></div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Moon Edition Three</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>LSR</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SGR</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>ZR</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN ZR</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SC</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN SC</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>◇ZR</span><span>NOT YET RELEASED</span></div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Rainbow Edition One</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>TGR</span><span>$5</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>USR</span><span>$15</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>XR</span><span>$35</span></div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Rainbow Edition Two</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>TGR</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>USR</span><span>NOT YET RELEASED</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>XR</span><span>NOT YET RELEASED</span></div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Fun Moments Edition One</h3>
             <div className="flex justify-between text-sm text-neutral-700"><span>◇N</span><span>$3</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>CR</span><span>$23</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN CR</span><span>$35</span></div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Fun Moments Edition Two</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>◇N</span><span>$3</span></div>
            <div className="flex justify-between text-sm text-neutral-700"><span>UGR</span><span>$5</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>CR</span><span>$23</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN CR</span><span>$35</span></div>
          </div>

        </div>

      </main>

    </div>
  );
}