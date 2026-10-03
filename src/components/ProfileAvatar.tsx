import type { SupabaseClient } from "@supabase/supabase-js";
import CardImage from "@/components/CardImage";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import {
  FRAME_CATALOG,
  getAvatar,
  getAvatarFrame,
  type ProfileAssetUser,
} from "@/pages/Everypony/profile-assets";

const db = supabase as unknown as SupabaseClient;

type ProfileAvatarProps = {
  profile?: ProfileAssetUser | null;
  src?: string;
  frameId?: string | null;
  preview?: boolean;
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

export const avatarFrameQueryKey = (userId: string) => ["avatar-frame", userId] as const;

export default function ProfileAvatar({
  profile,
  src,
  frameId,
  preview = false,
  alt = "",
  className = "h-12 w-12 rounded-2xl",
  style,
}: ProfileAvatarProps) {
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
  useEffect(() => {
    const syncTheme = () => setIsLightMode(document.documentElement.dataset.theme === "light");
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    syncTheme();
    return () => observer.disconnect();
  }, []);
  const userId = profile?.id ?? "";
  const { data } = useQuery({
    queryKey: avatarFrameQueryKey(userId),
    enabled: Boolean(userId) && !preview,
    queryFn: async () => {
      const { data, error } = await db
        .from("profiles")
        .select("avatar_frame")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data?.avatar_frame ?? null;
    },
    staleTime: 30000,
    refetchInterval: (query) => query.state.data ? 30000 : false,
    gcTime: 1800000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const selectedFrame = preview ? frameId : data !== undefined ? data : frameId !== undefined ? frameId : profile?.avatar_frame;
  const frame = preview
    ? FRAME_CATALOG.find((frame) => frame.id === selectedFrame) ?? null
    : getAvatarFrame({ ...profile, avatar_frame: selectedFrame });
  return (
    <span
      className={className}
      style={{
        ...style,
        display: "inline-block",
        position: "relative",
        flexShrink: 0,
        overflow: "visible",
        verticalAlign: "middle",
        borderRadius: "22%",
      }}
    >
      <CardImage
        src={src || getAvatar(profile?.avatar_url)}
        alt={alt}
        className="absolute inset-0 h-full w-full rounded-[inherit] object-cover"
      />
      {frame ? (
        <img
          src={isLightMode ? frame.lightImage ?? frame.image : frame.image}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: "absolute",
            pointerEvents: "none",
            maxWidth: "none",
            width: `${frame.scale * 100}%`,
            height: `${frame.scale * 100}%`,
            left: "50%",
            top: `${frame.top}%`,
            transform: "translate(-50%, -50%)",
            objectFit: "contain",
            zIndex: 1,
          }}
        />
      ) : null}
    </span>
  );
}