"use client";

import React from "react";
import Link from "@/app/_components/elements/Link";
import PageTitle from "@/app/_components/elements/PageTitle";
import dev from "@/app/_utils/devConsole";

const Page: React.FC = () => {
  dev.console.log("Hoge");
  return (
    <div>
      <PageTitle title="教員のトップページ" />
      <p>「教員」のためのトップページです。</p>

      <ul className="mt-4">
        <li>
          <Link href="/teacher/sessions" label="/teacher/sessions" />
        </li>
      </ul>
    </div>
  );
};

export default Page;
