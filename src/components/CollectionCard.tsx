import { Link } from "react-router-dom";

interface CollectionCardProps {
  id: string;
  title: string;
  setName?: string;
  imageUrl: string;
  totalCards: number;
  progress?: number;
}

const CollectionCard = ({
  id,
  title,
  setName,
  imageUrl,
  progress = 0
}: CollectionCardProps) => {

  const getLink = () => {
  switch (id) {
    case "3":
      return "/moon3";

    case "4":
    case "star1":
      return "/star1";

    case "6":
    case "rainbow2":
      return "/rainbow2";

    case "tcg":
      return "/fantasy-wonderland";

    case "friendship-begins":
      return "/friendship-begins";

    case "9":
      return "/promos";

    case "7":
      return "/fun-moments-1";

    case "8":
      return "/fun-moments-2";

    default:
      return `/collection/${id}`;
  }
};

  return (
    <Link to={getLink()}>
      <div className="relative rounded-xl overflow-hidden shadow hover:shadow-lg transition cursor-pointer">
        
        <img
          src={imageUrl}
          alt={setName || title}
          className="w-full aspect-square object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0">
          
          <div className="bg-black/60 text-white text-[10px] px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis">
            {title}{setName ? ` ${setName}` : ""}
          </div>

          <div className="h-1.5 bg-black/40">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

        </div>

      </div>
    </Link>
  );
};

export default CollectionCard;