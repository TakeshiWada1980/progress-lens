"use client";

import React from "react";
import { Suspense } from "react";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = (props) => {
  const { children } = props;
  return <Suspense>{children}</Suspense>;
};

export default Layout;
