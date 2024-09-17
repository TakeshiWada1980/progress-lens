"use client";

import React from "react";
import PageTitle from "@/app/_components/elements/PageTitle";

import { EditableText } from "@/app/_components/elements/EditableText";

const Page: React.FC = () => {
  const handleTextChange = (newTitle: string) => {
    console.log(newTitle);
  };

  return (
    <div>
      <PageTitle title="UIテスト" className="mb-6" />

      <EditableText initText="タイトル" onChange={handleTextChange} />
    </div>
  );
};

export default Page;
