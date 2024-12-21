import { OptionEditableFields } from "@/app/_types/SessionTypes";

type OptionEditableFieldsWithoutViewId = Omit<OptionEditableFields, "viewId">;

export const removeViewIdFromOptionEditableFields = ({
  viewId,
  ...rest
}: OptionEditableFields): OptionEditableFieldsWithoutViewId => rest;

export const removeViewIdFromQuestionEditableFields = (obj: any): any => {
  const newObj = { ...obj };
  delete newObj.viewId;
  if (newObj.options) {
    newObj.options = newObj.options.map((option: any) => {
      const newOption = { ...option };
      delete newOption.viewId;
      return newOption;
    });
  }
  return newObj;
};

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export function findAndLogDifferences(prevStr: string, nextStr: string): void {
  const prev: JSONValue = JSON.parse(prevStr);
  const next: JSONValue = JSON.parse(nextStr);

  function compareObjects(
    obj1: JSONValue,
    obj2: JSONValue,
    path: string = ""
  ): void {
    if (
      typeof obj1 !== "object" ||
      typeof obj2 !== "object" ||
      obj1 === null ||
      obj2 === null
    ) {
      if (obj1 !== obj2) {
        console.log(`${path} が変更されました: ${obj1} -> ${obj2}`);
      }
      return;
    }

    const keys1 = Object.keys(obj1 as object);
    const keys2 = Object.keys(obj2 as object);

    for (const key of keys1) {
      if (!(key in (obj2 as object))) {
        console.log(`${path}${key} が削除されました`);
      } else {
        compareObjects(
          (obj1 as { [key: string]: JSONValue })[key],
          (obj2 as { [key: string]: JSONValue })[key],
          `${path}${key}.`
        );
      }
    }

    for (const key of keys2) {
      if (!(key in (obj1 as object))) {
        console.log(
          `${path}${key} が追加されました: ${
            (obj2 as { [key: string]: JSONValue })[key]
          }`
        );
      }
    }
  }

  compareObjects(prev, next);
}
