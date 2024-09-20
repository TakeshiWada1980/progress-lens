"use client";

import React, { useState, useRef, memo } from "react";
import { RenderCount } from "@/app/_components/elements/RenderCount";
import OptionView from "../_components/OptionView";
import { Question } from "../_types/types";
import dev from "@/app/_utils/devConsole";
import { produce, Draft } from "immer";
import { v4 as uuid } from "uuid";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { KeyedMutator } from "swr";
import { ApiResponse } from "@/app/_types/ApiResponse";

type Props = {
  question: Question;
  getOptimisticLatestData: () => Question[] | undefined;
  mutate: KeyedMutator<ApiResponse<Question[]>>;
};

// memoでラップすることで、親コンポーネントに連鎖する再レンダリングを抑制し
// Props が変更されたときだけ 再レンダリング されるようにしている
const QuestionView: React.FC<Props> = memo(
  ({ question, getOptimisticLatestData, mutate }) => {
    const id = question.id;
    const [title, setTitle] = useState(question.title);
    const prevTitle = useRef(question.title);

    const updateTitle = async () => {
      if (title === prevTitle.current) return;
      prevTitle.current = title;
      dev.console.log(
        `設問（${question.id}）のタイトルを「${title}」に変更しました`
      );

      const optimisticLatestData = produce(
        getOptimisticLatestData(),
        (draft: Draft<Question[]>) => {
          const target = draft.find((question) => question.id === id);
          if (!target) throw new Error(`Question (id=${id}) not found.`);
          target.title = title;
          target.compareKey = uuid();
        }
      );
      mutate(
        new SuccessResponseBuilder<Question[]>(optimisticLatestData!)
          .setHttpStatus(StatusCodes.OK)
          .build(),
        false
      );
      // [PUT] /api/v1/teacher/questions/[id]/title
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Dummy
    };

    const deleteQuestion = async () => {
      dev.console.log(`設問（${question.id}）を削除しました`);

      const optimisticLatestData = produce(
        getOptimisticLatestData(),
        (draft: Draft<Question[]>) => {
          const index = draft.findIndex((q) => q.id === id);
          if (index === -1) throw new Error(`Question (id=${id}) not found.`);
          draft.splice(index, 1);
        }
      );
      mutate(
        new SuccessResponseBuilder<Question[]>(optimisticLatestData!)
          .setHttpStatus(StatusCodes.OK)
          .build(),
        false
      );
      // [DELETE] /api/v1/teacher/questions/[id]
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Dummy
    };

    return (
      <div className="m-1 border p-1">
        <RenderCount />
        <div className="flex items-center space-x-2">
          <div className="text-sm text-blue-500">
            id=&quot;{question.id}&quot;
          </div>
          <input
            id={"title" + id}
            type="text"
            value={title}
            className="rounded-md border px-1"
            onChange={(e) => setTitle(e.target.value)}
            onBlur={updateTitle}
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
