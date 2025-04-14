const plotPadding = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
};

function layoutPlots(sceneNum) {
  const dashboard = d3.select(".plots-container")
  dashboard.selectAll("*").remove()
  const dash_node = dashboard.node().getBoundingClientRect();
  const dash_width = dash_node.width;
  const dash_height = dash_node.height;

  const hoverLinePlot = dynamicPlot(
    dashboard,
    "spectral_centroid",
    dash_width,
    dash_height/2,
    sceneNum
  );
  showNotes(dashboard, dash_width, dash_height / 3, sceneNum, hoverLinePlot);
  

//   dynamicPlot(dashboard, "zcr", dash_width, 150, sceneNum);
}

