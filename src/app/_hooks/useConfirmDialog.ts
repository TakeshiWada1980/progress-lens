import { useState } from "react";
import { set } from "zod";

type SubmitFunction<T> = (data: T) => void | Promise<void>;

const useConfirmDialog = <T>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [onSubmit, setOnSubmit] = useState<SubmitFunction<T>>(() => () => {});
  const [data, setData] = useState<T | null>(null);

  const openDialog = (
    newTitle: string,
    newDescription: string,
    newOnSubmit: SubmitFunction<T>,
    newData: T
  ) => {
    setTitle(newTitle);
    setDescription(newDescription);
    setOnSubmit(() => newOnSubmit);
    setData(newData);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setData(null);
  };

  const submitAction = () => {
    if (data !== null) {
      onSubmit(data);
    }
    closeDialog();
  };

  return {
    isOpen,
    setIsOpen,
    title,
    description,
    openDialog,
    submitAction,
  };
};

export default useConfirmDialog;
