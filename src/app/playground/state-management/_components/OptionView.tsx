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
      const newTitle = title + "+";
      setTitle(newTitle); // 楽観的UI更新
      await backendSync.updateOptionTitle(option.id, newTitle); // バックエンドに送信
    };

    const changeDefaultOption = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (event.target.checked) {
        console.log(
          `設問（${option.questionId}）のデフォルト回答が ${option.id} に設定されました`
        );
        await backendSync.changeDefaultOption(option.questionId, option.id);
      }
    };

    return (
      <div className="m-1 border p-1">
        <RenderCount />
        <div className="flex space-x-3">
          <div className="flex items-center">
            <div>
              {title}（id: {option.id}）
            </div>
            <button
              className="rounded-md border px-3 py-1 text-sm"
              onClick={updateTitle}
            >
              タイトルを変更
            </button>
          </div>
          <div className="flex space-x-1">
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
