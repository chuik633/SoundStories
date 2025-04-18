function initFilmsPage(movieName, sceneNum) {
  const container = d3.select("#films-page");
  console.log("movie", movieName);
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

// so whenever i change the displayed video right now i am jsut replacing
//the origional video...
//if i have link i want it to link to a page to open
//if load page has a set up page scrip
//i also want an option for if it has no dashboard and is just preview...
