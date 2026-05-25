import {
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronDown,
  Search,
  ShoppingCart,
} from "lucide-react";

const styles = [
  "Twilight Sparkle",
  "Rainbow Dash",
  "Applejack",
  "Rarity",
  "Pinkie Pie",
  "Fluttershy",
];

export default function InsideListings() {
  return (
    <div className="min-h-screen bg-[#f6f3f8] text-black">

      {/* HEADER */}
      <header className="h-[62px] bg-white border-b border-[#ebe5f2]">
        <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">

          <div className="flex items-center gap-10">
            <div className="text-[22px] font-black tracking-tight">
              MY PRISMA TCG
            </div>

            <div className="hidden lg:flex items-center gap-8 text-[13px] font-semibold tracking-wide">
              <button>SEALED</button>
              <button>GOODIES</button>
              <button>TRACK YOUR ORDER</button>
              <button>ABOUT US</button>
              <button>BLOG</button>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden md:flex w-[250px] h-[38px] rounded-full border border-[#e6e0ef] bg-[#faf9fc] px-4 items-center gap-2">
              <Search size={15} className="text-gray-400" />

              <span className="text-[13px] text-gray-400">
                Search products...
              </span>
            </div>

            <button className="w-[38px] h-[38px] rounded-full border border-[#e6e0ef] flex items-center justify-center bg-white">
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-6 py-7">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-5">
          <span>Home</span>
          <span>/</span>
          <span>Products</span>
          <span>/</span>

          <span className="text-gray-700">
            MLP Bunny Ear Magnetic Bag Charm
          </span>
        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 xl:grid-cols-[560px_1fr] gap-7 items-start">

          {/* LEFT */}
          <div>

            {/* MAIN IMAGE */}
            <div className="rounded-[22px] overflow-hidden bg-white border border-[#e8e1ef] shadow-sm">
              <img
                src="/amberandhaotests/bunnyears1.webp"
                alt=""
                className="w-full h-auto object-cover"
              />
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 mt-4">

              <button className="w-[88px] h-[88px] rounded-[18px] overflow-hidden border-2 border-[#6f46ff] bg-white">
                <img
                  src="/amberandhaotests/bunnyears1.webp"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>

              <button className="w-[88px] h-[88px] rounded-[18px] overflow-hidden border border-[#ddd] bg-white">
                <img
                  src="/amberandhaotests/bunnyears2.webp"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">

            {/* PRODUCT CARD */}
            <div className="bg-white rounded-[24px] border border-[#e8e1ef] p-6 shadow-sm">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h1 className="text-[22px] leading-[28px] font-bold max-w-[420px]">
                    My Little Pony Bag Charm - Easter Edition
                  </h1>

                  <p className="text-[14px] text-gray-600 leading-7 mt-4 max-w-[520px]">
                These magnetic plush charms are officially licensed through Hasbro and Reesee. They are (description or height measurements.)
              </p>

                  <div className="text-[#6f46ff] text-[42px] font-black mt-3 leading-none">
                    $28.99
                  </div>
                </div>

                <div className="bg-[#ddf6e3] text-[#15753a] px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap">
                  In stock
                </div>
              </div>

              {/* STYLE */}
              <div className="mt-7">

                <div className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3">
                  Style
                </div>

                <div className="flex flex-wrap gap-2">
                  {styles.map((style, index) => (
                    <button
                      key={style}
                      className={`h-[42px] px-4 rounded-xl border text-[13px] font-medium ${
                        index === 0
                          ? "border-[#6f46ff] bg-[#f4f0ff] text-[#6f46ff]"
                          : "border-[#ddd6e7] bg-white"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUANTITY */}
              <div className="mt-7">

                <div className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3">
                  Quantity
                </div>

                <div className="flex gap-3">

                  {/* COUNTER */}
                  <div className="w-[145px] h-[50px] rounded-xl border border-[#ddd6e7] flex items-center justify-between px-4">

                    <button>
                      <Minus size={16} />
                    </button>

                    <span className="text-[16px] font-semibold">
                      1
                    </span>

                    <button>
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* ADD */}
                  <button className="flex-1 h-[50px] rounded-xl bg-[#6f46ff] text-white font-bold text-[16px] hover:bg-[#5e38eb] transition-colors">
                    Add to cart
                  </button>

                  {/* HEART */}
                  <button className="w-[50px] h-[50px] rounded-xl border border-[#ddd6e7] flex items-center justify-center">
                    <Heart size={18} />
                  </button>
                </div>

                {/* SHOP */}
                <button className="mt-3 w-full h-[48px] rounded-xl bg-gradient-to-r from-[#5f3cf0] to-[#7d5bff] text-white text-[16px] font-bold">
                  Buy with Shop
                </button>

                <div className="text-center text-[12px] text-gray-400 mt-3">
                  Pay in full or in installments
                </div>
              </div>
            </div>

            {/* INFO STRIP */}
            <div className="grid grid-cols-3 gap-3">

              <div className="bg-white rounded-[20px] border border-[#e8e1ef] p-4 flex gap-3">
                <Truck size={18} className="text-[#6f46ff] mt-1" />

                <div>
                  <div className="font-bold text-[14px]">
                    Free Shipping
                  </div>

                  <div className="text-[12px] text-gray-500 mt-1">
                    Orders over $60
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-[#e8e1ef] p-4 flex gap-3">
                <ShieldCheck size={18} className="text-[#6f46ff] mt-1" />

                <div>
                  <div className="font-bold text-[14px]">
                    Secure Checkout
                  </div>

                  <div className="text-[12px] text-gray-500 mt-1">
                    Protected payments
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-[#e8e1ef] p-4 flex gap-3">
                <RotateCcw size={18} className="text-[#6f46ff] mt-1" />

                <div>
                  <div className="font-bold text-[14px]">
                    Easy Returns
                  </div>

                  <div className="text-[12px] text-gray-500 mt-1">
                    Simple return process
                  </div>
                </div>
              </div>
            </div>

            {/* ACCORDION */}
            <div className="bg-white rounded-[24px] border border-[#e8e1ef] overflow-hidden shadow-sm">

              <div className="p-6 border-b border-[#efeaf5]">

                <div className="flex items-center justify-between">
                  <h2 className="text-[#6f46ff] text-[18px] font-bold">
                    Description
                  </h2>

                  <ChevronDown size={18} />
                </div>

                <div className="mt-4 text-[14px] text-gray-600 leading-7">
                  Collect all 6 characters! Each plush charm features soft
                  fabric, bunny ears, and a magnetic clip perfect for bags,
                  backpacks, and ita bags.
                </div>
              </div>

              <div className="h-[66px] px-6 border-b border-[#efeaf5] flex items-center justify-between">
                <span className="text-[16px] font-semibold">
                  Authenticity Guarantee
                </span>

                <ChevronDown size={18} />
              </div>

              <div className="h-[66px] px-6 flex items-center justify-between">
                <span className="text-[16px] font-semibold">
                  Shipping & Returns
                </span>

                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}