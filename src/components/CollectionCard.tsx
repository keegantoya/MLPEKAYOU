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



const getLink = () => {
  switch (id) {

    case "1":
      return "/moon-one";

    case "2":
      return "/moon-two";

    case "5":
      return "/rainbow-one";

    case "3":
      return "/moon-three";

    case "4":
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

    case "7":
      return "/fun-moments-one";

    case "8":
  return "/fun-moments-two";

    case "11":
      return "/fun-moments-three";

      case "12":
      return "/discord";

      case "OTHERMERCH":
  return "/leaping-ponies";

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

<div className="mb-2 text-center leading-tight">
  <div
    className="font-['Oxanium'] text-sm font-bold tracking-[0.04em] text-[#f5e6a8]"
    style={{
      textShadow:
        "0 2px 10px rgba(0,0,0,.35)",
    }}
  >
    {title}
  </div>

  {setName && (
    <div
      className="font-['Oxanium'] text-xs font-semibold tracking-[0.08em] uppercase text-[#d4af37]"
      style={{
        textShadow:
          "0 2px 8px rgba(0,0,0,.35)",
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
  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
    <div className="flex-1 h-2">
      <div className="h-full rounded-full bg-[#2a2a2a] border border-[#FFD400]/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background:
              "linear-gradient(90deg,#FFD400 0%,#FFC400 50%,#FFB800 100%)",
            boxShadow: "0 0 10px rgba(255,212,0,.45)",
          }}
        />
      </div>
    </div>
<div className="w-10 flex items-center justify-center rounded-md border border-[#FFD400]/20 bg-[#111111]/85 backdrop-blur-sm text-[10px] font-bold text-[#FFD400] shadow-[0_0_10px_rgba(255,212,0,0.15)]">
  {progress}%
</div>
  </div>
)}
      </div>

    </div>
  </Link>
);
};

export default CollectionCard;