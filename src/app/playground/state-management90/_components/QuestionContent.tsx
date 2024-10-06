"use client";

import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useMemo,
  useCallback,
} from "react";
import { RenderCount } from "@/app/_components/elements/RenderCount";
import OptionWrapper from "../_components/OptionWrapper";
import {
  SessionEditableFields,
  QuestionEditableFields,
  OptionEditableFields,
} from "@/app/_types/SessionTypes";
import dev from "@/app/_utils/devConsole";
import { produce, Draft } from "immer";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiResponse } from "@/app/_types/ApiResponse";
import { Subject } from "rxjs";
import { debounceTime, throttleTime } from "rxjs/operators";
import {
  UpdateQuestionRequest,
  updateOptionsOrderSchema,
  UpdateOptionsOrderRequest,
} from "@/app/_types/SessionTypes";
import { createPutRequest } from "@/app/_utils/createApiRequest";
import useAuth from "@/app/_hooks/useAuth";
import { useExitInputOnEnter } from "@/app/_hooks/useExitInputOnEnter";
import { mutate } from "swr";
import { removeViewIdFromQuestionEditableFields } from "../_helpers/propComparison";
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";
import { questionTitleSchema } from "@/app/_types/SessionTypes";
import TextInputField from "@/app/_components/elements/TextInputField";

// ドラッグアンドドロップ関連
import * as Dnd from "@dnd-kit/core";
import * as DndSortable from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const customDropAnimation = {
  ...Dnd.defaultDropAnimation,
  duration: 0,
};

type Props = {
  question: QuestionEditableFields;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
};

