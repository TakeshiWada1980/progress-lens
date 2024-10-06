"use client";

import React, { memo, useState, useRef, useLayoutEffect } from "react";
import {
  SessionEditableFields,
  QuestionEditableFields,
} from "@/app/_types/SessionTypes";
import { removeViewIdFromQuestionEditableFields } from "../_helpers/propComparison";
import QuestionContent from "./QuestionContent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGripVertical,
  faCircleChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";

import dev from "@/app/_utils/devConsole";

import {
  Collapsible,
  CollapsibleContent,
} from "@/app/_components/shadcn/ui/collapsible";

type Props = {
  question: QuestionEditableFields;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
  confirmDeleteQuestion: (
    questionId: string,
    questionTitle: string
  ) => Promise<void>;
  duplicateQuestion: (
    questionId: string,
    questionTitle: string
  ) => Promise<void>;
  isDragging: boolean;
};

// 設問のドラッグアンドドロップの処理ためのラッパーコンポーネント
const QuestionWrapper: React.FC<Props> = memo(
  (props) => {
    const {
      question,
      getOptimisticLatestData,
      confirmDeleteQuestion,
      duplicateQuestion,
      isDragging,
    } = props;
    const sortable = useSortable({ id: question.viewId! });
    const [isOpen, setIsOpen] = useState(true);

    //【設問の削除】
    const deleteQuestionAction = async () =>
      await confirmDeleteQuestion(question.id, question.title);

    //【設問の複製】
    const copyQuestionAction = async () =>
      await duplicateQuestion(question.id, question.title);

    return (
      <div
        ref={sortable.setNodeRef}
        style={{
          transform: CSS.Transform.toString(sortable.transform),
          transition: sortable.transition,
        }}
        className={twMerge("mb-0 border p-1", isDragging && "bg-blue-50")}
      >
        {/* ドラッグアンドドロップのグリップ */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex justify-between">
              <div
                ref={sortable.setActivatorNodeRef}
                {...sortable.listeners}
                {...sortable.attributes}
                className="ml-1 mr-2 flex-none cursor-move text-gray-300 hover:text-gray-400"
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={faGripVertical} />
              </div>
              <div>{!isOpen && question.title}</div>
            </div>

            <div className="flex items-center">
              <button
                tabIndex={-1}
                className="mr-1 rounded-md border border-gray-200 px-2 py-0 text-sm text-gray-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={copyQuestionAction}
              >
                複製
              </button>
              <button
                tabIndex={-1}
                className="mr-3 rounded-md border border-gray-200 px-2 py-0 text-sm text-gray-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={deleteQuestionAction}
              >
                削除
              </button>
              <button
                className="px-1 text-slate-300 hover:text-gray-400"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <FontAwesomeIcon
                  icon={faCircleChevronRight}
                  className={twMerge(
                    "transition-transform duration-200",
                    isOpen && "rotate-90"
                  )}
                />
              </button>
            </div>
          </div>

          {/* 設問ビューの本体（分離して無駄な再レンダリングを抑制） */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-0">
            <CollapsibleContent>
              <QuestionContent
                question={question}
                getOptimisticLatestData={getOptimisticLatestData}
              />
            </CollapsibleContent>
          </Collapsible>
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

QuestionWrapper.displayName = "QuestionWrapper";

export default QuestionWrapper;
