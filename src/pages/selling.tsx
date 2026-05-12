import KayouHeader from "@/components/KayouHeader";
import sellingBadge from "@/assets/avatars/sellingbadge.png";

export default function Selling() {
  return (
    <div
  className="min-h-screen text-neutral-800"
   style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
  }}
>
      <KayouHeader />

      <main className="p-6 max-w-6xl mx-auto">

        {/* Main Title */}
        <img
  src={sellingBadge}
  alt="Selling and Buying"
  className="mx-auto h-16 sm:h-20 md:h-24 object-contain mb-2"
/>
          {/* RIGHT SIDE */}
          <div className="max-w-2xl mx-auto text-center">
<p className="text-base text-center text-neutral-600 mb-4">
  The below prices are set by a council of collectors. They are based on the hit rates and box prices. These are the suggested guidelines to avoid an extremely inflated market like Pokemon, and keep MLP Kayou accessible and collectible for all. The Pokemon scalpers have already found our pony cards and are inflating the prices in order to turn around a massive profit. Please do not engage with this behavior, and they will eventually move on.
</p>

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

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">TCG Boxes</span> - C, U, SR, SPR, ER
                    </span>
                    <span className="text-[10px] sm:text-sm">Not Valuable</span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      <span className="font-semibold">Starter Decks</span> - C, U, SR, SPR, ER
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
                      <span className="font-semibold">Fun Moments Editions</span> - UGR, CR, ◇CR
                    </span>
                    <span className="text-[10px] sm:text-sm">Valuable</span>
                  </div>
                  

                  <div className="flex justify-between">
  <span>
    <span className="font-semibold">Star Editions</span> - USR, AR, OR, BP, ◇AR
  </span>
  <span className="text-[10px] sm:text-sm">Valuable</span>
</div>

<div className="flex justify-between">
 <span>
  <span className="font-semibold">Fantasy Wonderland</span> - GR, CR, RR, ※ER, ※GR, ※SPR, ※CR, ※RR
</span>
  <span className="text-[10px] sm:text-sm">Valuable</span>
</div>
<div className="flex justify-between">
 <span>
  <span className="font-semibold">Starter Decks</span> - GR, CR, ※ER, ※CR, ※RR
</span>
  <span className="text-[10px] sm:text-sm">Valuable</span>
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
            <div className="flex justify-between text-sm text-neutral-700"><span>USR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>AR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>OR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>BP</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>◇AR</span><span>UNK</span></div>
          </div>
          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Moon Edition One</h3>

            <div className="space-y-1 text-xs text-neutral-700">
              <div className="flex justify-between text-sm text-neutral-700"><span>LSR</span><span>$5</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SGR</span><span>$15</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SC</span><span>$70</span></div>
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
            <div className="flex justify-between text-sm text-neutral-700"><span>LSR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SGR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>ZR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN ZR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>SC</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN SC</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>◇ZR</span><span>UNK</span></div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Rainbow Edition One</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>TGR</span><span>$5</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>USR</span><span>$15</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>XR</span><span>$35</span></div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Rainbow Edition Two</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>TGR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>USR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>XR</span><span>UNK</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN XR</span><span>UNK</span></div>
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

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Fun Moments Edition Three</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>◇N</span><span>$3</span></div>
            <div className="flex justify-between text-sm text-neutral-700"><span>UGR</span><span>$13</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>CR</span><span>$13</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>HIDDEN CR</span><span>$40</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>◇CR</span><span>$13</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>These prices are due to the extremely high hit rates in this box set.</span></div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Fantasy Wonderland</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>GR</span><span>$5</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>CR</span><span>$8</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>RR</span><span>$15</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>※ER</span><span>$20</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>※GR</span><span>$25</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>※SPR</span><span>$30</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>※CR</span><span>$50</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>※RR</span><span>$95</span></div>
          </div>

          <div className="border rounded-lg p-4 bg-neutral-50">
            <h3 className="font-bold mb-2">Friendships Begin</h3>
            <div className="flex justify-between text-sm text-neutral-700"><span>GR</span><span>$10</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>CR</span><span>$12</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>※ER</span><span>$20</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>※CR</span><span>$25</span></div>
              <div className="flex justify-between text-sm text-neutral-700"><span>※RR</span><span>$95</span></div>
          </div>

        </div>

      </main>
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
}