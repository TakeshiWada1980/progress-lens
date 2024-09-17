"use client";

import React, { useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

interface EditableTextProps {
  initText: string;
  onChange: (newText: string) => void;
  inputClassName?: string;
  displayClassName?: string;
}

const c_Mousedown = "mousedown";
const c_Enter = "Enter";
const c_Escape = "Escape";

export const EditableText: React.FC<EditableTextProps> = ({
  initText,
  onChange,
  inputClassName,
  displayClassName,
}) => {
  const [text, setText] = useState(initText);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ここでは「再レンダリングがトリガーされないuseState」としてuseRefを使う
  const prevTextRef = useRef(initText);

  const handleFieldClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    },
    []
  );

  const saveChanges = useCallback(() => {
    setIsEditing(false);

    // 実質的な変更があったときだけ onChange を呼ぶ
    if (text !== prevTextRef.current) {
      onChange(text);
      prevTextRef.current = text;
    }
  }, [text, onChange]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setText(prevTextRef.current); // 元に戻す
  }, []);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === c_Enter) {
        saveChanges();
      } else if (e.key === c_Escape) {
        cancelEdit();
        e.preventDefault();
      }
    },
    [saveChanges, cancelEdit]
  );

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isEditing &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        saveChanges();
      }
    };

    document.addEventListener(c_Mousedown, handleClickOutside);
    return () => {
      document.removeEventListener(c_Mousedown, handleClickOutside);
    };
  }, [isEditing, saveChanges]);

  React.useEffect(() => {
    prevTextRef.current = initText;
    setText(initText);
  }, [initText]);

  return (
    <>
      {!isEditing ? (
        <div
          onClick={handleFieldClick}
          className="inline-flex cursor-pointer items-center"
        >
          <div className={twMerge(displayClassName)}>{text}</div>
          <FontAwesomeIcon icon={faPen} className="ml-2 text-sm" />
        </div>
      ) : (
        <input
          ref={inputRef}
          className={twMerge("border border-gray-400 p-1", inputClassName)}
          type="text"
          value={text}
          onChange={handleInputChange}
          onBlur={saveChanges}
          onKeyDown={handleInputKeyDown}
        />
      )}
    </>
  );
};
