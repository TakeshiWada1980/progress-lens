"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";

// カスタムフック・APIリクエスト系
import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import {
  createPostRequest,
  createPutRequest,
  createDeleteRequest,
} from "@/app/_utils/createApiRequest";
import { ApiResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import useTeacherSessionTableColumns from "./_hooks/useTeacherSessionTableColumns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import useAuth from "@/app/_hooks/useAuth";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import useConfirmDialog from "@/app/_hooks/useConfirmDialog";

// UIコンポーネント
import PageTitle from "@/app/_components/elements/PageTitle";
import LoadingSpinner from "@/app/_components/elements/LoadingSpinner";
import { DataTable } from "@/app/_components/elements/DataTable";
import BeginnersGuide from "./_components/BeginnersGuide";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/app/_components/shadcn/ui/collapsible";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChildReaching, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { EditTitleDialog } from "./_components/TitleEditorDialog";
import { ConfirmDialog } from "@/app/_components/elements/ConfirmDialog";
import CustomModal from "@/app/_components/CustomModal";

// 型・定数・ユーティリティ
import { produce, Draft } from "immer";
import {
  SessionSummary,
  CreateSessionRequest,
  UpdateSessionRequest,
} from "@/app/_types/SessionTypes";
import {
  editTitlePayloadSchema,
  EditTitlePayload,
} from "./_components/TitleEditorDialog";
import ActionButton from "@/app/_components/elements/ActionButton";
import dev from "@/app/_utils/devConsole";

enum Mode {
  Creation = "creation",
  Modification = "modification",
}

const Page: React.FC = () => {
  let accordionValue = undefined;

  const c_Id = "id";
  const c_Title = "title";
  const getEp = "/api/v1/teacher/sessions";
  const postEp = "/api/v1/teacher/sessions/new";
  const { apiRequestHeader } = useAuth();
  const { data, mutate } = useAuthenticatedGetRequest<SessionSummary[]>(getEp);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [titleEditMode, setTitleEditMode] = useState<Mode>(Mode.Modification);

  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogSubmitButtonLabel, setDialogSubmitButtonLabel] = useState("");

  const [isDuplicatingSession, setIsDuplicatingSession] = React.useState(false);

  const router = useRouter();
  // const confirmDeleteDialog = useConfirmDialog<{ id: string }>();
  const confirmDialog = useConfirmDialog();

  // prettier-ignore
  const createSessionApiCaller = useMemo(() => createPostRequest<CreateSessionRequest, ApiResponse<SessionSummary>>(),[]);
  // prettier-ignore
  const duplicateSessionApiCaller = useMemo(() => createPostRequest<null, ApiResponse<SessionSummary[]>>(),[]);
  // prettier-ignore
  const putApiCaller = useMemo(() => createPutRequest<UpdateSessionRequest, ApiResponse<null>>(),[]);
  // prettier-ignore
  const deleteApiCaller = useMemo(() => createDeleteRequest<ApiResponse<null>>(),[]);

  // セッションのタイトルの設定（新規・変更）に使用するフォーム
  const titleEditFormMethods = useForm<EditTitlePayload>({
    mode: "onChange",
    resolver: zodResolver(editTitlePayloadSchema),
  });

  // タイトル設定ダイアログのSubmit処理
  const onEditTitleSubmit = async (payload: EditTitlePayload) => {
    setIsSubmitting(true);
    payload.title = payload.title.trim();
    console.log("■ >>> " + JSON.stringify(payload));
    let res: ApiResponse<any>;
    try {
      //
      switch (titleEditMode) {
        // [セッションの新規作成]
        case Mode.Creation:
          res = await createSessionApiCaller(postEp, payload, apiRequestHeader);
          if (!res.success) new Error(res.error.technicalInfo);
          router.push(`/teacher/sessions/${res.data.id}`);
          break;

        // [セッションのタイトルの更新]
        case Mode.Modification:
          const { id, title } = payload;
          // 楽観的UI更新処理
          const newData = produce(
            data?.data,
            (draft: Draft<SessionSummary[]>) => {
              const target = draft.find((s) => s.id === id);
              if (target) target.title = title;
            }
          );
          const optimisticRes = new SuccessResponseBuilder(newData!)
            .setHttpStatus(StatusCodes.OK)
            .build();
          mutate(optimisticRes, false);

          // 実際の更新リクエスト
          const putEp = `/api/v1/teacher/sessions/${id}`;
          const reqBody: UpdateSessionRequest = {
            id: id!,
            title: title,
          };
          res = await putApiCaller(putEp, reqBody, apiRequestHeader);
          break;
      }
    } catch (error) {
      let msg = "処理に失敗";
      msg += error instanceof Error ? `\n${error.message}` : "";
      alert(msg);
    } finally {
      console.log("■ <<< " + JSON.stringify(res!));
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  // セッションの [新規作成]ボタン の押下処理
  const createSessionAction = () => {
    setTitleEditMode(Mode.Creation);
    setDialogTitle("ラーニングセッションの新規作成");
    setDialogSubmitButtonLabel("作成");
    titleEditFormMethods.setValue(c_Title, "");
    titleEditFormMethods.setValue(c_Id, "");
    titleEditFormMethods.clearErrors();
    setIsDialogOpen(true);
  };

  // 既存セッションの属性の更新処理
  const updateSessionSummary = useCallback(
    async <K extends keyof SessionSummary>(
      id: string,
      key: K,
      value: SessionSummary[K]
    ): Promise<void> => {
      // タイトルだけはダイアログ表示の必要性があるので別処理
      if (key === c_Title) {
        setTitleEditMode(Mode.Modification);
        setDialogTitle("ラーニングセッションのタイトル編集");
        setDialogSubmitButtonLabel("変更");
        titleEditFormMethods.setValue(c_Title, value as string);
        titleEditFormMethods.setValue(c_Id, id);
        titleEditFormMethods.clearErrors();
        setIsDialogOpen(true);
        // 以降は onEditTitleSubmit で処理される
        return;
      }

      try {
        // 楽観的UI更新処理
        const newData = produce(
          data?.data,
          (draft: Draft<SessionSummary[]>) => {
            const target = draft.find((s) => s.id === id);
            if (target) target[key] = value;
          }
        );
        const optimisticRes = new SuccessResponseBuilder(newData!)
          .setHttpStatus(StatusCodes.OK)
          .build();
        mutate(optimisticRes, false);

        // 実際の更新リクエスト
        const postEp = `/api/v1/teacher/sessions/${id}`;
        const reqBody: UpdateSessionRequest = {
          id: id,
          [key]: value,
        };
        const res = await putApiCaller(postEp, reqBody, apiRequestHeader);
        res.error && console.error(JSON.stringify(res.error, null, 2));
        // 負荷軽減のため、mutate() の実行は一旦保留
        //mutate();

        return; // 更新成功
      } catch (error) {
        console.error("Session update failed:", error);
        return; // 更新失敗
      }
    },
    [apiRequestHeader, data?.data, mutate, putApiCaller, titleEditFormMethods]
  );

  // 既存セッションの複製処理(確認ダイアログ)
  const duplicateSession = useCallback(
    async (id: string): Promise<void> => {
      dev.console.log("duplicateSession", id);
      setIsDuplicatingSession(true);

      // 複製リクエスト
      const ep = `/api/v1/teacher/sessions/${id}/duplicate`;
      dev.console.log("■ >>> " + ep);
      const res = await duplicateSessionApiCaller(ep, null, apiRequestHeader);
      dev.console.log("■ >>> " + JSON.stringify(res, null, 2));

      // 再取得（あえてawaitしたほうがUXが心地よい)
      await mutate();

      setIsDuplicatingSession(false);
    },
    [apiRequestHeader, duplicateSessionApiCaller, mutate]
  );

  // 既存セッションの削除処理(確認ダイアログ)
  const confirmDuplicateSession = useCallback(
    async (id: string, name: string): Promise<void> => {
      confirmDialog.openDialog(
        "確認",
        `セッション "${name}" を複製しますか？`,
        () => duplicateSession(id)
      );
    },
    [confirmDialog, duplicateSession]
  );

  // 既存セッションの削除処理
  const deleteSession = useCallback(
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
      const deleteEp = `/api/v1/teacher/sessions/${id}`;
      const res = await deleteApiCaller(deleteEp, apiRequestHeader);
      res.error && console.error(JSON.stringify(res.error, null, 2));

      // mutate(); // 負荷軽減のため、mutate() の実行は一旦保留
    },
    [apiRequestHeader, data?.data, deleteApiCaller, mutate]
  );

  // 既存セッションの削除処理(確認ダイアログ)
  const confirmDeleteSession = useCallback(
    async (id: string, name: string): Promise<void> => {
      confirmDialog.openDialog(
        "削除確認",
        `セッション "${name}" を削除しますか？実行後は元に戻せません。`,
        () => deleteSession(id)
      );
    },
    [confirmDialog, deleteSession]
  );

  const columns = useTeacherSessionTableColumns({
    updateSessionSummary,
    confirmDuplicateSession,
    confirmDeleteSession,
  });

  const filterableColumn = {
    accessorKey: c_Title,
    msg: "Filter learning session names...",
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div>
          <PageTitle title="ラーニングセッション管理" />
        </div>

        <div className="flex flex-row justify-end">
          <ActionButton onClick={createSessionAction} className="py-1">
            新規作成
          </ActionButton>
        </div>
      </div>

      <div className="mt-4 px-0 md:px-2">
        {data?.data ? (
          <DataTable
            columns={columns}
            data={data.data}
            filterableColumn={filterableColumn}
          />
        ) : (
          <LoadingSpinner
            message="バックグラウンドでデータを読み込んでいます..."
            className="mt-4"
          />
        )}
      </div>

      <FormProvider {...titleEditFormMethods}>
        <EditTitleDialog
          dialogTitle={dialogTitle}
          submitButtonLabel={dialogSubmitButtonLabel}
          isSubmitting={isSubmitting}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onSubmit={onEditTitleSubmit}
        />
      </FormProvider>

      <Collapsible defaultValue={accordionValue} className="mt-2">
        <CollapsibleTrigger className="ml-2 text-blue-500 hover:cursor-pointer">
          <div className="mb-2 font-bold">
            <FontAwesomeIcon
              icon={faChildReaching}
              className="mr-1.5 animate-rotate-y animate-twice"
            />
            Beginner&rsquo;s Guide
            <FontAwesomeIcon
              icon={faChildReaching}
              className="ml-1.5 animate-rotate-y animate-twice"
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <BeginnersGuide />
        </CollapsibleContent>
      </Collapsible>

      <ConfirmDialog {...confirmDialog} />

      <CustomModal
        isOpen={isDuplicatingSession}
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
    </div>
  );
};

export default Page;
