"use client";

import React, { useState, useRef, memo, useMemo, useCallback } from "react";
import { RenderCount } from "@/app/_components/elements/RenderCount";
import {
  SessionEditableFields,
  OptionEditableFields,
} from "@/app/_types/SessionTypes";
import dev from "@/app/_utils/devConsole";
import { produce, Draft } from "immer";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
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
import { mutate } from "swr";

type Props = {
  option: OptionEditableFields;
  getOptimisticLatestData: () => SessionEditableFields | undefined;
  onUpdateDefaultOption: (req: UpdateQuestionRequest) => void;
};

const OptionView: React.FC<Props> = memo(
  ({ option, getOptimisticLatestData, onUpdateDefaultOption }) => {
    const id = option.id;
    const [title, setTitle] = useState(option.title);
    const prevTitle = useRef(option.title);
    const { apiRequestHeader } = useAuth();
    const exitInputOnEnter = useExitInputOnEnter();
    const sessionEp = `/api/v1/teacher/sessions/${
      getOptimisticLatestData()?.id
    }`;

    const isDefaultSelected =
      option.id ===
      getOptimisticLatestData()?.questions.find(
        (q) => q.id === option.questionId
      )?.defaultOptionId;

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
        }
      );
      mutate(
        sessionEp,
        new SuccessResponseBuilder<SessionEditableFields>(optimisticLatestData!)
          .setHttpStatus(StatusCodes.OK)
          .build(),
        false
      );

      // バックエンド同期: 選択肢タイトル変更APIリクエスト
      const ep = `/api/v1/teacher/options/${id}/title`;
      const reqBody: UpdateOptionRequest = { id, title };
      dev.console.log("■ >>> " + JSON.stringify(reqBody, null, 2));
      const res = await putApiCaller(ep, { id, title }, apiRequestHeader);
      dev.console.log("■ <<< " + JSON.stringify(res, null, 2));

      // mutate(sessionEp);
    }, [
      title,
      getOptimisticLatestData,
      sessionEp,
      id,
      putApiCaller,
      apiRequestHeader,
    ]);

    //【既定の回答選択肢の変更】
    const changeDefaultOption = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
          onUpdateDefaultOption({
            id: option.questionId,
            defaultOptionId: option.id,
          });
        }
      },
      [onUpdateDefaultOption, option.questionId, option.id]
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
    JSON.stringify(prevProps.option) === JSON.stringify(nextProps.option)
);

OptionView.displayName = "OptionView";

export default OptionView;
