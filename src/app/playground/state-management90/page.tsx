"use client";

import React, { useRef, useCallback, useMemo } from "react";
import PageContent from "./_components/PageContent";
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
import { useToast } from "@/app/_components/shadcn/hooks/use-toast";
import { ConfirmDialog } from "@/app/_components/elements/ConfirmDialog";
import ActionButton from "@/app/_components/elements/ActionButton";
import CustomModal from "@/app/_components/CustomModal";

const Page: React.FC = () => {
  const id = "cm1dmmv0s0002dg0zwgbt5vna"; // TODO: デバッグ用
  const ep = `/api/v1/teacher/sessions/${id}`;
  const { data, mutate } =
    useAuthenticatedGetRequest<SessionEditableFields>(ep);
  const { apiRequestHeader } = useAuth();
  const dataRef = useRef<SessionEditableFields>();
  const confirmDeleteDialog = useConfirmDialog();
  const { toast } = useToast();

  const [isAddingQuestion, setIsAddingQuestion] = React.useState(false);
  const [isCopyingQuestion, setIsCopyingQuestion] = React.useState(false);

  // prettier-ignore
  const postAddQuestionApiCaller = useMemo(() => createPostRequest<AddQuestionRequest, ApiResponse<QuestionEditableFields>>(),[]);
  const postDuplicateQuestionApiCaller = useMemo(
    () => createPostRequest<null, ApiResponse<SessionEditableFields>>(),
    []
  );

  // prettier-ignore
  const deleteApiCaller = useMemo(() => createDeleteRequest<ApiResponse<null>>(),[]);

  //【再取得（再検証）】
  const revalidate = () => mutate(undefined);
  const getOptimisticLatestData = () => dataRef.current;

  //【設問の追加】
  const addQuestion = useCallback(async () => {
    // [POST] /api/v1/teacher/questions/new
    setIsAddingQuestion(true);
    const ep = `/api/v1/teacher/questions/new`;
    const reqBody: AddQuestionRequest = addQuestionRequestSchema.parse({
      sessionId: data?.data?.id!,
      order: dataRef.current?.questions.length! + 1,
      title: `設問0${dataRef.current?.questions.length! + 1}`,
    });
    dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
    const res = await postAddQuestionApiCaller(ep, reqBody, apiRequestHeader);
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
    setIsAddingQuestion(false);
    toast({
      description: "設問を追加しました。",
    });
  }, [
    apiRequestHeader,
    data?.data?.id,
    mutate,
    postAddQuestionApiCaller,
    toast,
  ]);

  //【設問の複製】
  const copyQuestion = useCallback(
    async (questionId: string, questionTitle: string) => {
      dev.console.log(`設問（${questionId}）を複製しました`);
      setIsCopyingQuestion(true);

      // コピーを作成
      const ep = `/api/v1/teacher/questions/${questionId}/duplicate`;
      dev.console.log("■ >>> " + ep);
      const res = await postDuplicateQuestionApiCaller(
        ep,
        null,
        apiRequestHeader
      );
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));

      // mutate処理
      mutate(res, false);
      setIsCopyingQuestion(false);
    },
    [apiRequestHeader, mutate, postDuplicateQuestionApiCaller]
  );

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

      toast({
        description: "設問を削除しました。",
      });

      // バックエンド同期: 設問削除APIリクエスト
      const ep = `/api/v1/teacher/questions/${questionId}`;
      dev.console.log("■ >>> [DELETE] " + ep);
      const res = await deleteApiCaller(ep, apiRequestHeader);
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
    },
    [apiRequestHeader, deleteApiCaller, mutate, toast]
  );

  //【設問の削除確認ダイアログ処理】
  const confirmDeleteQuestion = useCallback(
    async (questionId: string, questionTitle: string): Promise<void> => {
      confirmDeleteDialog.openDialog(
        "削除確認",
        `"${questionTitle}" を削除しますか？実行後は元に戻せません。`,
        () => deleteQuestion(questionId)
      );
    },
    [confirmDeleteDialog, deleteQuestion]
  );

  if (!data) return <LoadingPage />;

  dataRef.current = sessionEditableFieldsSchema.parse(data.data);

  return (
    <div>
      <div className="mb-4 flex space-x-2">
        <button
          className="rounded-md border px-3 py-1 text-sm"
          onClick={revalidate}
        >
          再取得（再検証）
        </button>
      </div>

      {/* 設問 */}
      <div className="mb-4">
        <PageContent
          session={dataRef.current}
          getOptimisticLatestData={getOptimisticLatestData}
          confirmDeleteQuestion={confirmDeleteQuestion}
          copyQuestion={copyQuestion}
        />
      </div>

      <div className="mb-4 flex justify-end space-x-2">
        <ActionButton
          type="button"
          variant="add"
          isBusy={isAddingQuestion}
          onClick={addQuestion}
        >
          設問追加
        </ActionButton>
      </div>

      <ConfirmDialog {...confirmDeleteDialog} />
      <CustomModal isOpen={isCopyingQuestion} onClose={() => {}} className="">
        <div className="">処理中です</div>
      </CustomModal>

      {/* <pre className="mt-10 text-xs">
        {JSON.stringify(dataRef.current, null, 2)}
      </pre> */}
    </div>
  );
};

export default Page;
