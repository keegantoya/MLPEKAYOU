import KayouHeader from "@/components/KayouHeader";
import CollectionCard from "@/components/CollectionCard";
import { useNavigate } from "react-router-dom";

export default function MyTrades() {
  const navigate = useNavigate();

  const collections = [
    {
      id: "1",
      title: "Eternal Moon",
      setName: "First Edition",
      imageUrl: "/thumbnails/moon-fe.jpg",
      totalCards: 186,
      category: "eternal-moon",
    },
    {
      id: "2",
      title: "Eternal Moon",
      setName: "Second Edition",
      imageUrl: "/thumbnails/moon-se.jpg",
      totalCards: 189,
      category: "eternal-moon",
    },
    {
      id: "5",
      title: "Rainbow",
      setName: "First Edition",
      imageUrl: "/thumbnails/rainbow1thumbnail.jpg",
      totalCards: 146,
      category: "rainbow",
    },
    {
      id: "7",
      title: "Fun Moments",
      setName: "First Edition",
      imageUrl: "/thumbnails/fme01TN.jpg",
      totalCards: 127,
      category: "fun-moments",
    }
  ];

  return (
    <>
      <KayouHeader />

      <div className="min-h-screen bg-neutral-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto text-center">

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            My Trades
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mb-6">
            Any cards you have flipped and marked as "owned" will appear here. You may now click on a set to view and mark cards for trade.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6">
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() => navigate(`/my-trades/${col.id}`)}
                className="cursor-pointer"
              >
                <CollectionCard {...col} />
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}