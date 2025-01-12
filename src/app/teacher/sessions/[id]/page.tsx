"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useParams } from "next/navigation";

// カスタムフック・APIリクエスト系
import useAuth from "@/app/_hooks/useAuth";
import useConfirmDialog from "@/app/_hooks/useConfirmDialog";
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import {
  useExitInputOnEnter,
  INPUT_CANCELLED,
} from "@/app/_hooks/useExitInputOnEnter";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiResponse } from "@/app/_types/ApiResponse";
import {
  createPostRequest,
  createPutRequest,
  createDeleteRequest,
} from "@/app/_utils/createApiRequest";

// UIコンポーネント
import LoadingPage from "@/app/_components/LoadingPage";
import { useToast } from "@/app/_components/shadcn/hooks/use-toast";
import { ConfirmDialog } from "@/app/_components/elements/ConfirmDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCaretRight,
  faChalkboardUser,
  faRotate,
  faRetweet,
  faPersonChalkboard,
  faTurnUp,
} from "@fortawesome/free-solid-svg-icons";
import ActionButton from "@/app/_components/elements/ActionButton";
import CustomModal from "@/app/_components/CustomModal";
import PageContent from "./_components/PageContent";
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import TextInputField from "@/app/_components/elements/TextInputField";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/shadcn/ui/tooltip";
import Link from "@/app/_components/elements/Link";
import { twMerge } from "tailwind-merge";
import { Switch } from "@/app/_components/shadcn/ui/switch";
import PageTitle from "@/app/_components/elements/PageTitle";

// 型・定数・ユーティリティ
import { produce, Draft } from "immer";
import {
  SessionEditableFields,
  sessionEditableFieldsSchema,
  AddQuestionRequest,
  addQuestionRequestSchema,
  QuestionEditableFields,
  questionEditableFieldsSchema,
  UpdateSessionRequest,
  updateSessionRequestSchema,
  sessionTitleSchema,
  SessionSummary,
} from "@/app/_types/SessionTypes";
import dev from "@/app/_utils/devConsole";

