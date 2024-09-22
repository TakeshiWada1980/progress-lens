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
import { UpdateQuestionRequest } from "@/app/_types/SessionTypes";
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
};

// memoでラップすることで、親コンポーネントに連鎖する再レンダリングを抑制し
// Props (compareKey属性) が変更されたときだけ 再レンダリング されるようにしている
const QuestionView: React.FC<Props> = memo(
  ({ question, getOptimisticLatestData, mutate }) => {
    const id = question.id;
    const [title, setTitle] = useState(question.title);
    const prevTitle = useRef(question.title);
    const { apiRequestHeader } = useAuth();
    const exitInputOnEnter = useExitInputOnEnter();

    // prettier-ignore
    const putApiCaller = useMemo(() => createPutRequest<UpdateQuestionRequest, ApiResponse<null>>(),[]);
    // prettier-ignore
    const deleteApiCaller = useMemo(() => createDeleteRequest<ApiResponse<null>>(),[]);

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
      const res = await putApiCaller(ep, reqBody, apiRequestHeader);
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
          const res = await putApiCaller(ep, reqBody, apiRequestHeader);
          dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
        });
      return () => {
        subscription.unsubscribe();
      };
    }, [apiRequestHeader, defaultOptionUpdateStream, putApiCaller]);

    const publishUpdateDefaultOption = useCallback(
      (req: UpdateQuestionRequest) => {
        defaultOptionUpdateStream.next(req);
      },
      [defaultOptionUpdateStream]
    );

    //【設問の削除】
    const deleteQuestion = async () => {
      dev.console.log(`設問（${question.id}）を削除しました`);

      const optimisticLatestData = produce(
        getOptimisticLatestData(),
        (draft: Draft<SessionEditableFields>) => {
          const index = draft.questions.findIndex((q) => q.id === id);
          if (index === -1) throw new Error(`Question (id=${id}) not found.`);
          draft.questions.splice(index, 1);
        }
      );
      mutate(
        new SuccessResponseBuilder<SessionEditableFields>(optimisticLatestData!)
          .setHttpStatus(StatusCodes.OK)
          .build(),
        false
      );
      // [DELETE] /api/v1/teacher/questions/[id]
      const ep = `/api/v1/teacher/questions/${id}`;
      dev.console.log("■ >>> ");
      const res = await deleteApiCaller(ep, apiRequestHeader);
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));
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
