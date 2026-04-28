import KayouHeader from "@/components/KayouHeader";

const FantasyWonderland = () => {

  const totalCards = 191;

  const cards = Array.from({ length: totalCards }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-white">
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
        <div className="mb-6 flex items-center px-2">

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="text-sm text-amber-900 hover:text-amber-700 mr-3 whitespace-nowrap"
          >
            ← Back
          </button>

          {/* Title */}
          <h1 className="text-lg font-semibold text-center flex-1">
            Fantasy Wonderland
          </h1>

        </div>

        <p className="text-center text-sm md:text-base text-gray-500 max-w-sm md:max-w-2xl mx-auto mt-2 px-3">
          This set is currently being documented. Card slots are shown for tracking purposes.
        </p>

        {/* GRID */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-6">
          {cards.map((num) => (
            <div
              key={num}
              className="aspect-[5/7] rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
            >
              {num}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FantasyWonderland;