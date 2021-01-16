import { h, Fragment } from "preact";
import { useMemo } from "preact/hooks";

import { format as formatBytes } from "bytes";

import { LABELS } from "../sizes.js";

const Tooltip = ({ node, root, sizeProperty, availableSizeProperties }) => {
  const content = useMemo(() => {
    if (!node) return null;

    const mainSize = node.originalValue[sizeProperty];

    const percentageNum = (100 * mainSize) / root.originalValue[sizeProperty];
    const percentage = percentageNum.toFixed(2);
    const percentageString = percentage + "%";

    return (
      <>
        <div className="details-name">{node.data.name}</div>
        <div className="details-percentage">{percentageString}</div>
        {availableSizeProperties.map((sizeProp) => {
          if (sizeProp === sizeProperty) {
            return (
              <div className="details-size">
                <b>
                  {LABELS[sizeProp]}:{" "}
                  {formatBytes(node.originalValue[sizeProp])}
                </b>
              </div>
            );
          } else {
            return (
              <div className="details-size">
                {LABELS[sizeProp]}: {formatBytes(node.originalValue[sizeProp])}
              </div>
            );
          }
        })}
      </>
    );
  }, [node]);

  return <div className="details">{content}</div>;
};

export default Tooltip;
