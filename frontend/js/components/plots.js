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

//   //one value per scene: tempo, energy_avg, amplitude_avg
//   oneValPerScenePlot(dashboard, "energy_avg", dash_width, 100);
//   oneValPerScenePlot(dashboard, "amplitude_avg", dash_width, 100);
//   oneValPerScenePlot(dashboard, "tempo", dash_width, 100);

//   //all the inner values: energy, spectral_centroid, zcr
//   // allValsPerScenePlot(dashboard, "energy", dash_width, 100);
//   allValsPerScenePlot(dashboard, "spectral_centroid", dash_width, 100);
//   allValsPerScenePlot(dashboard, "zcr", dash_width, 100);

  dynamicPlot(dashboard, "spectral_centroid", dash_width, 150, sceneNum);
//   dynamicPlot(dashboard, "zcr", dash_width, 150, sceneNum);
}

