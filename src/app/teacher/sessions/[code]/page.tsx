"use client";

import React from "react";
import { useParams } from "next/navigation";
import PageTitle from "@/app/_components/elements/PageTitle";

const Page: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  return (
    <div>
      <PageTitle title={`AccessCode: ${code}`} />
      <div>未実装</div>
    </div>
  );
};

export default Page;
