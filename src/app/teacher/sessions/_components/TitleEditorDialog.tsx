"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

// UIコンポーネント
import TextInputField from "@/app/_components/elements/TextInputField";
import ActionButton from "@/app/_components/elements/ActionButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/shadcn/ui/dialog";
import FormFieldErrorMsg from "@/app/_components/elements/FormFieldErrorMsg";

// 型・定数・ユーティリティ
import { createSessionRequestSchema } from "@/app/_types/SessionTypes";
import { z } from "zod";

export const editTitlePayloadSchema = createSessionRequestSchema.extend({
  id: z.string().optional(),
});

export interface EditTitlePayload {
  id?: string;
  title: string;
}

interface Props {
  dialogTitle: string;
  submitButtonLabel: string;
  isSubmitting: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (data: EditTitlePayload) => void;
}

export const EditTitleDialog: React.FC<Props> = (props) => {
  const {
    dialogTitle,
    submitButtonLabel,
    isDialogOpen,
    isSubmitting,
    setIsDialogOpen,
    onSubmit,
  } = props;
  const { register, formState, handleSubmit } =
    useFormContext<EditTitlePayload>();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="my-6">
            <label
              htmlFor="title"
              className="mb-1 block font-bold text-gray-700"
            >
              タイトル
            </label>
            <TextInputField
              {...register("title")}
              id="title"
              type="text"
              error={!!formState.errors.title}
            />
            <FormFieldErrorMsg msg={formState.errors.title?.message} />
            <input type="hidden" id="id" {...register("id")} />
          </div>

          <DialogFooter>
            <ActionButton
              type="submit"
              isBusy={isSubmitting}
              disabled={!formState.isValid || isSubmitting}
            >
              {submitButtonLabel}
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