const QuestionContent: React.FC<Props> = memo(
  ({ question, getOptimisticLatestData }) => {
    const id = question.id;
    const { apiRequestHeader } = useAuth();

    const [title, setTitle] = useState(question.title);
    const prevTitle = useRef(question.title);
    const [titleError, setTitleError] = useState<string | null>(null);

    const exitInputOnEnter = useExitInputOnEnter();
    const sessionEp = `/api/v1/teacher/sessions/${
      getOptimisticLatestData()?.id
    }`;

    // prettier-ignore
    const putAttrApiCaller = useMemo(() => createPutRequest<UpdateQuestionRequest, ApiResponse<null>>(),[]);
    // prettier-ignore
    const putOrderApiCaller = useMemo(() => createPutRequest<UpdateOptionsOrderRequest, ApiResponse<null>>(),[]);

    // ドラッグアンドドロップ関連
    const [activeId, setActiveId] = useState<Dnd.UniqueIdentifier | null>(null);
    const [vmOptions, setVmOptions] = useState<OptionEditableFields[]>();
    useEffect(() => {
      const vmOptions: OptionEditableFields[] = question.options
        .slice() // option の浅いコピーを作成
        .sort((a, b) => a.order - b.order)
        .map<OptionEditableFields>((option, index) => {
          return {
            ...option,
            viewId: index + 1,
          };
        });
      setVmOptions(vmOptions);
    }, [question]);

    const dragStartAction = useCallback((e: Dnd.DragStartEvent) => {
      setActiveId(e.active.id);
    }, []);

    const dndSensors = Dnd.useSensors(
      Dnd.useSensor(Dnd.MouseSensor),
      Dnd.useSensor(Dnd.TouchSensor)
    );

    //【設問の並び順の変更】
    const dragEndAction = useCallback(
      async (e: Dnd.DragEndEvent) => {
        const { active, over } = e;
        if (over && active.id !== over.id) {
          if (!vmOptions) return [];
          const moveFrom = vmOptions.findIndex((o) => o.viewId === active.id);
          const moveTo = vmOptions.findIndex((o) => o.viewId === over.id);
          const updatedOrderVmOptions = DndSortable.arrayMove(
            vmOptions,
            moveFrom,
            moveTo
          );

          setVmOptions(updatedOrderVmOptions);
          setActiveId(null);

          // 楽観的更新
          const reqBodyData: { optionId: string; order: number }[] = [];
          const optimisticLatestData = produce(
            getOptimisticLatestData(),
            (draft: Draft<SessionEditableFields>) => {
              const target = draft.questions.find(
                (question) => question.id === id
              );
              if (!target) throw new Error(`Question (id=${id}) not found.`);

              updatedOrderVmOptions.forEach((v, index) => {
                const option = target.options.find((o) => o.id === v.id);
                if (!option) throw new Error(`Option (id=${v.id}) not found.`);
                option.order = index + 1;
                reqBodyData.push({ optionId: option.id, order: index + 1 });
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
          const ep = `/api/v1/teacher/questions/${id}/options-order`;
          const reqBody: UpdateOptionsOrderRequest =
            updateOptionsOrderSchema.parse({
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
        id,
        putOrderApiCaller,
        sessionEp,
        vmOptions,
      ]
    );

    //【設問タイトルの変更】
    const updateTitle = useCallback(async () => {
      // バリデーション
      if (title === prevTitle.current) return;
      const zodResult = questionTitleSchema.safeParse(title);
      if (!zodResult.success) {
        setTitleError(zodResult.error.errors[0].message);
        setTitle(prevTitle.current);
        return;
      }
      setTitleError(null);
      setTitle(zodResult.data);
      prevTitle.current = zodResult.data;

      // dev.console.log(
      //   `設問（${question.id}）のタイトルを「${title}」に変更しました`
      // );

      const optimisticLatestData = produce(
        getOptimisticLatestData(),
        (draft: Draft<SessionEditableFields>) => {
          const target = draft.questions.find((question) => question.id === id);
          if (!target) throw new Error(`Question (id=${id}) not found.`);
          target.title = title;
        }
      );
      mutate(
        sessionEp,
        new SuccessResponseBuilder<SessionEditableFields>(optimisticLatestData!)
          .setHttpStatus(StatusCodes.OK)
          .build(),
        false
      );
      // バックエンド同期: 設問タイトル変更APIリクエスト
      const ep = `/api/v1/teacher/questions/${id}/title`;
      const reqBody: UpdateQuestionRequest = { id, title };
      dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
      const res = await putAttrApiCaller(ep, reqBody, apiRequestHeader);
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
    }, [
      apiRequestHeader,
      getOptimisticLatestData,
      id,
      putAttrApiCaller,
      sessionEp,
      title,
    ]);

    //【デフォルト選択肢変更の準備】
    // prettier-ignore
    const defaultOptionUpdateStream = useMemo(() => new Subject<UpdateQuestionRequest>(), []);

    //【デフォルト選択肢の変更（本体）】
    useEffect(() => {
      const subscription = defaultOptionUpdateStream
        .pipe(
          debounceTime(1500),
          throttleTime(1500, undefined, { leading: false, trailing: true })
        )
        .subscribe(async ({ id: questionId, defaultOptionId }) => {
          const optimisticLatestData = produce(
            getOptimisticLatestData(),
            (draft: Draft<SessionEditableFields>) => {
              const target = draft.questions.find((q) => q.id === questionId);
              if (!target)
                throw new Error(`Question (id=${questionId}) not found.`);
              target.defaultOptionId = defaultOptionId!;
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

          // バックエンド同期: 設問のデフォルト選択回答変更APIリクエスト
          const ep = `/api/v1/teacher/questions/${id}/default-option-id`;
          const reqBody: UpdateQuestionRequest = { id, defaultOptionId };
          dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
          const res = await putAttrApiCaller(ep, reqBody, apiRequestHeader);
          dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
        });
      return () => {
        subscription.unsubscribe();
      };
    }, [
      apiRequestHeader,
      defaultOptionUpdateStream,
      getOptimisticLatestData,
      id,
      putAttrApiCaller,
      sessionEp,
    ]);

    //【デフォルト選択肢の変更（トリガー）】
    const publishUpdateDefaultOption = useCallback(
      (req: UpdateQuestionRequest) => {
        defaultOptionUpdateStream.next(req); // ストリームに値を流す
      },
      [defaultOptionUpdateStream]
    );

    // //【設問の削除】
    // const deleteQuestionAction = async () =>
    //   await confirmDeleteQuestion(id, title);

    // //【設問の複製】
    // const copyQuestionAction = async () => await copyQuestion(id, title);

    if (vmOptions === undefined) return null;

    return (
      <div className="flex flex-col">
        <div className="mt-1">
          <div className="flex items-center justify-between">
            <TextInputField
              id={"title" + id}
              type="text"
              value={title}
              className="px-2 py-0.5 text-lg"
              error={!!titleError}
              onChange={(e) => {
                setTitle(e.target.value);
                const zodResult = questionTitleSchema.safeParse(e.target.value);
                if (zodResult.success) {
                  setTitleError(null);
                } else {
                  setTitleError(zodResult.error.errors[0].message);
                }
              }}
              onBlur={updateTitle}
              onKeyDown={exitInputOnEnter}
            />

            {/* <div className="flex space-x-1">
              <button
                tabIndex={-1}
                className="rounded-md border px-3 py-1 text-sm"
                onClick={copyQuestionAction}
              >
                複製
              </button>
              <button
                tabIndex={-1}
                className="rounded-md border px-3 py-1 text-sm"
                onClick={deleteQuestionAction}
              >
                削除
              </button>
            </div> */}
          </div>
          <FormFieldErrorMsg msg={titleError} />
        </div>

        <div className="flex items-center space-x-2">
          <RenderCount />
          <div className="text-xs text-blue-500">
            id=&quot;{question.id}&quot;
          </div>
          <div className="text-xs text-purple-500">
            order=&quot;{question.order}&quot;
          </div>
        </div>

        {/* 回答選択肢 */}
        <div className="space-y-1">
          <Dnd.DndContext
            sensors={dndSensors}
            onDragStart={dragStartAction}
            onDragEnd={dragEndAction}
            collisionDetection={Dnd.closestCenter}
            modifiers={[restrictToVerticalAxis]}
          >
            <DndSortable.SortableContext
              items={vmOptions.map((o) => o.viewId!)}
              strategy={DndSortable.verticalListSortingStrategy}
            >
              {vmOptions.map((option, index) => (
                <OptionWrapper
                  key={option.id}
                  option={option}
                  getOptimisticLatestData={getOptimisticLatestData}
                  onUpdateDefaultOption={publishUpdateDefaultOption}
                  isDragging={vmOptions[index].viewId === activeId}
                />
              ))}
            </DndSortable.SortableContext>
            <Dnd.DragOverlay dropAnimation={customDropAnimation}>
              {activeId ? <div className="h-16 cursor-move"></div> : null}
            </Dnd.DragOverlay>
          </Dnd.DndContext>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    const p = removeViewIdFromQuestionEditableFields(prevProps.question);
    const n = removeViewIdFromQuestionEditableFields(nextProps.question);
    // findAndLogDifferences(JSON.stringify(p), JSON.stringify(n));
    return JSON.stringify(p) === JSON.stringify(n);
  }
);

QuestionContent.displayName = "QuestionContent";

export default QuestionContent;
