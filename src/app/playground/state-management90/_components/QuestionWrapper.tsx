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
  faCircleChevronUp,
} from "@fortawesome/free-solid-svg-icons";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";

import dev from "@/app/_utils/devConsole";

type Props = {
  question: QuestionEditableFields;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
  confirmDeleteQuestion: (
    questionId: string,
    questionTitle: string
  ) => Promise<void>;
  isDragging: boolean;
};

// 設問のドラッグアンドドロップの処理ためのラッパーコンポーネント
const QuestionWrapper: React.FC<Props> = memo(
  ({
    question,
    getOptimisticLatestData,
    confirmDeleteQuestion,
    isDragging,
  }) => {
    const sortable = useSortable({ id: question.viewId! });

    // 開閉関連
    const [isOpen, setIsOpen] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    const [contentHeight, setContentHeight] = useState<string | undefined>(
      undefined
    );

    useLayoutEffect(() => {
      if (contentRef.current) {
        if (isOpen) {
          setContentHeight(undefined);
        } else {
          setContentHeight("0px");
        }
      }
    }, [isOpen]);

    const toggleOpen = () => {
      setIsOpen((prev) => !prev);
    };

    return (
      <div
        ref={sortable.setNodeRef}
        style={{
          transform: CSS.Transform.toString(sortable.transform),
          transition: sortable.transition,
        }}
        className={twMerge("border p-1", isDragging && "bg-blue-50")}
      >
        {/* ドラッグアンドドロップのグリップ */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex justify-between">
              <div
                ref={sortable.setActivatorNodeRef}
                {...sortable.listeners}
                {...sortable.attributes}
                className="ml-1 mr-2 flex-none cursor-move text-gray-300"
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={faGripVertical} />
              </div>
              <div>{!isOpen && question.title}</div>
            </div>
            <button className="mr-1 text-slate-500" onClick={toggleOpen}>
              <FontAwesomeIcon
                icon={faCircleChevronUp}
                className={twMerge(
                  "transition-transform duration-200",
                  isOpen && "-rotate-180"
                )}
              />
            </button>
          </div>

          {/* 設問ビューの本体（分離して無駄な再レンダリングを抑制） */}
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ height: contentHeight }}
          >
            <div ref={contentRef}>
              <QuestionContent
                question={question}
                getOptimisticLatestData={getOptimisticLatestData}
                confirmDeleteQuestion={confirmDeleteQuestion}
              />
            </div>
          </div>
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
