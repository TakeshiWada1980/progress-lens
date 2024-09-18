import React, { createContext } from "react";
import { EditSessionActions } from "../_types/types";

export const BackendSyncContext = createContext<EditSessionActions | undefined>(
  undefined
);

export const useBackendSync = () => {
  const context = React.useContext(BackendSyncContext);
  if (context === undefined) {
    throw new Error(
      "useBackendSync must be used within a BackendSyncContext.Provider"
    );
  }
  return context;
};
