"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";

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
import { faComment, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

// 型・定数・ユーティリティ
import { RedirectTo } from "@/app/_types/RedirectTo";
import { ApiResponse } from "@/app/_types/ApiResponse";
import { UserAuth, userAuthSchema } from "../_types/UserTypes";
import { appBaseUrl } from "@/config/app-config";
import { Role } from "@/app/_types/UserTypes";
import dev from "@/app/_utils/devConsole";
import { resolveDashboardPage } from "../_utils/resolveDashboardPage";

const LoginPage: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { setIsUserProfileRefreshRequired, logout } = useAuth();

  // returnPath の取得（オープンリダイレクト対処付き）
  const searchParams = useSearchParams();
  const rawReturnPath = searchParams.get("returnPath");
  const returnPath = rawReturnPath?.startsWith("http") ? null : rawReturnPath;

  const c_Email = "email";
  const c_Password = "password";

  const guestStudentNum = 45;
  const guestTeacherNum = 2;

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
    if (await logout()) {
      setSession(null);
    }
  };

  const form = useForm<UserAuth>({
    mode: "onChange",
    resolver: zodResolver(userAuthSchema),
  });
  const fieldErrors = form.formState.errors;

  const oAuthLogin = async () => {
    const queryParam = returnPath ? `?returnPath=${returnPath}` : "";
    const redirectTo = `${appBaseUrl}/login/oauth/callback/google${queryParam}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setErrorMsg(error.message);
  };

  // ゲストログイン処理
  const guestLogin = async (role: Role, n: number) => {
    if (n < 1 || n > guestStudentNum) return;
    let id: string;
    switch (role) {
      case Role.STUDENT:
        id = `g-student${String(n).padStart(2, "0")}@example.com`;
        break;
      case Role.TEACHER:
        id = `g-teacher${String(n).padStart(2, "0")}@example.com`;
        break;
      default:
        return;
    }
    // dev.console.log("■ ゲストログインID:", id);
    const { error } = await supabase.auth.signInWithPassword({
      email: id,
      password: id,
    });
    if (error) {
      setErrorMsg("ゲストログインに失敗しました。");
      return;
    }
    setIsUserProfileRefreshRequired(true);
    setIsLoggedIn(true);
    router.replace(resolveDashboardPage(role));
  };

  // メールアドレスとパスワードでのログイン処理
  const onSubmit = async (formValues: UserAuth) => {
    setErrorMsg(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formValues.email,
      password: formValues.password,
    });
    // console.log("■ ログイン処理に成功:", JSON.stringify(data));
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

    // ログイン後のリダイレクト処理
    if (res.success) {
      // クエリで returnPath が与えられていれば、それを優先する。
      if (returnPath) {
        router.replace(returnPath);
        return;
      }
      router.replace(res.data?.redirectTo!);
      return;
    }

    setErrorMsg("バックエンドでのログイン処理に失敗しました（予期せぬ挙動）。");
    setIsLoggedIn(false);
    console.error("■ ログイン処理に失敗:", JSON.stringify(res, null, 2));
    await logout();
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
          現在 <span className="font-bold">{session.user.email}</span> として
          既にログインしています。
          <br />
          別のアカウントでログインするためには、一度、
          <ActionLink onClick={logoutAction}>ログアウト</ActionLink>
          してください。
        </p>
      </div>
    );
  }

  return (
    <div className={!session ? "-mt-5" : ""}>
      <PageTitle title="ログイン" />

      <div className="mt-5">
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="mb-2 space-y-4"
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
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              メールアドレスとパスワードでログイン
            </ActionButton>
          </div>
        </form>

        <ActionButton
          type="button"
          variant="submit"
          width="stretch"
          className="tracking-widest"
          onClick={oAuthLogin}
          disabled={!!form.watch(c_Email)}
        >
          <FontAwesomeIcon icon={faGoogle} className="mr-2" />
          Googleアカウントでログイン
        </ActionButton>
        <div className="mt-2">
          <div className="text-red-500">{errorMsg}</div>
        </div>
      </div>

      <div className="my-6 space-y-2 break-all text-sm">
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
          <Link href="/forget-password" state="notImplemented">
            パスワードの再設定
          </Link>
          をしてください。
        </div>
      </div>

      <PageTitle title="ゲストログイン" />
      <div className="mt-2 text-sm" id="guest-login">
        ゲストログインした場合は一部の機能がご利用になれません。
      </div>
      <div className="mx-4 mb-2 mt-4 flex flex-wrap gap-x-2 md:mx-0">
        {[...Array(guestStudentNum)]
          .map((_, i) => i + 1)
          .map((n) => (
            <div key={n} className="mb-2">
              <ActionButton
                tabIndex={-1}
                type="button"
                variant="pink"
                width="slim"
                onClick={() => guestLogin(Role.STUDENT, n)}
              >
                学生{String(n).padStart(2, "0")}
              </ActionButton>
            </div>
          ))}
      </div>
      <div className="mx-4 mb-4 mt-1 flex flex-wrap gap-x-2 md:mx-0">
        {[...Array(guestTeacherNum)]
          .map((_, i) => i + 1)
          .map((n) => (
            <div key={n} className="mb-2">
              <ActionButton
                tabIndex={-1}
                type="button"
                variant="indigo"
                width="slim"
                onClick={() => guestLogin(Role.TEACHER, n)}
              >
                教員{String(n).padStart(2, "0")}
              </ActionButton>
            </div>
          ))}
      </div>
      <div className="h-96"></div>
    </div>
  );
};

export default LoginPage;
