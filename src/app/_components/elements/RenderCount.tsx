import React from "react";

interface Props {
  renderCount: number;
}

export const RenderCount: React.FC<Props> = ({ renderCount }) => {
  return (
    <div className="text-xs font-bold text-rose-400">
      ■ Render count: {renderCount}
    </div>
  );
};
