import avatar001 from "@/assets/avatars/avatar001.webp";
import avatar002 from "@/assets/avatars/avatar002.webp";
import avatar003 from "@/assets/avatars/avatar003.webp";
import avatar004 from "@/assets/avatars/avatar004.webp";
import avatar005 from "@/assets/avatars/avatar005.webp";
import avatar006 from "@/assets/avatars/avatar006.webp";
import avatar007 from "@/assets/avatars/avatar007.webp";
import avatar008 from "@/assets/avatars/avatar008.webp";
import avatar009 from "@/assets/avatars/avatar009.webp";
import avatar010 from "@/assets/avatars/avatar010.webp";
import avatar011 from "@/assets/avatars/avatar011.webp";
import avatar012 from "@/assets/avatars/avatar012.webp";
import avatar013 from "@/assets/avatars/avatar013.webp";
import avatar014 from "@/assets/avatars/avatar014.webp";
import avatar015 from "@/assets/avatars/avatar015.webp";
import avatar016 from "@/assets/avatars/avatar016.webp";
import avatar017 from "@/assets/avatars/avatar017.webp";
import avatar018 from "@/assets/avatars/avatar018.webp";
import avatar019 from "@/assets/avatars/avatar019.webp";
import avatar020 from "@/assets/avatars/avatar020.webp";
import avatar021 from "@/assets/avatars/avatar021.webp";
import avatar022 from "@/assets/avatars/avatar022.webp";
import avatar023 from "@/assets/avatars/avatar023.webp";
import avatar024 from "@/assets/avatars/avatar024.webp";
import avatar025 from "@/assets/avatars/avatar025.webp";
import avatar026 from "@/assets/avatars/avatar026.webp";
import avatar027 from "@/assets/avatars/avatar027.webp";
import avatar028 from "@/assets/avatars/avatar028.webp";
import avatar029 from "@/assets/avatars/avatar029.webp";
import avatar030 from "@/assets/avatars/avatar030.webp";
import avatar031 from "@/assets/avatars/avatar031.webp";
import avatar032 from "@/assets/avatars/avatar032.webp";
import avatar033 from "@/assets/avatars/avatar033.webp";
import avatar034 from "@/assets/avatars/avatar034.webp";
import avatar035 from "@/assets/avatars/avatar035.webp";
import avatar036 from "@/assets/avatars/avatar036.webp";
import avatar037 from "@/assets/avatars/avatar037.webp";
import avatar038 from "@/assets/avatars/avatar038.webp";
import avatar039 from "@/assets/avatars/avatar039.webp";
import avatar040 from "@/assets/avatars/avatar040.webp";
import avatar041 from "@/assets/avatars/avatar041.webp";
import avatar042 from "@/assets/avatars/avatar042.webp";
import avatar043 from "@/assets/avatars/avatar043.webp";
import avatar044 from "@/assets/avatars/avatar044.webp";
import avatar045 from "@/assets/avatars/avatar045.webp";
import avatar046 from "@/assets/avatars/avatar046.webp";
import avatar047 from "@/assets/avatars/avatar047.webp";
import avatar048 from "@/assets/avatars/avatar048.webp";
import avatar049 from "@/assets/avatars/avatar049.webp";
import avatar050 from "@/assets/avatars/avatar050.webp";
import KeeganAvatar from "@/assets/avatars/keeganpfp3.webp";
import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";
import maipfp from "@/assets/avatars/maipfp.webp";
import TerriAvatar from "@/assets/avatars/terrypfp.webp";
import Jacobpfp from "@/assets/avatars/jacobpfp.webp";
import frame001 from "@/frames/frame001.webp";
import frame001Light from "@/frames/frame001b.webp";
import frame002 from "@/frames/frame002.webp";
import frame003 from "@/frames/frame003.webp";
import frame004 from "@/frames/frame004.webp";
import frame005 from "@/frames/frame005.webp";
import frame006 from "@/frames/frame006.webp";
import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";
import ownerBadge from "/website-assets/OwnerBadge.webp";

const avatarMap: Record<string, string> = {
  avatar001,
  avatar002,
  avatar003,
  avatar004,
  avatar005,
  avatar006,
  avatar007,
  avatar008,
  avatar009,
  avatar010,
  avatar011,
  avatar012,
  avatar013,
  avatar014,
  avatar015,
  avatar016,
  avatar017,
  avatar018,
  avatar019,
  avatar020,
  avatar021,
  avatar022,
  avatar023,
  avatar024,
  avatar025,
  avatar026,
  avatar027,
  avatar028,
  avatar029,
  avatar030,
  avatar031,
  avatar032,
  avatar033,
  avatar034,
  avatar035,
  avatar036,
  avatar037,
  avatar038,
  avatar039,
  avatar040,
  avatar041,
  avatar042,
  avatar043,
  avatar044,
  avatar045,
  avatar046,
  avatar047,
  avatar048,
  avatar049,
  avatar050,
  heimantouavatar: heimantouAvatar,
  "heimantouavatar.webp": heimantouAvatar,
  keeganpfp: KeeganAvatar,
  keeganpfp3: KeeganAvatar,
  "keeganpfp3.webp": KeeganAvatar,
  maipfp,
  "maipfp.webp": maipfp,
  Jacobpfp,
  jacobpfp: Jacobpfp,
  "Jacobpfp.webp": Jacobpfp,
  "jacobpfp.webp": Jacobpfp,
  terrypfp: TerriAvatar,
  "terrypfp.webp": TerriAvatar,
};

export const DEFAULT_AVATAR = avatar001;
export const FRAME_OWNER_ID = "17e57e39-bc0c-44e7-b373-ac34c6690185";
export const SELECTABLE_AVATARS = Object.keys(avatarMap).filter(
  (name) => /^avatar\d{3}$/.test(name) && !/^avatar(00[1-9]|01[0-5]|027)$/.test(name),
);

