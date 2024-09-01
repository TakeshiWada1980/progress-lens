import { twMerge } from "tailwind-merge";

interface Props {
  children?: React.ReactNode;
  title?: string;
  className?: string;
}

const PageTitle: React.FC<Props> = (props) => {
  const { children, title, className } = props;

  return (
    <h1 className={twMerge("text-2xl font-bold", className)}>
      {children}
      {title}
    </h1>
  );
};

export default PageTitle;
