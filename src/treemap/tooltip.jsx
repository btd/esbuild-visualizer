import { useState, useRef, useEffect, useMemo } from "preact/hooks";
import { h, Fragment } from "preact";

import { format as formatBytes } from "bytes";

import { LABELS } from "../sizes.js";

const Tooltip = ({
  node,
  visible,
  root,
  sizeProperty,
  availableSizeProperties,
  importedByCache,
}) => {
  const ref = useRef();
  const [style, setStyle] = useState({});
  const content = useMemo(() => {
    if (!node) return null;

    const mainSize = node.originalValue[sizeProperty];

    const percentageNum = (100 * mainSize) / root.originalValue[sizeProperty];
    const percentage = percentageNum.toFixed(2);
    const percentageString = percentage + "%";

    const { id, name, isRoot } = node.data;

    const path = isRoot
      ? name
      : node
          .ancestors()
          .reverse()
          .map((d) => {
            if (d.data.isRoot) {
              return "";
            }
            return d.data.name;
          })
          .filter(Boolean)
          .join("/");

    return (
      <>
        <div>{path}</div>
        {availableSizeProperties.map((sizeProp) => {
          if (sizeProp === sizeProperty) {
            return (
              <div>
                <b>
                  {LABELS[sizeProp]}: {formatBytes(mainSize)}
                </b>{" "}
                ({percentageString})
              </div>
            );
          } else {
            return (
              <div>
                {LABELS[sizeProp]}: {formatBytes(node.originalValue[sizeProp])}
              </div>
            );
          }
        })}
        {id && importedByCache.has(id) && (
          <div>
            <div>
              <b>Imported By</b>:
            </div>
            {[...new Set(importedByCache.get(id).map(({ id }) => id))].map(
              (id) => (
                <div>{id}</div>
              )
            )}
          </div>
        )}
      </>
    );
  }, [node]);

  const updatePosition = (mouseCoords) => {
    const pos = {
      left: mouseCoords.x + Tooltip.marginX,
      top: mouseCoords.y + Tooltip.marginY,
    };

    const boundingRect = ref.current.getBoundingClientRect();

    if (pos.left + boundingRect.width > window.innerWidth) {
      // Shifting horizontally
      pos.left = window.innerWidth - boundingRect.width;
    }

    if (pos.top + boundingRect.height > window.innerHeight) {
      // Flipping vertically
      pos.top = mouseCoords.y - Tooltip.marginY - boundingRect.height;
    }

    setStyle(pos);
  };

  const handleMouseMove = (event) => {
    updatePosition({
      x: event.pageX,
      y: event.pageY,
    });
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove, true);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
    };
  }, []);

  return (
    <div
      class={`tooltip ${visible ? "" : "tooltip-hidden"}`}
      ref={ref}
      style={style}
    >
      {content}
    </div>
  );
};

Tooltip.marginX = 10;
Tooltip.marginY = 30;

export default Tooltip;
