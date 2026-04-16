import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";

const sets = [
  { id: "1", name: "Eternal Moon First Edition", released: true },
  { id: "2", name: "Eternal Moon Second Edition", released: true },
  { id: "3", name: "Eternal Moon Third Edition", released: false },
  { id: "4", name: "Star First Edition", released: false },
  { id: "5", name: "Rainbow First Edition", released: true },
  { id: "6", name: "Rainbow Second Edition", released: false },
  { id: "7", name: "Fun Moments First Edition", released: true },
  { id: "8", name: "Fun Moments Second Edition", released: false },
  { id: "9", name: "Promos", released: true },
  { id: "10", name: "Serialized & Limited Cards", released: true },
];

export default function PublicISO() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          All ISOs
        </h1>

        <p className="text-center text-muted-foreground mb-8">
          View what cards others are looking for. Want to set your discord name to display beside your username? Click "Open Trades."
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {sets
  .filter(set => set.released)
  .map((set) => (
            <div
              key={set.id}
              onClick={() => {
                if (set.released) {
                  navigate(`/public-iso/${set.id}`);
                }
              }}
              className={`relative rounded-xl border p-4 cursor-pointer transition
                ${set.released ? "hover:bg-accent" : "opacity-60 cursor-not-allowed"}
              `}
            >
              <div className="font-semibold mb-2">
                {set.name}
              </div>

              <div className="text-sm text-muted-foreground">
                View ISOs
              </div>

              {!set.released && (
                <div className="absolute inset-0 flex items-center justify-center font-bold text-black text-lg">
                  SET NOT YET RELEASED
                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}