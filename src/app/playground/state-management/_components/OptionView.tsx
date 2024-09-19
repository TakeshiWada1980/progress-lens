"use client";

import React, { useState, memo } from "react";
import { RenderCount } from "@/app/_components/elements/RenderCount";
import { Option } from "../_types/types";
import { useBackendSync } from "../_hooks/useBackendSync";
import dev from "@/app/_utils/devConsole";

type Props = {
  option: Option;
  isDefaultSelected: boolean;
};

const OptionView: React.FC<Props> = memo(
  ({ option, isDefaultSelected }) => {
    const backendSync = useBackendSync();
    const [title, setTitle] = useState(option.title);

    const updateTitle = async () => {
      dev.console.log(
        `選択肢（${option.id}）の見出しを「${title}」に変更しました`
      );
      await backendSync.updateOptionTitle(option.id, title); // バックエンドに送信
    };

    const changeDefaultOption = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (event.target.checked) {
        dev.console.log(
          `設問（${option.questionId}）のデフォルト回答が ${option.id} に設定されました`
        );
        await backendSync.changeDefaultOption(option.questionId, option.id);
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
