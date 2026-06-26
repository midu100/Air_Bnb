import React from "react";

const ButtonOne = ({name,onClick}) => {
  return (
    <div>
      <button onClick={onClick} class="button">
        <span class="button-content">{name} </span>
      </button>
    </div>
  );
};

export default ButtonOne;
