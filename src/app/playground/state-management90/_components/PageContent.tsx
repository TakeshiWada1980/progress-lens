"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import QuestionWrapper from "./QuestionWrapper";
import { produce, Draft } from "immer";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiResponse } from "@/app/_types/ApiResponse";

import {
  SessionEditableFields,
  QuestionEditableFields,
  UpdateQuestionsOrderRequest,
  updateQuestionsOrderSchema,
} from "@/app/_types/SessionTypes";

import dev from "@/app/_utils/devConsole";
import { mutate } from "swr";

import { createPutRequest } from "@/app/_utils/createApiRequest";
import useAuth from "@/app/_hooks/useAuth";

// ドラッグアンドドロップ関連
import * as Dnd from "@dnd-kit/core";
import * as DndSortable from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const customDropAnimation = {
  ...Dnd.defaultDropAnimation,
  duration: 0,
};

type Props = {
  session: SessionEditableFields;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
  confirmDeleteQuestion: (
    questionId: string,
    questionTitle: string
  ) => Promise<void>;
  duplicateQuestion: (
    questionId: string,
    questionTitle: string
  ) => Promise<void>;
};

const PageContent: React.FC<Props> = memo((props) => {
  const {
    session,
    getOptimisticLatestData,
    confirmDeleteQuestion,
    duplicateQuestion,
  } = props;
  const sessionEp = `/api/v1/teacher/sessions/${session.id}`;
  const { apiRequestHeader } = useAuth();

  // prettier-ignore
  const putOrderApiCaller = useMemo(() => createPutRequest<UpdateQuestionsOrderRequest, ApiResponse<null>>(),[]);

  // ドラッグアンドドロップ関連
  const [activeId, setActiveId] = useState<Dnd.UniqueIdentifier | null>(null);
  const [vmQuestions, setVmQuestions] = useState<QuestionEditableFields[]>();
  useEffect(() => {
    const vmQuestions: QuestionEditableFields[] = session.questions
      .slice() // option の浅いコピーを作成
      .sort((a, b) => a.order - b.order)
      .map<QuestionEditableFields>((option, index) => {
        return {
          ...option,
          viewId: index + 1,
        };
      });
    setVmQuestions(vmQuestions);
  }, [session]);

  const dragStartAction = useCallback((e: Dnd.DragStartEvent) => {
    setActiveId(e.active.id);
  }, []);

  const dndSensors = Dnd.useSensors(
    Dnd.useSensor(Dnd.MouseSensor),
    Dnd.useSensor(Dnd.TouchSensor)
  );

  const dragEndAction = useCallback(
    async (e: Dnd.DragEndEvent) => {
      const { active, over } = e;
      if (over && active.id !== over.id) {
        if (!vmQuestions) return [];
        const moveFrom = vmQuestions.findIndex((o) => o.viewId === active.id);
        const moveTo = vmQuestions.findIndex((o) => o.viewId === over.id);
        const updatedOrderVmQuestions = DndSortable.arrayMove(
          vmQuestions,
          moveFrom,
          moveTo
        );

        setVmQuestions(updatedOrderVmQuestions);
        setActiveId(null);

        // 楽観的更新
        const reqBodyData: { questionId: string; order: number }[] = [];
        const optimisticLatestData = produce(
          getOptimisticLatestData(),
          (draft: Draft<SessionEditableFields>) => {
            updatedOrderVmQuestions.forEach((v, index) => {
              const question = draft.questions.find((q) => q.id === v.id);
              if (!question)
                throw new Error(`Question (id=${v.id}) not found.`);
              question.order = index + 1;
              reqBodyData.push({ questionId: question.id, order: index + 1 });
            });
          }
        );

        mutate(
          sessionEp,
          new SuccessResponseBuilder<SessionEditableFields>(
            optimisticLatestData!
          )
            .setHttpStatus(StatusCodes.OK)
            .build(),
          false
        );

        // バックエンド同期: 回答選択肢の並び替えAPIリクエスト
        const ep = `/api/v1/teacher/sessions/${session.id}/questions-order`;
        const reqBody: UpdateQuestionsOrderRequest =
          updateQuestionsOrderSchema.parse({
            data: reqBodyData,
          });
        dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
        const res = await putOrderApiCaller(ep, reqBody, apiRequestHeader);
        dev.console.log("■ <<< " + JSON.stringify(res, null, 2));

        // mutate(sessionEp);
      }
      setActiveId(null);
    },
    [
      apiRequestHeader,
      getOptimisticLatestData,
      putOrderApiCaller,
      session.id,
      sessionEp,
      vmQuestions,
    ]
  );
  //
  if (vmQuestions === undefined) return null;

  return (
    <div>
      <Dnd.DndContext
        sensors={dndSensors}
        onDragStart={dragStartAction}
        onDragEnd={dragEndAction}
        collisionDetection={Dnd.closestCenter}
        modifiers={[restrictToVerticalAxis]}
      >
        <DndSortable.SortableContext
          items={vmQuestions.map((q) => q.viewId!)}
          strategy={DndSortable.verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {vmQuestions.map((question) => (
              <QuestionWrapper
                key={question.id}
                question={question}
                getOptimisticLatestData={getOptimisticLatestData}
                confirmDeleteQuestion={confirmDeleteQuestion}
                duplicateQuestion={duplicateQuestion}
                isDragging={false}
              />
            ))}
          </div>
        </DndSortable.SortableContext>
        <Dnd.DragOverlay dropAnimation={customDropAnimation}>
          {activeId ? <div className="h-16 cursor-move"></div> : null}
        </Dnd.DragOverlay>
      </Dnd.DndContext>
    </div>
  );
});

PageContent.displayName = "PageContent";

export default PageContent;
