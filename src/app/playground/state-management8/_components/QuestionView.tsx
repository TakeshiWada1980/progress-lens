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
import OptionView from "../_components/OptionView";
import {
  SessionEditableFields,
  QuestionEditableFields,
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

type Props = {
  question: QuestionEditableFields;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
  confirmDeleteQuestion: (
    questionId: string,
    questionTitle: string
  ) => Promise<void>;
};

// memoでラップすることで、親コンポーネントに連鎖する再レンダリングを抑制し
// Props (compareKey属性) が変更されたときだけ 再レンダリング されるようにしている
const QuestionView: React.FC<Props> = memo(
  ({ question, getOptimisticLatestData, confirmDeleteQuestion }) => {
    const id = question.id;
    const { apiRequestHeader } = useAuth();
    const [title, setTitle] = useState(question.title);
    const prevTitle = useRef(question.title);
    const exitInputOnEnter = useExitInputOnEnter();
    const sessionEp = `/api/v1/teacher/sessions/${
      getOptimisticLatestData()?.id
    }`;

    // prettier-ignore
    const putAttrApiCaller = useMemo(() => createPutRequest<UpdateQuestionRequest, ApiResponse<null>>(),[]);
    // prettier-ignore
    const putOrderApiCaller = useMemo(() => createPutRequest<UpdateOptionsOrderRequest, ApiResponse<null>>(),[]);

    //【設問タイトルの変更】
    const updateTitle = useCallback(async () => {
      if (title === prevTitle.current) return;
      prevTitle.current = title;
      dev.console.log(
        `設問（${question.id}）のタイトルを「${title}」に変更しました`
      );

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
      question.id,
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

    //【選択肢の並べ替え】
    const reorderOptions = useCallback(async () => {
      // NOTE: 検証用の仮の処理
      const question = getOptimisticLatestData()?.questions.find(
        (q) => q.id === id
      )!;
      const newOrder = question.options.map((o) => ({
        optionId: o.id,
        order: o.order,
        title: o.title,
      }));

      // newOrderの order を3回交換してシャッフル
      for (let i = 0; i < 3; i++) {
        const a = Math.floor(Math.random() * newOrder.length);
        const b = Math.floor(Math.random() * newOrder.length);
        [newOrder[a].order, newOrder[b].order] = [
          newOrder[b].order,
          newOrder[a].order,
        ];
      }

      dev.console.log("■ >>> " + JSON.stringify(newOrder, null, 2));
      const newOrder2 = newOrder.map(({ title, ...rest }) => rest);

      // 楽観的更新はD&DのUIでおこなわれる

      // バックエンド同期: 回答選択肢の並び替えAPIリクエスト
      const ep = `/api/v1/teacher/questions/${id}/options-order`;
      const reqBody: UpdateOptionsOrderRequest = updateOptionsOrderSchema.parse(
        {
          data: newOrder2,
        }
      );
      // dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
      const res = await putOrderApiCaller(ep, reqBody, apiRequestHeader);
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
    }, [apiRequestHeader, getOptimisticLatestData, id, putOrderApiCaller]);

    //【設問の削除】
    const deleteQuestion = async () => await confirmDeleteQuestion(id, title);

    return (
      <div className="m-1 border p-1">
        <div className="flex items-center space-x-2">
          <RenderCount />
          <div className="text-xs text-blue-500">
            id=&quot;{question.id}&quot;
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            id={"title" + id}
            type="text"
            value={title}
            className="rounded-md border px-1"
            onChange={(e) => setTitle(e.target.value)}
            onBlur={updateTitle}
            onKeyDown={exitInputOnEnter}
          />
          <button
            tabIndex={-1}
            className="rounded-md border px-3 py-1 text-sm"
            onClick={reorderOptions}
          >
            並べ替え（仮）
          </button>
          <button
            tabIndex={-1}
            className="rounded-md border px-3 py-1 text-sm"
            onClick={deleteQuestion}
          >
            設問削除
          </button>
        </div>

        {/* 回答選択肢 */}
        <div>
          {question.options.map((option, index) => (
            <OptionView
              key={option.id}
              option={option}
              getOptimisticLatestData={getOptimisticLatestData}
              onUpdateDefaultOption={publishUpdateDefaultOption}
            />
          ))}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.question) === JSON.stringify(nextProps.question)
);

QuestionView.displayName = "QuestionView";

export default QuestionView;
