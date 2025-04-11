const app = document.getElementById("app");
const menu_container = document.getElementById("menu-container");
const menu_button = document.getElementById("menu-btn")
const menuIcon = document.querySelector("#menu-btn img");
let menuOpen = false;

// menu creation
const routes = {
  about: "pages/about.html",
  explore: "pages/explore.html",
};
function createMenu(){ //only do this once
menu_container.innerHTML += `
    <nav>
        <a class = 'menu-link' href="#explore">Explore</a>
        <a class = 'menu-link' href="#about">About</a>
        
    </nav>
    `;
}
createMenu();

//menu toggling
function showMenu() {
    menuOpen = true;
    document.getElementById("popup-container").className = "visible";
    menuIcon.src = "styles/icons/x.svg";

}
function hideMenu() {
    menuOpen= false
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
function runPageScripts(page) {
  if (page === "explore") {
    initExplorePage(); 
  } else if (page === "about") {
    // initAboutPage();
  }
}
function loadPage(page) {
  const route = routes[page] || routes.home;
  fetch(route)
    .then((res) => res.text())
    .then((html) => {
      app.innerHTML = html;
      requestAnimationFrame(() => {
        console.log(d3.select("#explore-page"))
        runPageScripts(page);
      });
    })
    .catch((e) => {
        console.log(e)
      app.innerHTML = "<h2>Page not found</h2>";
    });
   
}

function handleRouteChange() {
  let hash = window.location.hash.slice(1);
  if (!hash) hash = "explore"; 
  loadPage(hash);
}

menu_container.addEventListener("click", (e) => {
  if (e.target.classList.contains("menu-link")) {
    hideMenu();
    menuOpen = false;
  }
});


