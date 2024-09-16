import { useState } from "react";

const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [onSubmit, setOnSubmit] = useState<() => void>(() => {});

  const openDialog = (
    newTitle: string,
    newDescription: string,
    newOnSubmitFunction: () => void
  ) => {
    setTitle(newTitle);
    setDescription(newDescription);
    setOnSubmit(() => newOnSubmitFunction);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const submitAction = () => {
    onSubmit();
    close();
  };

  return {
    isOpen,
    title,
    description,
    openDialog,
    submitAction,
    close,
  };
};

export default useConfirmDialog;
