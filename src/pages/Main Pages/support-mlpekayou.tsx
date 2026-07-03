export default function Support() {
  const categories = [
    "Star",
    "Moon",
    "Fun Moments",
    "Rainbow",
  ];

  const products = [
  {
    name: "Fun Moments 1 Booster Box",
    price: "$23.88",
    image: "/set-pictures/funmomentsonebox.webp",
  },
  {
    name: "Rainbow 2 Booster Box",
    price: "$39.80",
    image: "/set-pictures/rainbowtwobox.webp",
  },
  {
    name: "Star 1 Booster Box",
    price: "$127.84",
    image: "/set-pictures/staronebox.webp",
    disclaimer: "Use code MLPEKAYOU at checkout",
  },
  {
    name: "Moon 3 Booster Box",
    price: "$47.88",
    image: "/set-pictures/mooonthreebox.webp",
  },
];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Support MLPEKayou
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Available Sets
                </h2>
              </div>

              <div className="p-2">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    className={`w-full text-left px-4 py-3 rounded transition ${
                      index === 0
                        ? "bg-gray-200 text-gray-900"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            {/* Banner */}
            <div className="h-72 rounded-lg border border-gray-300 bg-white flex items-center justify-center shadow-sm">
              <span className="text-5xl font-bold text-gray-300">
                Banner Placeholder
              </span>
            </div>

<section>
  <h2 className="text-2xl font-semibold text-gray-800 mb-5">
    Featured Products
  </h2>

  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    {products.map((product) => (
      <div
        key={product.name}
        className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
      >
        <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="p-4 flex flex-col flex-1">
  <h3 className="font-semibold text-gray-800 text-xl min-h-[64px]">
    {product.name}
  </h3>

  <p className="text-2xl font-bold text-gray-900 mt-2">
    {product.price}
  </p>

  {/* Reserve the same amount of space on every card */}
  <div className="h-10 mt-1">
    {product.disclaimer && (
      <p className="text-xs text-gray-500 leading-tight">
        {product.disclaimer}
      </p>
    )}
  </div>

  <button className="w-full mt-auto border border-gray-400 rounded-md py-2 hover:bg-gray-100 transition">
    Buy
  </button>
</div>
      </div>
    ))}
  </div>

  <div className="text-center mt-14">
    <h2 className="text-3xl font-bold text-gray-600">
      More products coming soon!
    </h2>
  </div>
</section>
          </main>
        </div>
      </div>
    </div>
  );
}