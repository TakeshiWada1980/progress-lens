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

    // console.log("isDragging", isDragging);

    return (
      <div
        ref={sortable.setNodeRef}
        style={{
          transform: CSS.Transform.toString(sortable.transform),
          transition: sortable.transition,
        }}
        className={twMerge(
          "mb-0 rounded-t-md border border-indigo-200",
          isDragging && "border-2",
          !isOpen && "border-b-2 border-b-indigo-300"
        )}
      >
        {/* ドラッグアンドドロップのグリップ */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between rounded-t-md bg-indigo-50 p-1">
            <div className="flex justify-between">
              <div
                ref={sortable.setActivatorNodeRef}
                {...sortable.listeners}
                {...sortable.attributes}
                className="ml-1 mr-2 flex-none cursor-move text-indigo-200 hover:text-indigo-400"
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={faGripVertical} />
              </div>
              <div className="font-bold text-indigo-800">
                {!isOpen && question.title}
              </div>
            </div>

            <div
              className="grow bg-transparent"
              onDoubleClick={() => setIsOpen((prev) => !prev)}
            >
              <span className="text-transparent">.</span>
            </div>

            <div className="flex items-center">
              <button
                tabIndex={-1}
                className="mr-1 rounded-md border border-gray-200 bg-indigo-300  px-2 py-0 text-sm text-white hover:border-indigo-500 hover:bg-indigo-500"
                onClick={copyQuestionAction}
              >
                複製
              </button>
              <button
                tabIndex={-1}
                className="mr-3 rounded-md border border-gray-200 bg-indigo-300  px-2 py-0 text-sm text-white hover:border-indigo-500 hover:bg-indigo-500"
                onClick={deleteQuestionAction}
              >
                削除
              </button>
              <button
                className="px-1 text-indigo-300 hover:text-indigo-500"
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
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            // className="mb-0 p-1"
          >
            {/* <div className="mb-0 p-1"> */}
            <CollapsibleContent>
              <QuestionContent
                question={question}
                getOptimisticLatestData={getOptimisticLatestData}
              />
            </CollapsibleContent>
            {/* </div> */}
          </Collapsible>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    const p = removeViewIdFromQuestionEditableFields(prevProps.question);
    const n = removeViewIdFromQuestionEditableFields(nextProps.question);
    return (
      JSON.stringify(p) === JSON.stringify(n) &&
      prevProps.isDragging === nextProps.isDragging
    );
  }
);

QuestionWrapper.displayName = "QuestionWrapper";

export default QuestionWrapper;
