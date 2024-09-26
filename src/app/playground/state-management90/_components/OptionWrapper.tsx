"use client";

import React, { memo } from "react";
import {
  SessionEditableFields,
  OptionEditableFields,
} from "@/app/_types/SessionTypes";
import { UpdateQuestionRequest } from "@/app/_types/SessionTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import OptionContent from "./OptionContent";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";

import dev from "@/app/_utils/devConsole";
import { removeViewIdFromOptionEditableFields } from "../_helpers/propComparison";

type Props = {
  option: OptionEditableFields;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
  onUpdateDefaultOption: (req: UpdateQuestionRequest) => void;
  isDragging: boolean;
};

// 回答選択肢のドラッグアンドドロップの処理ためのラッパーコンポーネント
const OptionWrapper: React.FC<Props> = memo(
  ({ option, getOptimisticLatestData, onUpdateDefaultOption, isDragging }) => {
    const sortable = useSortable({ id: option.viewId! });

    return (
      <div
        ref={sortable.setNodeRef}
        style={{
          transform: CSS.Transform.toString(sortable.transform),
          transition: sortable.transition,
        }}
        className={twMerge("m-1 border p-1", isDragging && "bg-blue-50")}
      >
        {/* ドラッグアンドドロップのグリップ */}
        <div className="flex space-x-2">
          <div
            ref={sortable.setActivatorNodeRef}
            {...sortable.listeners}
            {...sortable.attributes}
            className="ml-1 flex-none cursor-move text-gray-300"
            tabIndex={-1}
          >
            <FontAwesomeIcon icon={faGripVertical} />
          </div>

          {/* 回答選択肢ビューの本体（分離して無駄な再レンダリングを抑制） */}
          <OptionContent
            option={option}
            getOptimisticLatestData={getOptimisticLatestData}
            onUpdateDefaultOption={onUpdateDefaultOption}
            isDragging={isDragging}
          />
        </div>
      </div>
    );
  },
  // カスタム比較関数
  (prevProps, nextProps) => {
    const p = removeViewIdFromOptionEditableFields(prevProps.option);
    const n = removeViewIdFromOptionEditableFields(nextProps.option);
    return (
      JSON.stringify(p) === JSON.stringify(n) &&
      prevProps.isDragging === nextProps.isDragging
    );
  }
);

OptionWrapper.displayName = "OptionWrapper";

export default OptionWrapper;
