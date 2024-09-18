export type Question = {
  id: string;
  title: string;
  options: Option[];
  defaultOptionId?: string;
  compareKey?: string;
};

export type Option = {
  id: string;
  questionId: string;
  title: string;
  compareKey?: string;
};

export interface EditSessionActions {
  updateQuestionTitle: (id: string, title: string) => Promise<void>;
  updateOptionTitle: (id: string, title: string) => Promise<void>;
  changeDefaultOption: (questionId: string, optionId: string) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addQuestion: () => Promise<void>;
}
