import { h } from "preact";

import color from "../color";

const Node = ({
  node,
  onClick,
  isSelected,
  onNodeHover,
  path,
  highlighted,
}) => {
  return (
    <path
      d={path}
      fillRule="evenodd"
      stroke="#fff"
      fill={color(node)}
      strokeWidth={isSelected ? 3 : null}
      onClick={onClick}
      onMouseOver={(evt) => {
        evt.stopPropagation();
        onNodeHover(node);
      }}
      opacity={highlighted ? 1 : 0.3}
    />
  );
};

export default Node;
