// 開発環境かどうか
export const isDevelopmentEnv =
  process.env.NEXT_PUBLIC_IS_DEVELOPMENT_ENV === "true";

// API取得時の遅延時間（ミリ秒）
export const apiDelay = 0;

export const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
export const appName = "ProgressLens";
export const avatarBucket = "img_avatar";
