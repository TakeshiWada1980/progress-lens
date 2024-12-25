"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";

// カスタムフック・APIリクエスト系
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import {
  createGetRequest,
  createDeleteRequest,
} from "@/app/_utils/createApiRequest";
import { ApiResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import useStudentSessionTableColumns from "./_hooks/useStudentSessionTableColumns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import useAuth from "@/app/_hooks/useAuth";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import useConfirmDialog from "@/app/_hooks/useConfirmDialog";

// UIコンポーネント
import PageTitle from "@/app/_components/elements/PageTitle";
import LoadingSpinner from "@/app/_components/elements/LoadingSpinner";
import { DataTable } from "@/app/_components/elements/DataTable";
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import { ConfirmDialog } from "@/app/_components/elements/ConfirmDialog";
import TextInputField from "@/app/_components/elements/TextInputField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import party from "party-js";

// 型・定数・ユーティリティ
import { produce, Draft } from "immer";
import {
  SessionSummary,
  SessionEnrollmentResponse,
  AccessCode,
  accessCodeObjSchema,
} from "@/app/_types/SessionTypes";
import ActionButton from "@/app/_components/elements/ActionButton";
import AppErrorCode from "@/app/_types/AppErrorCode";

const Page: React.FC = () => {
  const c_Title = "title";
  const c_AccessCode = "accessCode";
  const getEp = "/api/v1/student/sessions";
  const { apiRequestHeader } = useAuth();
  const { data, mutate } = useAuthenticatedGetRequest<SessionSummary[]>(getEp);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [errorMsg, setErrorMsg] = useState<string>("");

  const router = useRouter();
  const confirmUnenrollDialog = useConfirmDialog();

  // prettier-ignore
  const getApiCaller = useMemo(() => createGetRequest<ApiResponse<SessionEnrollmentResponse>>(),[]);
  // prettier-ignore
  const deleteApiCaller = useMemo(() => createDeleteRequest<ApiResponse<null>>(),[]);

  // アクセスコードの入力に使用するフォーム
  const accessCodeFormMethods = useForm<AccessCode>({
    mode: "onChange",
    resolver: zodResolver(accessCodeObjSchema),
  });

  // クエリパラメータにアクセスコードが含まれているときはフォームにセット
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = accessCodeObjSchema.safeParse({
      accessCode: searchParams.get("code"),
    });
    if (code.success)
      accessCodeFormMethods.setValue(c_AccessCode, code.data.accessCode);
  }, [accessCodeFormMethods]);

  const partyEffect = useCallback((id: string) => {
    party.sparkles(document.getElementById(id)!);
  }, []);

  // セッションに参加する処理
  const enrollSession = useCallback(
    async ({ accessCode: code }: AccessCode): Promise<void> => {
      console.log("■ data: " + JSON.stringify(data, null, 2));
      setErrorMsg("");
      setIsSubmitting(true);
      const enrollEp = `/api/v1/student/sessions/${code}/enroll`;
      console.log("■ >>> " + enrollEp);
      const res = await getApiCaller(enrollEp, apiRequestHeader);
      console.log("■ <<< " + JSON.stringify(res, null, 2));

      if (res.success) {
        router.push(`/student/sessions/${res.data?.accessCode}`);
      } else if (res.error.appErrorCode === AppErrorCode.SESSION_NOT_ACTIVE) {
        setErrorMsg(`セッション（${code}）は現在アクティブではありません。`);
      } else if (res.error.appErrorCode === AppErrorCode.SESSION_NOT_FOUND) {
        setErrorMsg(
          `セッション（${code}）は存在しません。アクセスコードを確認してください。`
        );
      } else {
        alert("エラーが発生しました。" + res.error.technicalInfo);
      }
      setIsSubmitting(false);
    },
    [data, getApiCaller, apiRequestHeader, router]
  );

  // 既存セッションからの参加解除処理
  const unenrollSession = useCallback(
    async (id: string): Promise<void> => {
      // 楽観的UI更新処理
      const newData = produce(data?.data, (draft: Draft<SessionSummary[]>) => {
        const targetIndex = draft.findIndex((s) => s.id === id);
        if (targetIndex !== -1) draft.splice(targetIndex, 1);
      });
      const optimisticRes = new SuccessResponseBuilder(newData!)
        .setHttpStatus(StatusCodes.OK)
        .build();
      mutate(optimisticRes, false);

      // 実際の削除リクエスト
      const deleteEp = `/api/v1/student/sessions/${id}/enroll`;
      const res = await deleteApiCaller(deleteEp, apiRequestHeader);
      res.error && console.error(JSON.stringify(res.error, null, 2));
      // mutate();
    },
    [apiRequestHeader, data?.data, deleteApiCaller, mutate]
  );

  //
  const confirmUnenrollSession = useCallback(
    async (id: string, name: string): Promise<void> => {
      confirmUnenrollDialog.openDialog(
        "削除確認",
        `リストからセッション "${name}" を削除しますか？`,
        () => unenrollSession(id)
      );
    },
    [confirmUnenrollDialog, unenrollSession]
  );

  const columns = useStudentSessionTableColumns({
    confirmUnenrollSession,
  });
  const filterableColumn = {
    accessorKey: c_Title,
    msg: "Filter learning session names...",
  };

  return (
    <div className="space-y-6">
      <div>
        <PageTitle title="ラーニングセッションに参加する" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">
          <FontAwesomeIcon icon={faCaretRight} className="mr-1.5" />
          アクセスコードを入力
        </h2>
        <form
          noValidate
          onSubmit={accessCodeFormMethods.handleSubmit(enrollSession)}
        >
          <div className="flex items-center justify-items-center gap-3">
            <TextInputField
              {...accessCodeFormMethods.register(c_AccessCode)}
              id={c_AccessCode}
              placeholder="999-9999"
              type="text"
              disabled={isSubmitting}
              className="w-40 py-1.5 text-center text-lg tracking-widest"
              error={!!accessCodeFormMethods.formState.errors.accessCode}
              // onChange={() => partyEffect(c_AccessCode)}
            />
            <ActionButton
              type="submit"
              isBusy={isSubmitting}
              disabled={
                !accessCodeFormMethods.formState.isValid || isSubmitting
              }
              className="bg-pink-500 tracking-widest hover:bg-pink-600"
            >
              参加
            </ActionButton>
          </div>
          <FormFieldErrorMsg
            msg={accessCodeFormMethods.formState.errors.accessCode?.message}
          />
        </form>
        <FormFieldErrorMsg msg={errorMsg} />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">
          <FontAwesomeIcon icon={faCaretRight} className="mr-1.5" />
          登録済みセッション
        </h2>
        <div className="px-0 md:px-2">
          {data?.data ? (
            <DataTable
              columns={columns}
              data={data.data}
              filterableColumn={filterableColumn}
              headerClassName="bg-pink-50 hover:bg-pink-50"
            />
          ) : (
            <LoadingSpinner message="バックグラウンドでデータを読み込んでいます..." />
          )}
        </div>
      </div>

      <ConfirmDialog {...confirmUnenrollDialog} />
    </div>
  );
};

export default Page;
