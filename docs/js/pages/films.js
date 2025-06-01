function initFilmsPage(movieName, sceneNum) {
  console.log("----------------FILMS PAGE");
  console.log("movie", movieName);
  movieName = movieName.toUpperCase();
  console.log("data", data);
  const container = d3.select("#films-page");

  const loaded = document.getElementById("films-page");
  if (!loaded) {
    console.log("not loaded");
    return;
  }
  console.log("loading page for,", movieName);

  if (sceneNum) {
    layoutDashboardAndPreview(container, movieName, sceneNum, false);
  } else {
    layoutDashboardAndPreview(container, movieName, 0, true);
  }
  createBackButton(container);
}
