"use client";

import React, { useState, useRef, memo } from "react";
import { RenderCount } from "@/app/_components/elements/RenderCount";
import OptionView from "../_components/OptionView";
import { Question } from "../_types/types";
import { useBackendSync } from "../_hooks/useBackendSync";
import dev from "@/app/_utils/devConsole";

type Props = {
  question: Question;
};

// memoでラップすることで、親コンポーネントに連鎖する再レンダリングを抑制し
// Props が変更されたときだけ 再レンダリング されるようにしている
const QuestionView: React.FC<Props> = memo(
  ({ question }) => {
    const backendSync = useBackendSync();
    const [title, setTitle] = useState(question.title);
    const prevTitle = useRef(question.title);

    const updateTitle = async () => {
      if (title === prevTitle.current) return;
      prevTitle.current = title;
      dev.console.log(
        `設問（${question.id}）のタイトルを「${title}」に変更しました`
      );
      await backendSync.updateQuestionTitle(question.id, title); // バックエンド同期
    };

    const deleteQuestion = async () => {
      dev.console.log(`設問（${question.id}）を削除しました`);
      await backendSync.deleteQuestion(question.id); // バックエンド同期
    };

    return (
      <div className="m-1 border p-1">
        <RenderCount />
        <div className="flex items-center space-x-2">
          <div className="text-sm text-blue-500">
            id=&quot;{question.id}&quot;
          </div>
          <input
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