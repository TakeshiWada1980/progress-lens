"use client";

import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import { SessionEditableFields } from "@/app/_types/SessionTypes";

export const useStateManagement = () => {
  const id = "cm1dmmv0s0002dg0zwgbt5vna"; // TODO: デバッグ用
  const ep = `/api/v1/teacher/sessions/${id}`;
  const { data, mutate } =
    useAuthenticatedGetRequest<SessionEditableFields>(ep);
  return { data, mutate };
};
