"use client";

import useAuthenticatedGetRequest from "@/app/_hooks/useAuthenticatedGetRequest";
import { Question } from "../_types/types";

export const useStateManagement = () => {
  const ep = "/api/alpha/state-management";
  const { data, mutate } = useAuthenticatedGetRequest<Question[]>(ep);
  return { data, mutate };
};
