"use client";
import React from "react";
import Link from "@/app/_components/elements/Link";
import PageTitle from "@/app/_components/elements/PageTitle";
import { appName } from "@/config/app-config";

const Home: React.FC = () => {
  return (
    <div>
      <PageTitle
        title={`Visualize and Share Your Progress with ${appName}`}
        className="text-xl"
      />
      <ul>
        <li>
          <Link href="/signup" label="/signup" />
        </li>
        <li>
          <Link href="/login" label="/login" />
        </li>
        <li>
          <Link href="/user/profile" label="/user/profile" />
          &nbsp;(Login required)
        </li>
      </ul>
    </div>
  );
};

export default Home;
