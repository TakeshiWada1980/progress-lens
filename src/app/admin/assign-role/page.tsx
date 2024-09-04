"use client";
import React, { useMemo, useState } from "react";

// ウェブAPI関連
import { ApiResponse } from "@/app/_types/ApiResponse";
import createPostRequest from "@/app/_utils/createPostRequest";

// フォーム関連
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UIコンポーネント
import PageTitle from "@/app/_components/elements/PageTitle";
import TextInputField from "@/app/_components/elements/TextInputField";
import ActionButton from "@/app/_components/elements/ActionButton";
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import { twMerge } from "tailwind-merge";

// カスタムフック
import useAuth from "@/app/_hooks/useAuth";

// カスタム型定義
import { UserNewRole, userNewRoleSchema } from "@/app/_types/UserTypes";
import { Role } from "@prisma/client";

const Page: React.FC = () => {
  // TODO: 現状では最低限の機能だけを実装。後日 UI/UX の改善
  const ep = "/api/v1/user/assign-role";
  const { apiRequestHeader } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse<any> | null>(null);
  const [logColor, setLogColor] = useState("bg-gray-100");

  const c_Id = "id";
  const c_NewRole = "newRole";

  const postApiCaller = useMemo(
    () => createPostRequest<UserNewRole, ApiResponse<any>>(),
    []
  );

  const methods = useForm<UserNewRole>({
    mode: "onChange",
    resolver: zodResolver(userNewRoleSchema),
    defaultValues: {
      newRole: Role.TEACHER,
    },
  });
  const formState = methods.formState;

  // Submitボタン処理
  const onSubmit = async (data: UserNewRole) => {
    setApiResponse(null);
    setLogColor("bg-gray-100");
    setIsSubmitting(true);
    console.log("■ >>> " + JSON.stringify(data));
    const res = await postApiCaller(ep, data, apiRequestHeader);
    console.log("■ <<< " + JSON.stringify(res));

    if (res.success) {
      setLogColor("bg-green-100");
    } else {
      setLogColor("bg-red-100");
    }
    setApiResponse(res);
    setIsSubmitting(false);
  };

  return (
    <div>
      <PageTitle title="ユーザのロール変更" />
      <div className="mb-4 font-bold">{ep}</div>

      <div className="mt-5">
        <form noValidate onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor={c_Id} className="mb-1 block font-bold">
              ロールを変更したいユーザの ID (UUID:36文字)
            </label>
            <TextInputField
              {...methods.register(c_Id)}
              id={c_Id}
              type="text"
              placeholder="00000000-0000-0000-0000-000000000000"
              disabled={isSubmitting}
              error={!!formState.errors.id}
            />
            <FormFieldErrorMsg msg={formState.errors.id?.message} />
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-bold">新しいロール</label>
            <div>
              <label className="mr-4 cursor-not-allowed text-gray-400">
                <input
                  type="radio"
                  {...methods.register(c_NewRole)}
                  value={Role.STUDENT}
                  className="mr-1"
                  disabled
                />
                学生
              </label>
              <label className="mr-4">
                <input
                  type="radio"
                  {...methods.register(c_NewRole)}
                  value={Role.TEACHER}
                  className="mr-1"
                />
                教員
              </label>
              <label>
                <input
                  type="radio"
                  {...methods.register(c_NewRole)}
                  value={Role.ADMIN}
                  className="mr-1"
                />
                管理者
              </label>
            </div>
            <FormFieldErrorMsg msg={formState.errors.newRole?.message} />
          </div>

          <ActionButton
            variant="submit"
            type="submit"
            width="stretch"
            isBusy={isSubmitting}
            disabled={!formState.isValid || isSubmitting}
          >
            ロールの昇格
          </ActionButton>
        </form>
      </div>

      <div className="mt-4">
        <h2 className="mb-2 text-lg font-semibold">実行結果:</h2>
        <pre
          className={twMerge("overflow-auto rounded-md p-4 text-sm", logColor)}
        >
          {apiResponse && JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Page;
