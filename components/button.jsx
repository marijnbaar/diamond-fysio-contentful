const Button = ({ text, type = "primary", small, negative }) => {
  const btnClass = `btn-${type}${negative ? `--negative` : ""}${
    small ? `--small` : ""
  }`;
  let btnClass2;

  if (type == "primary") {
    if (negative) {
      if (small) {
        btnClass2 = "btn-primary--negative--small";
      } else {
        btnClass2 = "btn-primary--negative";
      }
    } else {
      if (small) {
        btnClass2 = "btn-primary--small";
      } else {
        btnClass2 = "btn-primary";
      }
    }
  }

  return <button className={btnClass2}>{text}</button>;
  //   return <button className="btn-primary">{text}</button>;
};

export default Button;