const Page: React.FC = () => {
  const c_Title = "title";
  const c_IsActive = "isActive";
  const c_AllowGuestEnrollment = "allowGuestEnrollment";

  const { id } = useParams<{ id: string }>();
  const ep = `/api/v1/teacher/sessions/${id}`;
  const { data, mutate } =
    useAuthenticatedGetRequest<SessionEditableFields>(ep);
  const { apiRequestHeader } = useAuth();
  const dataRef = useRef<SessionEditableFields>();
  const confirmDeleteDialog = useConfirmDialog();
  const { toast } = useToast();
  const exitInputOnEnter = useExitInputOnEnter();

  const [title, setTitle] = useState("");
  const prevTitle = useRef("");
  const [titleError, setTitleError] = useState<string | null>(null);

  const [isAddingQuestion, setIsAddingQuestion] = React.useState(false);
  const [isDuplicatingQuestion, setIsDuplicatingQuestion] =
    React.useState(false);

  // prettier-ignore
  const postAddQuestionApiCaller = useMemo(() => createPostRequest<AddQuestionRequest, ApiResponse<QuestionEditableFields>>(),[]);
  const postDuplicateQuestionApiCaller = useMemo(
    () => createPostRequest<null, ApiResponse<SessionEditableFields>>(),
    []
  );

  // prettier-ignore
  const putApiCaller = useMemo(() => createPutRequest<UpdateSessionRequest, ApiResponse<null>>(),[]);

  // prettier-ignore
  const deleteApiCaller = useMemo(() => createDeleteRequest<ApiResponse<null>>(),[]);

  //【再取得（再検証）】
  const revalidate = () => mutate(undefined);
  const getOptimisticLatestData = () => dataRef.current;

  // セッションタイトルの初期値設定
  useEffect(() => {
    if (!data) return;
    setTitle(data.data?.title!);
    prevTitle.current = data.data?.title!;
  }, [data]);

  const handleSessionTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      const zodResult = sessionTitleSchema.safeParse(newTitle);
      setTitleError(
        zodResult.success ? null : zodResult.error.errors[0].message
      );
    },
    []
  );

  //【セッションプロパティ（title,isActive,description,allowGuestEnrollment）の更新】
  const updateSessionProperty = useCallback(
    async <K extends keyof SessionEditableFields>(
      key: K,
      value: SessionEditableFields[K]
    ): Promise<void> => {
      try {
        // 楽観的UI更新の処理
        const optimisticLatestData = produce(
          getOptimisticLatestData(),
          (draft: Draft<SessionEditableFields>) => {
            draft[key] = value;
          }
        );
        // prettier-ignore
        mutate(
          new SuccessResponseBuilder<SessionEditableFields>(optimisticLatestData!)
            .setHttpStatus(StatusCodes.OK)
            .build(),
          false
        );
        // バックエンド同期
        const putEp = `/api/v1/teacher/sessions/${id}`;
        const reqBody: UpdateSessionRequest = {
          id: id,
          [key]: value,
        };
        dev.console.log("■ >>> " + JSON.stringify(reqBody));
        const res = await putApiCaller(putEp, reqBody, apiRequestHeader);
        dev.console.log("■ <<< " + JSON.stringify(res!));
        return;
      } catch (error) {
        console.error("Update SessionProperty failed:", error);
        return;
      }
    },
    [apiRequestHeader, id, mutate, putApiCaller]
  );

  //【セッションタイトルの更新】
  const updateSessionTitle = useCallback(
    async (e: React.FocusEvent<HTMLInputElement, Element>) => {
      // ESCキーでキャンセルされた場合は
      // exitInputOnEnter 経由で INPUT_CANCELLED がセットされているはず
      if (e.target.value === INPUT_CANCELLED) {
        setTitle(prevTitle.current);
        setTitleError(null);
        return;
      }

      // バリデーション
      dev.console.log("■ セッションタイトルの更新処理");
      const sessionId = data?.data?.id!;
      if (title === prevTitle.current) return;
      const zodResult = sessionTitleSchema.safeParse(title);
      if (!zodResult.success) {
        setTitle(prevTitle.current); // 前回の値に戻す
        setTitleError(null);
        return;
      }
      const updatedTitle = zodResult.data;
      setTitle(updatedTitle);
      prevTitle.current = updatedTitle;

      await updateSessionProperty("title", updatedTitle);
    },
    [data?.data?.id, title, updateSessionProperty]
  );

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
      variant: "success",
    });
  }, [
    apiRequestHeader,
    data?.data?.id,
    mutate,
    postAddQuestionApiCaller,
    toast,
  ]);

  //【設問の複製】
  const duplicateQuestion = useCallback(
    async (questionId: string, questionTitle: string) => {
      dev.console.log(`設問（${questionId}）の複製を作成しました。`);
      setIsDuplicatingQuestion(true);

      // コピーを作成
      const ep = `/api/v1/teacher/questions/${questionId}/duplicate`;
      dev.console.log("■ >>> " + ep);
      const res = await postDuplicateQuestionApiCaller(
        ep,
        null,
        apiRequestHeader
      );
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));

      // 再取得（あえてawaitしたほうがUXが心地よい)
      await mutate();

      setIsDuplicatingQuestion(false);
      toast({
        description: `設問 "${questionTitle}" の複製を作成しました。`,
        variant: "success",
      });
    },
    [apiRequestHeader, mutate, postDuplicateQuestionApiCaller, toast]
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
        variant: "success",
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
        `設問 "${questionTitle}" を削除しますか？実行後は元に戻せません。`,
        () => deleteQuestion(questionId)
      );
    },
    [confirmDeleteDialog, deleteQuestion]
  );

  if (!data) return <LoadingPage />;

  if (!data.success) {
    return (
      <div>
        <PageTitle title="エラーが発生しました。" className="mb-2" />
        <div className="mb-2">
          <FormFieldErrorMsg msg={data.error.technicalInfo} />
        </div>
        <div className="mb-2">
          <pre className="bg-red-50 p-3 text-xs text-red-700">
            {JSON.stringify(data.error, null, 2)}
          </pre>
        </div>

        <div className="mb-4 flex justify-end">
          <Link href="/teacher/sessions" className="">
            <FontAwesomeIcon icon={faChalkboardUser} className="mr-1" />
            セッション一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  dataRef.current = sessionEditableFieldsSchema.parse(data.data);

  return (
    <div className="space-y-4">
      {/* セッションタイトル */}
      <div className="grow">
        <div className="flex items-center justify-between">
          <TextInputField
            id={"title" + id}
            value={title}
            border="hoverOnly"
            className="px-2 py-0.5 text-2xl font-bold"
            error={!!titleError}
            onChange={handleSessionTitleChange}
            onBlur={(e) => updateSessionTitle(e)}
            onKeyDown={exitInputOnEnter}
          />
        </div>
        <div className="ml-1">
          <FormFieldErrorMsg msg={titleError} />
        </div>
        {/* アクセスコード */}
        <div className="ml-2 mr-1 text-gray-400">
          <FontAwesomeIcon icon={faCaretRight} className="mr-1.5" />
          AccessCode:&nbsp;{dataRef.current.accessCode} (
          <Link href={`/student/sessions/${dataRef.current.accessCode}`}>
            Preview
          </Link>
          )
        </div>
      </div>

      {/* 設定 */}
      <div className="ml-3 space-y-2">
        {/* 有効・無効 {c_IsActive} */}
        <div className="flex items-center space-x-2">
          <Switch
            id={c_IsActive}
            checked={dataRef.current.isActive}
            onCheckedChange={async (value) =>
              await updateSessionProperty(c_IsActive, value)
            }
          />
          <label htmlFor={c_IsActive} className="text-sm">
            {dataRef.current.isActive ? (
              <span>学生の参加と回答を受付けています</span>
            ) : (
              <span className="text-gray-400">
                学生の参加と回答を停止しています
              </span>
            )}
          </label>
        </div>

        {/* ゲスト参加の可否 {c_AllowGuestEnrollment} */}
        <div className="flex items-center space-x-2">
          <Switch
            id={c_AllowGuestEnrollment}
            checked={dataRef.current.allowGuestEnrollment}
            onCheckedChange={async (value) =>
              await updateSessionProperty(c_AllowGuestEnrollment, value)
            }
          />
          <label htmlFor={c_AllowGuestEnrollment} className="text-sm">
            {dataRef.current.allowGuestEnrollment ? (
              <span>ゲストユーザも参加可能です</span>
            ) : (
              <span className="text-gray-400">
                ゲストユーザは参加できません
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Description */}

      {/* 設問 */}
      <PageContent
        session={dataRef.current}
        getOptimisticLatestData={getOptimisticLatestData}
        confirmDeleteQuestion={confirmDeleteQuestion}
        duplicateQuestion={duplicateQuestion}
      />

      <div>
        <div className="mb-2 flex justify-end space-x-2">
          <ActionButton
            type="button"
            variant="add"
            className="py-1"
            isBusy={isAddingQuestion}
            onClick={addQuestion}
          >
            設問を追加
          </ActionButton>
        </div>

        <div className="mb-4 mt-5 flex justify-end">
          <Link href="/teacher/sessions" className="">
            <FontAwesomeIcon icon={faChalkboardUser} className="mr-1" />
            セッション一覧
          </Link>
        </div>
      </div>

      <ConfirmDialog {...confirmDeleteDialog} />
      <CustomModal
        isOpen={isDuplicatingQuestion}
        onClose={() => {}}
        className=""
      >
        <div className="">
          <FontAwesomeIcon
            icon={faSpinner}
            className="mr-2 animate-spin animate-duration-[2000ms]"
          />
          設問の複製処理中です...
        </div>
      </CustomModal>

      {/* <pre className="mt-10 text-xs">
        {JSON.stringify(dataRef.current, null, 2)}
      </pre> */}
    </div>
  );
};

export default Page;
