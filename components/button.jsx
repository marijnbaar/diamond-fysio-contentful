const Button = ({ text, type = "primary", small, negative }) => {
  const btnClass = `btn-${type}${negative ? `--negative` : ""}${
    small ? `--small` : ""
  }`;

  return <button className={btnClass}>{text}</button>;
};

export default Button;
