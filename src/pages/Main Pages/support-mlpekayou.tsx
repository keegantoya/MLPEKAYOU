import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";

export default function Support() {

const products = [
  {
    name: "Fun Moments 1 Booster Box",
    category: "Fun Moments",
    price: "$23.88",
    image: "/set-pictures/funmomentsonebox.webp",
    scale: "scale-95",
  },
  {
    name: "Rainbow 2 Booster Box",
    category: "Rainbow",
    price: "$39.80",
    image: "/set-pictures/rainbowtwobox.webp",
    scale: "scale-125",
  },
  {
    name: "Star 1 Booster Box",
    category: "Star",
    price: "$127.84",
    image: "/set-pictures/staronebox.webp",
    scale: "scale-115",
    disclaimer: "Use code MLPEKAYOU at checkout for 20% off any purchase of Star 1",
  },
  {
    name: "Moon 3 Booster Box",
    category: "Moon",
    price: "$47.88",
    image: "/set-pictures/moonthreebox.webp",
    scale: "scale-95",
  },
];

  return (
    <div
  className="min-h-screen bg-zinc-950 text-white"
  style={{ fontFamily: '"Oxanium", sans-serif' }}
>
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 mb-10">
          <h1 className="text-5xl font-bold text-yellow-200">
            Support MLPEKayou
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-zinc-300">
            Every purchase helps support MLPEKayou while growing your
            collection. There is no extra cost to you, and every order helps
            fund hosting, new features, and future database updates.
          </p>
        </div>

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">How to Purchase</h2>
              <p className="text-zinc-400 mt-1">
                Clicking a product below will redirect you to a partner's page. Any My Little Pony
                orders placed on the partner's page will be shipped and fulfilled by the developer
                of MLPEKayou. This will also be the same way to purchase for Discord streams. Thank
                you for your support! This will begin around 07/09/2026.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
  <a
    key={product.name}
    href="https://stonestradingco.com/collections/kayou"
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-yellow-400 hover:-translate-y-1"
  >
<div className="aspect-square flex items-center justify-center overflow-hidden bg-zinc-950 p-6">
  <img
    src={product.image}
    alt={product.name}
    className={`max-h-full max-w-full object-contain transition ${product.scale}`}
  />
</div>

                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs uppercase tracking-wider text-zinc-500">
                    {product.category}
                  </span>

                  <h3 className="mt-2 text-xl font-semibold">
                    {product.name}
                  </h3>

                  <p className="mt-4 text-3xl font-bold text-yellow-400">
                    {product.price}
                  </p>

                  <div className="mt-2 h-10">
                    {product.disclaimer ? (
                      <p className="text-sm text-zinc-400">
                        {product.disclaimer}
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-600">
                        
                      </p>
                    )}
                  </div>

                  <button className="mt-auto rounded-lg bg-yellow-400 py-3 font-semibold text-black transition hover:bg-yellow-300">
                    Buy Now
                  </button>
                </div>
                </a>
            ))}
          </div>
        </section>

        {/* Info */}
        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <h3 className="text-2xl font-bold text-yellow-400">
              Why Buy Through MLPEKayou?
            </h3>

            <ul className="mt-6 space-y-4 text-zinc-300">
              <li>✓ Helps cover website hosting costs.</li>
              <li>✓ Supports development of new features.</li>
              <li>✓ Keeps the community strong and centralized.</li>
              <li>✓ Supports the My Little Pony Kayou community.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-yellow-400">
              More Products Coming Soon
            </h3>

            <p className="mt-4 text-zinc-300 leading-7">
              We are continually going to be expanding into more products! Soon to come will be Moon Four,
              Nightmare Night TCG, Nightmare Night TCG Gift Box Sets, and any new upcoming
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}