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


import KeeganAvatar from "@/assets/avatars/keeganpfp3.webp";
import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";
import maipfp from "@/assets/avatars/maipfp.webp";
import TerriAvatar from "@/assets/avatars/terrypfp.webp";
import Jacobpfp from "@/assets/avatars/jacobpfp.webp";

import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.webp";
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

export function getAvatar(
  avatar: string | null | undefined
): string {
  return avatarMap[String(avatar ?? "").trim()] ?? DEFAULT_AVATAR;
}

export const VERIFIED_USERS: Record<
  string,
  {
    badge: string;
    label: string;
  }
> = {
"17e57e39-bc0c-44e7-b373-ac34c6690185": {
  badge: ownerBadge,
  label: "MLPEKAYOU OWNER",
},
  "94a1c998-d040-4dd2-b2fb-5f606287139d": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "408a516c-ee80-4ff8-a869-493e1fd5d961": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "6247b70d-3f55-493c-8eee-3badedf581db": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },

  "2692c7a3-bce3-45b7-8636-5e18bf39edc3": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
  "2e62bcda-f311-42a1-bf32-cfe74a43d3ef": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },

  "325585dd-c617-4dd2-8314-d608273cd5f6": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
  "22f7a392-b5b5-4aec-a3b3-6546071593fd": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
    "d6cef3f9-a749-4912-b612-efca4b9d1727": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
      "5afa26a7-fda8-4edb-ba43-56241bdd3284": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
    "598fab0b-bf8e-428e-af2f-485292ab2647": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
    "4a40460e-6c5a-4273-a478-959d61f419bc": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
    "d7fd86e9-f742-434f-b9e2-a2f59b2fc0d6": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
      "704ba81c-b31b-4fd0-aad7-6f5669fd555b": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
        "81a1f57f-cc99-4322-a765-9ee102cfa2b9": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
};

export function getVerification(userId: string | null | undefined) {
  if (!userId) return null;
  return VERIFIED_USERS[userId] ?? null;
}

export function getProfileAssets(
  user?: {
    id?: string | null;
    avatar_url?: string | null;
  } | null
) {
  return {
    avatar: getAvatar(user?.avatar_url),
    verification: getVerification(user?.id),
  };
}