import { useState, useEffect, useCallback } from "react";
import * as Dnd from "@dnd-kit/core";

// order プロパティを持つことを保証するためのインターフェース
interface WithOrder {
  order: number;
}

const useDnd = <C, E extends WithOrder>(container: C, elements: E[]) => {
  const [activeId, setActiveId] = useState<Dnd.UniqueIdentifier | null>(null);
  const [vmElements, setVmElements] = useState<E[]>();
  useEffect(() => {
    const vmElements = elements
      .slice() // option の浅いコピーを作成
      .sort((a, b) => a.order - b.order)
      .map<E>((element, index) => {
        return {
          ...element,
          viewId: index + 1,
        };
      });
    setVmElements(vmElements);
  }, [elements, container]);

  const dragStartAction = useCallback((e: Dnd.DragStartEvent) => {
    setActiveId(e.active.id);
  }, []);

  const sensors = Dnd.useSensors(
    Dnd.useSensor(Dnd.MouseSensor),
    Dnd.useSensor(Dnd.TouchSensor)
  );

  return {
    activeId,
    setActiveId,
    vmElements,
    setVmElements,
    dragStartAction,
    sensors,
  };
};

export default useDnd;
