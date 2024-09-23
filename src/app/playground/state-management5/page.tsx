"use client";

import React, { useRef, useCallback, useMemo } from "react";
import QuestionView from "./_components/QuestionView";
import { produce, Draft } from "immer";
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import dev from "@/app/_utils/devConsole";
import {
  SessionEditableFields,
  AddQuestionRequest,
  sessionEditableFieldsSchema,
  addQuestionRequestSchema,
  questionEditableFieldsSchema,
  QuestionEditableFields,
} from "@/app/_types/SessionTypes";
import { ApiResponse } from "@/app/_types/ApiResponse";

import {
  createPostRequest,
  createDeleteRequest,
} from "@/app/_utils/createApiRequest";
import LoadingPage from "@/app/_components/LoadingPage";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import useAuth from "@/app/_hooks/useAuth";
import useConfirmDialog from "@/app/_hooks/useConfirmDialog";
import { ConfirmDialog } from "@/app/_components/elements/ConfirmDialog";

const Page: React.FC = () => {
  const id = "cm1dmmv0s0002dg0zwgbt5vna"; // TODO: デバッグ用
  const ep = `/api/v1/teacher/sessions/${id}`;
  const { data, mutate } =
    useAuthenticatedGetRequest<SessionEditableFields>(ep);
  const { apiRequestHeader } = useAuth();
  const dataRef = useRef<SessionEditableFields>();
  const confirmDeleteDialog = useConfirmDialog();

  // prettier-ignore
  const postApiCaller = useMemo(() => createPostRequest<AddQuestionRequest, ApiResponse<QuestionEditableFields>>(),[]);
  // prettier-ignore
  const deleteApiCaller = useMemo(() => createDeleteRequest<ApiResponse<null>>(),[]);

  //【再取得（再検証）】
  const revalidate = () => {
    dev.console.log("APIを叩いて再取得（再検証）");
    mutate(undefined);
  };

  //【設問の追加】
  const addQuestion = useCallback(async () => {
    // [POST] /api/v1/teacher/questions/new
    const ep = `/api/v1/teacher/questions/new`;
    const reqBody: AddQuestionRequest = addQuestionRequestSchema.parse({
      sessionId: data?.data?.id!,
      order: 1, // TODO: 仮
      title: `設問0${dataRef.current!.questions!.length! + 1}`, // TODO: 仮
    });
    dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
    const res = await postApiCaller(ep, reqBody, apiRequestHeader);
    dev.console.log("■ <<< " + JSON.stringify(res, null, 2));

    const newQuestion = questionEditableFieldsSchema.parse(res.data!);
    const optimisticLatestData = produce(
      dataRef.current,
      (draft: Draft<SessionEditableFields>) => {
        draft.questions.push(newQuestion);
      }
    );
    mutate(
      new SuccessResponseBuilder<SessionEditableFields>(optimisticLatestData!)
        .setHttpStatus(StatusCodes.OK)
        .build(),
      false
    );
  }, [apiRequestHeader, data?.data?.id, mutate, postApiCaller]);

  //【設問の削除（本体）】
  const deleteQuestion = useCallback(
    async (questionId: string) => {
      dev.console.log(`設問（${questionId}）を削除しました`);

      const optimisticLatestData = produce(
        dataRef.current,
        (draft: Draft<SessionEditableFields>) => {
          const index = draft.questions.findIndex((q) => q.id === questionId);
          if (index === -1)
            throw new Error(`Question (id=${questionId}) not found.`);
          draft.questions.splice(index, 1);
        }
      );
      mutate(
        new SuccessResponseBuilder<SessionEditableFields>(optimisticLatestData!)
          .setHttpStatus(StatusCodes.OK)
          .build(),
        false
      );
      // バックエンド同期: 設問削除APIリクエスト
      const ep = `/api/v1/teacher/questions/${questionId}`;
      dev.console.log("■ >>> [DELETE] " + ep);
      const res = await deleteApiCaller(ep, apiRequestHeader);
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
    },
    [apiRequestHeader, deleteApiCaller, mutate]
  );

  //【設問の削除確認ダイアログ処理】
  const confirmDeleteQuestion = useCallback(
    async (questionId: string, questionTitle: string): Promise<void> => {
      confirmDeleteDialog.openDialog(
        "削除確認",
        `設問 "${questionTitle}" を削除しますか？実行後は元に戻せません。`,
        () => deleteQuestion(questionId)
      );
    },
    [confirmDeleteDialog, deleteQuestion]
  );

  if (!data) return <LoadingPage />;

  dataRef.current = sessionEditableFieldsSchema.parse(data.data);
  const getOptimisticLatestData = () => {
    return dataRef.current;
  };

  return (
    <div>
      <div className="mb-4 flex space-x-2">
        <button
          className="rounded-md border px-3 py-1 text-sm"
          onClick={addQuestion}
        >
          設問追加
        </button>

        <button
          className="rounded-md border px-3 py-1 text-sm"
          onClick={revalidate}
        >
          再取得（再検証）
        </button>
      </div>

      <div>
        {dataRef.current.questions.map((question) => (
          <QuestionView
            key={question.id}
            question={question}
            getOptimisticLatestData={getOptimisticLatestData}
            mutate={mutate}
            confirmDeleteQuestion={confirmDeleteQuestion}
          />
        ))}
      </div>

      <ConfirmDialog {...confirmDeleteDialog} />
    </div>
  );
};

export default Page;
