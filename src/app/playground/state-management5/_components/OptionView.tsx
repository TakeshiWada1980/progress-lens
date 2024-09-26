"use client";

import React, { useState, useRef, memo, useMemo, useCallback } from "react";
import { RenderCount } from "@/app/_components/elements/RenderCount";
import {
  SessionEditableFields,
  OptionEditableFields,
} from "@/app/_types/SessionTypes";
import dev from "@/app/_utils/devConsole";
import { produce, Draft } from "immer";
import { v4 as uuid } from "uuid";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { KeyedMutator } from "swr";
import { ApiResponse } from "@/app/_types/ApiResponse";
import {
  UpdateQuestionRequest,
  UpdateOptionRequest,
} from "@/app/_types/SessionTypes";
import { createPutRequest } from "@/app/_utils/createApiRequest";
import useAuth from "@/app/_hooks/useAuth";
import { useExitInputOnEnter } from "@/app/_hooks/useExitInputOnEnter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";

type Props = {
  option: OptionEditableFields;
  isDefaultSelected: boolean;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
  mutate: KeyedMutator<ApiResponse<SessionEditableFields>>;
  onUpdateDefaultOption: (req: UpdateQuestionRequest) => void;
};

const OptionView: React.FC<Props> = memo(
  ({
    option,
    isDefaultSelected,
    getOptimisticLatestData,
    mutate,
    onUpdateDefaultOption,
  }) => {
    const id = option.id;
    const [title, setTitle] = useState(option.title);
    const prevTitle = useRef(option.title);
    const { apiRequestHeader } = useAuth();
    const exitInputOnEnter = useExitInputOnEnter();

    // prettier-ignore
    const putApiCaller = useMemo(() => createPutRequest<UpdateOptionRequest, ApiResponse<null>>(),[]);

    //【回答選択肢タイトルの変更】
    const updateTitle = useCallback(async () => {
      // TODO: バリデーションが必要
      if (title === prevTitle.current) return;
      prevTitle.current = title;

      const optimisticLatestData = produce(
        getOptimisticLatestData(),
        (draft: Draft<SessionEditableFields>) => {
          const target = draft.questions
            .flatMap((q) => q.options)
            .find((o) => o.id === id);
          if (!target) throw new Error(`Option (id=${id}) not found.`);
          target.title = title;
          target.compareKey = uuid();
        }
      );
      // mutate(
      //   new SuccessResponseBuilder<SessionEditableFields>(optimisticLatestData!)
      //     .setHttpStatus(StatusCodes.OK)
      //     .build(),
      //   false
      // );

      // バックエンド同期: 選択肢タイトル変更APIリクエスト
      const ep = `/api/v1/teacher/options/${id}/title`;
      const reqBody: UpdateOptionRequest = { id, title };
      dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
      const res = await putApiCaller(ep, { id, title }, apiRequestHeader);
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));

      mutate();
    }, [
      title,
      getOptimisticLatestData,
      mutate,
      id,
      putApiCaller,
      apiRequestHeader,
    ]);

    //【既定の回答選択肢の変更】
    const changeDefaultOption = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
          const optimisticLatestData = produce(
            getOptimisticLatestData(),
            (draft: Draft<SessionEditableFields>) => {
              const target = draft.questions.find(
                (q) => q.id === option.questionId
              );
              if (!target)
                throw new Error(
                  `Question (id=${option.questionId}) not found.`
                );
              target.defaultOptionId = id;
              target.compareKey = uuid();
            }
          );
          mutate(
            new SuccessResponseBuilder<SessionEditableFields>(
              optimisticLatestData!
            )
              .setHttpStatus(StatusCodes.OK)
              .build(),
            false
          );

          // [PUT] /api/v1/teacher/options/[id]/default-option
          onUpdateDefaultOption({
            id: option.questionId,
            defaultOptionId: option.id,
          });
        }
      },
      [
        getOptimisticLatestData,
        mutate,
        onUpdateDefaultOption,
        option.questionId,
        option.id,
        id,
      ]
    );

    return (
      <div className="m-1 border p-1">
        <div className="flex items-center space-x-2">
          <RenderCount />
          <div className="text-xs text-blue-500">
            id=&quot;{option.id}&quot;
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="ml-1 flex-none cursor-move text-gray-300">
            <FontAwesomeIcon icon={faGripVertical} />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id={"option" + id}
              type="text"
              value={title}
              className="rounded-md border px-1"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={updateTitle}
              onKeyDown={exitInputOnEnter}
            />
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <input
              tabIndex={-1}
              type="radio"
              id={option.id}
              name={`${option.questionId}-default-option`}
              value={option.id}
              defaultChecked={isDefaultSelected}
              className="ml-2 cursor-pointer"
              onChange={changeDefaultOption}
            />
            <label className="cursor-pointer" htmlFor={option.id}>
              既定
            </label>
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
