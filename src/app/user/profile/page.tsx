"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";

// カスタムフック・APIリクエスト系
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import createPostRequest from "@/app/_utils/createPostRequest";
import { ApiResponse } from "@/app/_types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuth from "@/app/_hooks/useAuth";
import { useSWRConfig } from "swr";

// UIコンポーネント
import PageTitle from "@/app/_components/elements/PageTitle";
import ProfileUpdateForm from "./_components/ProfileUpdateForm";
import ActionButton from "@/app/_components/elements/ActionButton";
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import LoadingSpinner from "@/app/_components/elements/LoadingSpinner";

// 型・定数・ユーティリティ
import { UserProfile, userProfileSchema } from "@/app/_types/UserTypes";
import { roleEnum2str } from "@/app/_utils/roleEnum2str";
import { Role } from "@prisma/client";

const defaultValues: UserProfile = {
  id: "00000000-0000-0000-0000-000000000000",
  role: Role.STUDENT,
  displayName: "",
  avatarImgKey: "",
};

const UserProfilePage: React.FC = () => {
  const ep = "/api/v1/user/profile?x=1"; // ?x=1 はキャッシュを管理のダミークエリ
  const { apiRequestHeader, setIsUserProfileRefreshRequired } = useAuth();
  const { data } = useAuthenticatedGetRequest<UserProfile>(ep);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [roleValue, setRoleValue] = React.useState<string>("");
  const { cache } = useSWRConfig();

  const postApiCaller = useMemo(
    () => createPostRequest<UserProfile, ApiResponse<null>>(),
    []
  );

  // アンマウントするときにSWRのキャッシュを削除
  useEffect(() => {
    return () => {
      cache.delete(ep);
    };
  }, [cache]);

  // フォーム状態管理

  const methods = useForm<UserProfile>({
    mode: "onChange",
    resolver: zodResolver(userProfileSchema),
    defaultValues,
  });
  methods.register("avatarImgKey", {
    setValueAs: (v) => {
      return v === "" ? undefined : v;
    },
  });

  // [更新]ボタンの押下処理
  const onSubmit = async (data: UserProfile) => {
    setIsSubmitting(true);

    try {
      console.log("■ >>> " + JSON.stringify(data));
      const res = await postApiCaller(ep, data, apiRequestHeader);
      console.log("■ <<< " + JSON.stringify(res));
      if (res.error) {
        alert(`処理に失敗\n${res.error.technicalInfo}`);
      }
    } catch (error) {
      let msg = "処理に失敗";
      msg += error instanceof Error ? `\n${error.message}` : "";
      alert(msg);
    }
    setIsUserProfileRefreshRequired(true);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (data?.data) {
      // data.data.avatarImgKey が undefined の場合に
      // 空文字 "" でフォームを上書きするために data2 を生成
      const data2 = { ...defaultValues, ...data.data };
      methods.reset(data2);
      methods.trigger(["id", "role"]);
      setRoleValue(`(${roleEnum2str(data2.role)})`);
    }
  }, [data, methods]);

  return (
    <div>
      <PageTitle title={`アカウント設定 ${roleValue}`} />

      {!data?.data && (
        <LoadingSpinner message="バックグラウンドでデータを読み込み中(時間がかかる場合があります)..." />
      )}

      <div className="my-5">
        <form noValidate onSubmit={methods.handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            <ProfileUpdateForm disabled={isSubmitting || !data?.data} />
          </FormProvider>
          <ActionButton
            type="submit"
            width="stretch"
            isBusy={isSubmitting}
            disabled={!methods.formState.isValid || isSubmitting || !data?.data}
          >
            更新
          </ActionButton>

          {/* デバッグ用 */}
          {Object.entries(methods.formState.errors).map(
            ([field, error], index) => (
              <FormFieldErrorMsg
                key={index}
                msg={`${field} : ${error?.message}`}
              />
            )
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;
