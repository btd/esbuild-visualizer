import { h, render } from "preact";

import Main from "./main.jsx";

import "../style/style-sunburst.scss";

const drawChart = (parentNode, data, width, height) => {
  render(<Main data={data} width={width} height={height} />, parentNode);
};

export default drawChart;
