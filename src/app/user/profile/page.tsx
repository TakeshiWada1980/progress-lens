"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";

// カスタムフック・APIリクエスト系
import useGetRequest from "@/app/_hooks/useGetRequest";
import createPostRequest from "@/app/_utils/createPostRequest";
import { ApiResponse } from "@/app/_types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuth from "@/app/_hooks/useAuth";

// UIコンポーネント
import PageTitle from "@/app/_components/elements/PageTitle";
import ProfileUpdateForm from "./_components/ProfileUpdateForm";
import ActionButton from "@/app/_components/elements/ActionButton";
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import LoadingSpinner from "@/app/_components/elements/LoadingSpinner";

// 型・定数・ユーティリティ
import { UserProfile, userProfileSchema } from "@/app/_types/UserTypes";
import { roleEnum2str } from "@/app/_utils/roleEnum2str";

const UserProfilePage: React.FC = () => {
  const ep = "/api/v1/user/profile";
  const { apiRequestHeader, setIsUserProfileRefreshRequired } = useAuth();
  const { data } = useGetRequest<UserProfile>(ep, apiRequestHeader);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [roleValue, setRoleValue] = React.useState<string>("");

  const postApiCaller = useMemo(
    () => createPostRequest<UserProfile, ApiResponse<null>>(),
    []
  );

  // フォーム状態管理
  const methods = useForm<UserProfile>({
    mode: "onChange",
    resolver: zodResolver(userProfileSchema),
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
      methods.reset(data.data);
      methods.trigger(["id", "role"]);
      setRoleValue(`(${roleEnum2str(data.data.role)})`);
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
