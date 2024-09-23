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
import { v4 as uuid } from "uuid";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { KeyedMutator } from "swr";
import { ApiResponse } from "@/app/_types/ApiResponse";
import { Subject } from "rxjs";
import { debounceTime, throttleTime } from "rxjs/operators";
import {
  UpdateQuestionRequest,
  updateOptionsOrderSchema,
  UpdateOptionsOrderRequest,
} from "@/app/_types/SessionTypes";
import {
  createPutRequest,
  createDeleteRequest,
} from "@/app/_utils/createApiRequest";
import useAuth from "@/app/_hooks/useAuth";
import { useExitInputOnEnter } from "@/app/_hooks/useExitInputOnEnter";

type Props = {
  question: QuestionEditableFields;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
  mutate: KeyedMutator<ApiResponse<SessionEditableFields>>;
  confirmDeleteQuestion: (
    questionId: string,
    questionTitle: string
  ) => Promise<void>;
};

// memoでラップすることで、親コンポーネントに連鎖する再レンダリングを抑制し
// Props (compareKey属性) が変更されたときだけ 再レンダリング されるようにしている
const QuestionView: React.FC<Props> = memo(
  ({ question, getOptimisticLatestData, mutate, confirmDeleteQuestion }) => {
    const id = question.id;
    const [title, setTitle] = useState(question.title);
    const prevTitle = useRef(question.title);
    const { apiRequestHeader } = useAuth();
    const exitInputOnEnter = useExitInputOnEnter();

    // prettier-ignore
    const putAttrApiCaller = useMemo(() => createPutRequest<UpdateQuestionRequest, ApiResponse<null>>(),[]);
    // prettier-ignore
    const putOrderApiCaller = useMemo(() => createPutRequest<UpdateOptionsOrderRequest, ApiResponse<null>>(),[]);

    //【設問タイトルの変更】
    const updateTitle = async () => {
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
          target.compareKey = uuid();
        }
      );
      mutate(
        new SuccessResponseBuilder<SessionEditableFields>(optimisticLatestData!)
          .setHttpStatus(StatusCodes.OK)
          .build(),
        false
      );
      // [PUT] /api/v1/teacher/questions/[id]/title
      const ep = `/api/v1/teacher/questions/${id}/title`;
      const reqBody: UpdateQuestionRequest = { id, title };
      dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
      const res = await putAttrApiCaller(ep, reqBody, apiRequestHeader);
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
    };

    //【デフォルト選択肢の変更】
    // prettier-ignore
    const defaultOptionUpdateStream = useMemo(
      () => new Subject<UpdateQuestionRequest>(), []);

    useEffect(() => {
      const subscription = defaultOptionUpdateStream
        .pipe(
          debounceTime(1500),
          throttleTime(1500, undefined, { leading: false, trailing: true })
        )
        .subscribe(async ({ id, defaultOptionId }) => {
          // [PUT] /api/v1/teacher/questions/[id]/default-option-id
          const ep = `/api/v1/teacher/questions/${id}/default-option-id`;
          const reqBody: UpdateQuestionRequest = { id, defaultOptionId };
          dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
          const res = await putAttrApiCaller(ep, reqBody, apiRequestHeader);
          dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
        });
      return () => {
        subscription.unsubscribe();
      };
    }, [apiRequestHeader, defaultOptionUpdateStream, putAttrApiCaller]);

    const publishUpdateDefaultOption = useCallback(
      (req: UpdateQuestionRequest) => {
        defaultOptionUpdateStream.next(req);
      },
      [defaultOptionUpdateStream]
    );

    //【選択肢の並べ替え】
    const reorderOptions = async () => {
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

      // [PUT] /api/v1/teacher/questions/[id]/options-order
      const ep = `/api/v1/teacher/questions/${id}/options-order`;
      const reqBody: UpdateOptionsOrderRequest = updateOptionsOrderSchema.parse(
        {
          data: newOrder2,
        }
      );
      // dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
      const res = await putOrderApiCaller(ep, reqBody, apiRequestHeader);
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
    };

    //【設問の削除】
    const deleteQuestion = async () => {
      await confirmDeleteQuestion(id, title);
    };

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
            className="rounded-md border px-3 py-1 text-sm"
            onClick={reorderOptions}
          >
            並べ替え（仮）
          </button>
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={deleteQuestion}
          >
            設問削除
          </button>
        </div>
        <div>
          {question.options.map((option) => (
            <OptionView
              key={option.id}
              option={option}
              isDefaultSelected={option.id === question.defaultOptionId}
              getOptimisticLatestData={getOptimisticLatestData}
              mutate={mutate}
              onUpdateDefaultOption={publishUpdateDefaultOption}
            />
          ))}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.question.compareKey === nextProps.question.compareKey
);

QuestionView.displayName = "QuestionView";

export default QuestionView;
