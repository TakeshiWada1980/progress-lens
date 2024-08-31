import React, { ReactNode } from "react";
import Header from "./Header";

interface Props {
  children: ReactNode;
}

const BaseLayout: React.FC<Props> = (props) => {
  return (
    <div>
      <Header />
      {/* <main className="mx-auto sm:container md:w-2/3 xl:w-1/2"> */}
      <main className="mx-auto mt-14 w-full max-w-2xl px-5 md:px-0">
        <div className="relative pt-6 md:px-4">
          <div>{props.children}</div>
        </div>
      </main>
    </div>
  );
};

export default BaseLayout;
