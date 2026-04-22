import { Link } from "react-router-dom";

interface CollectionCardProps {
  id: string;
  title: string;
  setName?: string;
  imageUrl: string;
  totalCards: number;
  progress?: number;
  showProgress?: boolean;
}

const CollectionCard = ({
  id,
  title,
  setName,
  imageUrl,
  progress = 0,
  showProgress = true
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
      
      case "10":
  return "/limited-cards";

    case "7":
      return "/fun-moments-1";

    case "8":
      return "/fun-moments-2";

    case "11":
      return "/fun-moments-3";
    default:
      return `/collection/${id}`;
  }
};

  return (
  <Link to={getLink()}>
    <div className="transition cursor-pointer">

      <div className="text-center text-sm font-semibold text-[#3b2a1a] mb-1 leading-tight">
  <div>{title}</div>
  {setName && (
    <div className="text-xs text-[#5c4228]">
      {setName}
    </div>
  )}
</div>

      {/* IMAGE + PROGRESS BAR */}
      <div className="relative rounded-xl overflow-hidden">
        <img
  src={imageUrl}
  alt={setName || title}
  className="w-full aspect-square object-cover rounded-xl"
/>

        {/* PROGRESS BAR INSIDE IMAGE */}

        {showProgress && (
  <>
    <div className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded">
      {progress}%
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#3b2a1a]/30">
      <div
        className="h-full bg-[#3b2a1a] transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  </>
)}
      </div>

    </div>
  </Link>
);
};

export default CollectionCard;