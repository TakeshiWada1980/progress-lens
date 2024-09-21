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
