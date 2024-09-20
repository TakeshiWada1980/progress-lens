"use client";

import React, { useState, useRef, memo } from "react";
import { RenderCount } from "@/app/_components/elements/RenderCount";
import { Question, Option } from "../_types/types";
import dev from "@/app/_utils/devConsole";
import { produce, Draft } from "immer";
import { v4 as uuid } from "uuid";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { KeyedMutator } from "swr";
import { ApiResponse } from "@/app/_types/ApiResponse";

type Props = {
  option: Option;
  isDefaultSelected: boolean;
  getOptimisticLatestData: () => Question[] | undefined;
  mutate: KeyedMutator<ApiResponse<Question[]>>;
};

const OptionView: React.FC<Props> = memo(
  ({ option, isDefaultSelected, getOptimisticLatestData, mutate }) => {
    const id = option.id;
    const [title, setTitle] = useState(option.title);
    const prevTitle = useRef(option.title);

    const updateTitle = async () => {
      if (title === prevTitle.current) return;
      prevTitle.current = title;
      dev.console.log(
        `選択肢（${option.id}）の見出しを「${title}」に変更しました`
      );

      const optimisticLatestData = produce(
        getOptimisticLatestData(),
        (draft: Draft<Question[]>) => {
          const target = draft
            .flatMap((q) => q.options)
            .find((o) => o.id === id);
          if (!target) throw new Error(`Option (id=${id}) not found.`);
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

      // [PUT] /api/v1/teacher/options/[id]/title
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Dummy
    };

    const changeDefaultOption = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (event.target.checked) {
        dev.console.log(
          `設問（${option.questionId}）のデフォルト回答が ${option.id} に変更されました`
        );

        const optimisticLatestData = produce(
          getOptimisticLatestData(),
          (draft: Draft<Question[]>) => {
            const target = draft.find((q) => q.id === option.questionId);
            if (!target)
              throw new Error(`Question (id=${option.questionId}) not found.`);
            target.defaultOptionId = id;
            target.compareKey = uuid();
          }
        );
        mutate(
          new SuccessResponseBuilder<Question[]>(optimisticLatestData!)
            .setHttpStatus(StatusCodes.OK)
            .build(),
          false
        );

        // [PUT] /api/v1/teacher/options/[id]/default-option
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    return (
      <div className="m-1 border p-1">
        <RenderCount />
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-blue-500">
              id=&quot;{option.id}&quot;
            </div>
            <input
              id={"option" + id}
              type="text"
              value={title}
              className="rounded-md border px-1"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={updateTitle}
            />
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="radio"
              id={option.id}
              name={`${option.questionId}-default-option`}
              value={option.id}
              defaultChecked={isDefaultSelected}
              className="ml-2"
              onChange={changeDefaultOption}
            />
            <label htmlFor={option.id}>デフォルト回答に設定</label>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.option.compareKey === nextProps.option.compareKey
);

OptionView.displayName = "OptionView";

export default OptionView;
