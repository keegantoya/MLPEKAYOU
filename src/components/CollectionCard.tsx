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

    case "1":
      return "/eternal-moon-one";

    case "2":
      return "/eternal-moon-two";

    case "5":
      return "/rainbow-one";

    case "3":
  return "/moon3-beta-keegansbuild";

    case "4":
    case "star1":
      return "/star1";

    case "6":
    case "rainbow2":
      return "/rainbow2";

    case "tcg":
      return "/fantasy-wonderland";

    case "friendshipsbegin":
      return "/friendships-begin";

    case "9":
      return "/promotional-cards";
      
    case "10":
      return "/limited-cards";

    case "7":
      return "/fun-moments-one";

    case "8":
  return "/fun-moments-two";

    case "11":
      return "/fun-moments-3";

    case "tcgpromos":
      return "/tcg-promos";

      case "OTHERMERCH":
  return "/other-kayou-merch";

    default:
      return `/collection/${id}`;
  }
};

  return (
  <Link to={getLink()}>
    <div className="transition cursor-pointer">

      <div className="text-center text-sm font-semibold text-[#3b2a1a] mb-1 leading-tight">
  <div className="text-[#8b6a2b] font-semibold tracking-wide">
  {title}
</div>
 {setName && (
  <div className="text-xs font-semibold tracking-wide text-[#a8841f]">
    {setName}
  </div>
)}
</div>
      <div className="relative rounded-xl overflow-hidden">
        <img
  src={imageUrl}
  alt={setName || title}
  className="w-full aspect-square object-cover rounded-xl"
/>
        {showProgress && progress < 100 && (
  <>
    <div className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded">
      {progress}%
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#5a3e84]/30 overflow-hidden">
  <div
    className="h-full transition-all"
    style={{
      width: `${progress}%`,
      background: "linear-gradient(90deg, #f5e6a8 0%, #d4af37 40%, #b8962e 60%, #f5e6a8 100%)"
    }}
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