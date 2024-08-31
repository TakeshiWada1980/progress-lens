import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

interface Props {
  msg: string | null | undefined;
}

const FormFieldErrorMsg: React.FC<Props> = (props) => {
  const { msg } = props;
  if (!msg) {
    return <></>;
  }
  return (
    <div className="mt-1 flex items-center text-sm text-red-400">
      <FontAwesomeIcon icon={faCircleExclamation} className="mr-1" />
      {msg}
    </div>
  );
};

export default FormFieldErrorMsg;
