"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// カスタムフック・APIリクエスト系
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuth from "@/app/_hooks/useAuth";

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
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

// 型・定数・ユーティリティ
import { UserAuth, userAuthSchema } from "../_types/UserTypes";
import { appBaseUrl } from "@/config/app-config";

// TODO: 認証リンクを再送信する機能の追加 supabase.auth.resend(...)

const SignUpPage: React.FC = () => {
  const [msg, setMsg] = useState<string | null>();
  const [errorMsg, setErrorMsg] = useState<string | null>();
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const { logout } = useAuth();

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
  }, []);

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appBaseUrl}/login/oauth/callback/google`,
      },
    });
    if (error) {
      setErrorMsg(`${error.message}`);
    }
  };

  const onSubmit = async (formValues: UserAuth) => {
    setErrorMsg(null);
    setMsg(null);
    console.log("formValues:", JSON.stringify(formValues));
    const { data, error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
      options: {
        emailRedirectTo: `${appBaseUrl}/login`,
      },
    });
    if (error) {
      switch (error.code) {
        case "over_email_send_rate_limit":
          setErrorMsg(
            "システムから送信可能な認証メールが規定数を超えました。しばらくたってから、再度、試してみてください。"
          );
          break;
        case "user_already_exists":
          setErrorMsg(
            `メールアドレス ( ${formValues.email} ) は、既に使用されています。「認証リンク」を再送信する場合は サインアップ用の認証リンクを再送信 をしてください。`
          );
          break;
        default:
          setErrorMsg(
            `サインアップ処理に失敗しました。詳細：${JSON.stringify(error)}`
          );
          break;
      }
    } else {
      setMsg(
        `登録いただいたメールアドレス ( ${formValues.email} ) 宛に、認証メールを送信しました。メールに記載のURLをクリックして、登録手続きを完了してください。`
      );
      setIsSubmitted(true);
    }
  };

  if (session === undefined) {
    return <LoadingPage />;
  }

  if (session) {
    return (
      <div>
        <PageTitle title="サインアップ" />
        <p className="mt-3 break-all text-sm">
          現在 <span className="font-bold">{session.user.email}</span>
          として既にログインしています。
          <br />
          別のアカウントでサインアップするためには、一度、
          <ActionLink onClick={logoutAction}>ログアウト</ActionLink>
          してください。
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="サインアップ" />
      <div className="mt-3 space-y-2 break-all">
        <p>無料で利用できる ProgressLens にようこそ。</p>
        <p className="text-sm">
          はじめに、メールアドレスを使ってサインアップしていきましょう。
          以下のフォームで設定したメールアドレスに届いた「認証リンク」をクリックすれば利用の準備は完了です。
        </p>
        <ul className="ml-2 list-inside list-disc text-sm">
          <li>
            体験利用（登録せずにゲストログイン）は
            <Link href="/login#guest-login">こちら</Link>
          </li>

          <li>
            Googleアカウントでソーシャルログインする場合は
            <Link href="/login">こちら</Link>
          </li>
        </ul>
      </div>

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
              disabled={isSubmitted}
              error={!!fieldErrors.email}
            />
            <FormInputErrorMsg msg={fieldErrors.email?.message} />
          </div>
          <div>
            <label htmlFor={c_Password} className="mb-2 block font-bold">
              ProgressLens のログインに使用するパスワード
            </label>
            <TextInputField
              {...form.register(c_Password)}
              type={c_Password}
              id={c_Password}
              placeholder="password"
              disabled={isSubmitted}
              error={!!fieldErrors.email}
            />
            <FormInputErrorMsg msg={fieldErrors.password?.message} />
          </div>

          <div>
            <ActionButton
              variant="submit"
              width="stretch"
              disabled={!form.formState.isValid || isSubmitted}
              isBusy={form.formState.isSubmitting}
              className="tracking-widest"
            >
              認証メールを送信
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
          <div className="break-all text-blue-500">{msg}</div>
          <div className="text-red-500">{errorMsg}</div>
        </div>
      </div>

      <div className="my-4 space-y-2 break-all text-sm">
        <div>
          <FontAwesomeIcon
            icon={faComment}
            flip="horizontal"
            className="mr-1"
          />
          既にサインアップが完了している場合は、こちらから
          <Link href="/login">ログイン</Link>してください。
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
          を行なってください。
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
