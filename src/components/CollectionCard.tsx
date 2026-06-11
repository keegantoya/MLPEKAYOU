import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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

  const navigate = useNavigate();

  const candyIndex =
  [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3;

const candyImages = [
  "/nightmarenight-assets/nmncandy1.webp",
  "/nightmarenight-assets/nmncandy2.webp",
  "/nightmarenight-assets/nmncandy3.webp",
];

const progressBarStyles = [
  // Candy Corn
  "#f58a63",

  // Pink Lollipop
  "#e58ab7",

  // Blue Lollipop
  "#7cb8e8",
];

const getLink = () => {
  switch (id) {

    case "1":
      return "/eternal-moon-one";

    case "2":
      return "/eternal-moon-two";

    case "5":
      return "/rainbow-one";

    case "3":
  return "/eternal-moon-three";

    case "4":
    case "star1":
      return "/star-one";

case "6":
case "rainbow2":
  return "/rainbow-two";

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
      return "/fun-moments-three";

    case "tcgpromos":
      return "/tcg-promos";

      case "OTHERMERCH":
  return "/other-kayou-merch";

    default:
      return `/collection/${id}`;
  }
};

const handleClick = async (
  e: React.MouseEvent<HTMLAnchorElement>
) => {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    e.preventDefault();
    navigate("/login");
  }
};

  return (
  <Link to={getLink()}>
    <div className="transition cursor-pointer">

      <div className="text-center text-sm font-semibold text-[#3b2a1a] mb-1 leading-tight">
  <div
  className="font-semibold tracking-wide text-[#e8e2ff]"
  style={{
    textShadow: "0 0 6px rgba(220, 210, 255, 0.45)",
  }}
>
  {title}
</div>

{setName && (
  <div
    className="text-xs font-semibold tracking-wide text-[#e8e2ff]"
    style={{
      textShadow: "0 0 6px rgba(220, 210, 255, 0.45)",
    }}
  >
    {setName}
  </div>
)}
</div>
      <div className="relative rounded-xl overflow-visible">
        <img
  src={imageUrl}
  alt={setName || title}
  className="w-full aspect-square object-cover rounded-xl"
/>
        {showProgress && progress < 100 && (
  <>
    <div className="absolute bottom-5 right-2 text-[10px] font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded">
      {progress}%
    </div>

<div className="absolute bottom-2 left-2 right-2 h-1.5">
<div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#5a3e84]/30 rounded-full overflow-hidden">
  <div
    className="h-full rounded-full transition-all"
    style={{
      width: `${progress}%`,
      background: progressBarStyles[candyIndex],
    }}
  />
</div>

  <img
  src={candyImages[candyIndex]}
  alt=""
  className="absolute bottom-0 w-5 h-5 pointer-events-none drop-shadow-md"
    style={{
      left: `calc(${progress}% - 10px)`,
      transform: "translateY(25%)",
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