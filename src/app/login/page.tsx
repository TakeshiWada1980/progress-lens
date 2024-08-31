"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// カスタムフック・APIリクエスト系
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import useAuth from "@/app/_hooks/useAuth";
import createGetRequest from "@/app/_utils/createGetRequest";

// UIコンポーネント
import FormInputErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import ActionButton from "@/app/_components/elements/ActionButton";
import LoadingPage from "@/app/_components/LoadingPage";
import Link from "@/app/_components/elements/Link";
import ActionLink from "@/app/_components/elements/ActionLink";
import PageTitle from "@/app/_components/elements/PageTitle";
import TextInputField from "@/app/_components/elements/TextInputField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";

// 型・定数・ユーティリティ
import { RedirectTo } from "@/app/_types/RedirectTo";
import { ApiResponse } from "@/app/_types/ApiResponse";
import { UserAuth, userAuthSchema } from "../_types/UserTypes";

const LoginPage: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { setIsUserProfileRefreshRequired } = useAuth();

  const c_Email = "email";
  const c_Password = "password";

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
      } else {
        setSession(null);
      }
    };
    checkSession();
  }, [session]);

  const logoutAction = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("ログアウト処理に失敗:", JSON.stringify(error));
    } else {
      setSession(null);
    }
  };

  const form = useForm<UserAuth>({
    mode: "onChange",
    resolver: zodResolver(userAuthSchema),
  });
  const fieldErrors = form.formState.errors;

  const onSubmit = async (formValues: UserAuth) => {
    setErrorMsg(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formValues.email,
      password: formValues.password,
    });
    // console.log("■ ログイン処理委に成功:", JSON.stringify(data));
    if (error) {
      setErrorMsg("メールアドレスまたはパスワードを確認してください。");
      return;
    }
    setIsUserProfileRefreshRequired(true);

    // フロントエンド側でのログイン後の処理
    setIsLoggedIn(true);

    const apiRequestHeader = {
      Authorization: data.session.access_token,
    };
    const getApiCaller = createGetRequest<ApiResponse<RedirectTo>>();
    const res = await getApiCaller(
      "/api/v1/user/finalize-login",
      apiRequestHeader
    );

    // ロールやユーザステート（初回ログイン？）に合わせたリダイレクト
    if (res.success) {
      router.replace(res.data?.redirectTo!);
      return;
    }

    setErrorMsg("ログイン処理に失敗しました（予期せぬ挙動）。");
    setIsLoggedIn(false);
    console.error("■ ログイン処理に失敗:", JSON.stringify(res, null, 2));
    await supabase.auth.signOut();
    return;
  };

  if (isLoggedIn) {
    return <LoadingPage />;
  }

  if (session === undefined) {
    return <LoadingPage />;
  }

  if (session) {
    return (
      <div>
        <PageTitle title="ログイン" />
        <p className="mt-3 break-all text-sm">
          現在 <span className="font-bold">{session.user.email}</span>
          として既にログインしています。
          <br />
          別のアカウントでログインするためには、一度、
          <ActionLink onClick={logoutAction}>ログアウト</ActionLink>
          してください。
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="ログイン" />

      <div className="mt-5">
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <label htmlFor={c_Email} className="mb-2 block font-bold">
              メールアドレス（ログインID）
            </label>
            <TextInputField
              {...form.register(c_Email)}
              type={c_Email}
              id={c_Email}
              placeholder="name@example.com"
              error={!!fieldErrors.email}
            />
            <FormInputErrorMsg msg={fieldErrors.email?.message} />
          </div>
          <div>
            <label htmlFor={c_Password} className="mb-2 block font-bold">
              パスワード
            </label>
            <TextInputField
              {...form.register(c_Password)}
              type={c_Password}
              id={c_Password}
              placeholder="password"
              error={!!fieldErrors.password}
            />
            <FormInputErrorMsg msg={fieldErrors.password?.message} />
          </div>

          <div>
            <ActionButton
              variant="submit"
              width="stretch"
              disabled={!form.formState.isValid}
              isBusy={form.formState.isSubmitting}
              className="tracking-widest"
            >
              ログイン
            </ActionButton>
          </div>
        </form>
        <div className="mt-2">
          <div className="text-red-500">{errorMsg}</div>
        </div>
      </div>

      <div className="mt-8 space-y-2 break-all text-sm">
        <div>
          <FontAwesomeIcon
            icon={faComment}
            flip="horizontal"
            className="mr-1"
          />
          はじめて利用するときは<Link href="/signup">サインアップの手続き</Link>
          が必要です。
        </div>
        <div>
          <FontAwesomeIcon
            icon={faComment}
            flip="horizontal"
            className="mr-1"
          />
          パスワードを忘れてしまった場合は
          <Link href="/forget-password" variant="notImplementedWithTooltip">
            パスワードの再設定
          </Link>
          を行なってください。
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
