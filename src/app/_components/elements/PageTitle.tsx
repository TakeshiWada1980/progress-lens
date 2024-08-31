interface Props {
  children?: React.ReactNode;
  title?: string;
}

const Link: React.FC<Props> = (props) => {
  const { children, title } = props;

  return (
    <h1 className="text-2xl font-bold">
      {children}
      {title}
    </h1>
  );
};

export default Link;
