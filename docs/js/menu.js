const app = document.getElementById("app");
const menu_container = document.getElementById("menu-container");
const menu_button = document.getElementById("menu-btn");
const menuIcon = document.querySelector("#menu-btn img");
let menuOpen = false;
const startingPage = "explore";

// menu creation
const routes = {
  about: "pages/about.html",
  explore: "pages/explore.html",
  experiment: "pages/experiment.html",
  films: "pages/films.html",
};
function layoutMenu() {
  if (document.querySelector("nav")) return; //dont want to add it twice
  menu_container.innerHTML += `
        <nav>  
            <a class = 'menu-link' href="#explore">Scenes</a>
           
            <a class = 'menu-link' href="#films">Films</a>
            <div class="film-submenu">
              
              </div>

             <a class = 'menu-link' href="#experiment">TRY IT</a>

            <a class = 'menu-link about-link' href="#about">About</a>
        </nav>
        <div class='menu-obscure'></div>
        `;

  const filmLinks = d3.select(".film-submenu");
  for (const movie of movies) {
    filmLinks
      .append("a")
      .attr("class", "menu-link")
      .attr("href", `#films/${movie}`)
      .text(movie);
  }
}
layoutMenu();

//menu toggling
function showMenu() {
  menuOpen = true;
  document.getElementById("popup-container").className = "visible";
  menuIcon.src = "styles/icons/x.svg";
  menuAnimation();
}

function menuAnimation() {
  gsap.from(".menu-link", {
    x: -80,
    opacity: 0,
    duration: 0.5,
    stagger: 0.08,
    ease: "power4.inOUt",
  });
}
function hideMenu() {
  menuOpen = false;
  document.getElementById("popup-container").className = "hidden";
  menuIcon.src = "styles/icons/menu.svg";
}

document.getElementById("menu-btn").addEventListener("click", () => {
  if (!menuOpen) {
    showMenu();
  } else {
    hideMenu();
  }
});

//routing
function runPageScripts(page, movieName, sceneNum) {
  page = page.toLowerCase();
  console.log("page selected", page, movieName, sceneNum);
  if (page === "explore") {
    console.log("explore page");
    initExplorePage();
  } else if (page === "about") {
    console.log("about page");
    initAboutPage();
  } else if (page == "films") {
    if (movieName) {
      initFilmsPage(movieName, sceneNum);
    } else {
      initFilmsPage("princessSmall", 0);
    }
  } else if (page == "experiment") {
    initExperimentPage();
  }
}
function loadPage(page, movieName, sceneNum) {
  const route = routes[page] || routes.explore;
  fetch(route)
    .then((res) => res.text())
    .then((html) => {
      app.innerHTML = html;
      console.log("loaded page");
      requestAnimationFrame(() => {
        runPageScripts(page, movieName, sceneNum);
      });
    })
    .catch((e) => {
      console.log(e);
      app.innerHTML = "<h2>Page not found</h2>";
    });
}

function handleRouteChange() {
  let hash = window.location.hash.slice(1);
  if (!hash) hash = startingPage;
  console.log("hash", hash);
  const [page, movieName, sceneNum] = hash.split("/");
  loadPage(page, movieName, sceneNum);
}

menu_container.addEventListener("click", (e) => {
  if (e.target.classList.contains("menu-link")) {
    hideMenu();
    menuOpen = false;
  }
});
