import * as React from "react";

function IconStatusCircle({ size = 24, color = "currentColor", ...props }) {
  return (
    <svg
      className={props.className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="6.85714" fill={color} />
    </svg>
  );
}

export default IconStatusCircle;