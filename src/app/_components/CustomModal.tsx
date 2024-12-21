import React, { FC, ReactNode } from "react";
import Modal from "react-modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

const CustomModal: FC<Props> = (props) => {
  const { isOpen, onClose, className, children } = props;

  const customStyles = {
    content: {
      top: "50%",
      left: "30%", // 左端を30%の位置に設定
      width: "40%", // 幅を40%に設定（左右の余白がそれぞれ30%になる）
      right: "auto",
      bottom: "auto",
      transform: "translate(0, -50%)", // 垂直方向のみ中央寄せ
      padding: "20px",
      borderRadius: "10px", // 角を丸くする
      border: "none",
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={className}
      style={customStyles} // スタイルプロップを使用する方法
      ariaHideApp={false} // 警告を消すために必要
    >
      {children}
    </Modal>
  );
};

export default CustomModal;