export type ProfileAssetUser = {
  id?: string | null;
  avatar_url?: string | null;
  avatar_frame?: string | null;
  unlocked_frames?: readonly string[];
};

export type AvatarFrame = {
  id: string;
  name: string;
  image: string;
  lightImage?: string;
  scale: number;
  top: number;
  requirement: string;
  progressLabel: string;
  merit?: boolean;
};

export const FRAME_CATALOG: readonly AvatarFrame[] = [
  {
    id: "frame001",
    name: "Starlight",
    image: frame001,
    lightImage: frame001Light,
    scale: 1.6,
    top: 47,
    requirement: "Own at least 80% of Star 1: 84 of 105 cards.",
    progressLabel: "Star 1 cards",
  },
  { id: "frame002", name: "500 Card Collector", image: frame002, scale: 1.6, top: 47,
    requirement: "Collect at least 500 distinct cards across your collections.", progressLabel: "cards" },
  { id: "frame003", name: "PakraCards Supporter", image: frame003, scale: 1.6, top: 47,
    requirement: "Have purchased from PakraCards. Unlock this frame on merit.", progressLabel: "Unlock on merit", merit: true },
  { id: "frame004", name: "Rainbow Collector", image: frame004, scale: 1.6, top: 47,
    requirement: "Own at least 95% of Rainbow 1: 139 of 146 cards.", progressLabel: "Rainbow 1 cards" },
  { id: "frame005", name: "Nightmare Night", image: frame005, scale: 1.6, top: 47,
    requirement: "Own at least 70% of Nightmare Night: 133 of 190 cards.", progressLabel: "Nightmare Night cards" },
  { id: "frame006", name: "Moon 3", image: frame006, scale: 1.6, top: 47,
    requirement: "Own at least 75% of Moon 3: 218 of 290 cards.", progressLabel: "Moon 3 cards" },
];

export function getAvatar(avatar: string | null | undefined): string {
  return avatarMap[String(avatar ?? "").trim()] ?? DEFAULT_AVATAR;
}

export function getAvailableFrames(user?: ProfileAssetUser | null) {
  return FRAME_CATALOG.filter((frame) => user?.unlocked_frames?.includes(frame.id));
}

export function getAvatarFrame(user?: ProfileAssetUser | null) {
  return FRAME_CATALOG.find((frame) => frame.id === user?.avatar_frame) ?? null;
}

export const VERIFIED_USERS: Record<string, { badge: string; label: string }> = {
  "17e57e39-bc0c-44e7-b373-ac34c6690185": { badge: ownerBadge, label: "MLPEKAYOU OWNER" },
  "408a516c-ee80-4ff8-a869-493e1fd5d961": { badge: verifiedBadge, label: "MLPEKAYOU STAFF" },
  "6247b70d-3f55-493c-8eee-3badedf581db": { badge: verifiedBadge, label: "MLPEKAYOU STAFF" },
  "92845576-094b-4eee-a79b-0b6812bbb786": { badge: verifiedBadge, label: "MLPEKAYOU STAFF" },
  "2692c7a3-bce3-45b7-8636-5e18bf39edc3": { badge: verifiedBadge, label: "MLPEKAYOU STAFF" },
  "833d359a-7f2d-401b-ae09-70580ea2cfb3": { badge: verifiedBadge, label: "MLPEKAYOU STAFF" },
  "93fffb1d-6070-4135-9170-90720c69b8a0": { badge: verifiedBadge, label: "MLPEKAYOU STAFF" },
  "5afa26a7-fda8-4edb-ba43-56241bdd3284": { badge: verifiedBadge, label: "MLPEKAYOU STAFF" },
  "4a40460e-6c5a-4273-a478-959d61f419bc": { badge: verifiedBadge, label: "MLPEKAYOU STAFF" },
  "9d150541-2449-4a28-aad5-cb4a92c20387": { badge: verifiedBadge, label: "MLPEKAYOU STAFF" },
  "325585dd-c617-4dd2-8314-d608273cd5f6": { badge: elementOfLaughter, label: "ELEMENT OF LAUGHTER" },
  "22f7a392-b5b5-4aec-a3b3-6546071593fd": { badge: elementOfLaughter, label: "ELEMENT OF LAUGHTER" },
  "d6cef3f9-a749-4912-b612-efca4b9d1727": { badge: elementOfLaughter, label: "ELEMENT OF LAUGHTER" },
  "598fab0b-bf8e-428e-af2f-485292ab2647": { badge: elementOfLaughter, label: "ELEMENT OF LAUGHTER" },
  "d7fd86e9-f742-434f-b9e2-a2f59b2fc0d6": { badge: elementOfLaughter, label: "ELEMENT OF LAUGHTER" },
  "704ba81c-b31b-4fd0-aad7-6f5669fd555b": { badge: elementOfLaughter, label: "ELEMENT OF LAUGHTER" },
  "81a1f57f-cc99-4322-a765-9ee102cfa2b9": { badge: elementOfLaughter, label: "ELEMENT OF LAUGHTER" },
  "0634af21-958f-4922-b812-6ab3b53f7260": { badge: elementOfLaughter, label: "ELEMENT OF LAUGHTER" },
};

export function getVerification(userId: string | null | undefined) {
  return userId ? VERIFIED_USERS[userId] ?? null : null;
}

export function getProfileAssets(user?: ProfileAssetUser | null) {
  return {
    avatar: getAvatar(user?.avatar_url),
    frame: getAvatarFrame(user),
    verification: getVerification(user?.id),
  };
}
