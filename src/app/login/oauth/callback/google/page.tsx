"use client";
import { useRouter } from "next/navigation";
import { createGetRequest } from "@/app/_utils/createApiRequest";
import { ApiResponse } from "@/app/_types/ApiResponse";
import { useEffect, useState } from "react";
import { RedirectTo } from "@/app/_types/RedirectTo";
import LoadingPage from "@/app/_components/LoadingPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import Link from "@/app/_components/elements/Link";

export default function OAuthCallback() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getApiCaller = createGetRequest<ApiResponse<RedirectTo>>();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const error = params.get("error");
    const token = params.get("access_token");
    setError(error);
    setAccessToken(token);
  }, []);

  useEffect(() => {
    if (error) {
      console.error("■ Google OAuth エラー:", error);
      return;
    }
    const postUser = async () => {
      if (!accessToken) return;
      try {
        const ep = "/api/v1/user/finalize-login";
        const apiRequestHeader = {
          Authorization: accessToken,
        };
        const res = await getApiCaller(ep, apiRequestHeader);
        // ロールやユーザステート（初回ログインなど）に合わせたリダイレクト
        if (res.success) {
          router.replace(res.data?.redirectTo!);
          return;
        }
        console.error("■ ログイン処理に失敗:", JSON.stringify(res, null, 2));
      } catch (e) {
        console.error("ユーザー情報の登録に失敗:", e);
      }
    };
    postUser();
  }, [accessToken, error, getApiCaller, router]);

  if (error === "access_denied") {
    return (
      <div>
        <div className="text-red-500">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            flip="horizontal"
            className="mr-1"
          />
          ユーザ操作によってGoogleを使ったソーシャルログインが取り消されました。
        </div>
      </div>
    );
  } else if (error) {
    return (
      <div className="text-red-500">エラー（{error}）が発生しました。</div>
    );
  }
  return <LoadingPage />;
}
