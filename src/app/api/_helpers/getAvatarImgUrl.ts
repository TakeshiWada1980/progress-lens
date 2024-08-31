import { supabase } from "@/lib/supabase";
import { avatarBucket } from "@/config/app-config";

// TODO: サイズや画質の調整 -> Pro Plan でのみ可能
// https://supabase.com/docs/reference/javascript/release-notes

export const getAvatarImgUrl = async (
  avatarImgKey: string | null | undefined
): Promise<string | undefined> => {
  if (!avatarImgKey) return undefined;
  const avatarImgUrl = (
    await supabase.storage.from(avatarBucket).getPublicUrl(avatarImgKey)
  ).data.publicUrl;
  return avatarImgUrl;
};
