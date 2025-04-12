const app = document.getElementById("app");
const menu_container = document.getElementById("menu-container");
const menu_button = document.getElementById("menu-btn")
const menuIcon = document.querySelector("#menu-btn img");
let menuOpen = false;

// menu creation
const routes = {
  about: "pages/about.html",
  explore: "pages/explore.html",
  films: "pages/films.html",
};
function layoutMenu(){ 
    if (document.querySelector("nav")) return;//dont want to add it twice
    menu_container.innerHTML += `
        <nav>  
            <a class = 'menu-link' href="#explore">Explore</a>
            <a class = 'menu-link' href="#films">Films</a>
            <div class="film-submenu">
                <label class = 'menu-link' ><input type="radio" name="film-select" value="film1"> Film 1</label>
                <label class = 'menu-link' ><input type="radio" name="film-select" value="film2"> Film 2</label>
                <label class = 'menu-link' ><input type="radio" name="film-select" value="film3"> Film 3</label>
            </div>

            <a class = 'menu-link about-link' href="#about">About</a>
        </nav>
        <div class='menu-obscure'></div>
        `;
   
}
layoutMenu();

//menu toggling
function showMenu() {

    menuOpen = true;
    document.getElementById("popup-container").className = "visible";
    menuIcon.src = "styles/icons/x.svg";
    menuAnimation();

}

function menuAnimation(){
    gsap.from(".menu-link", {
      x: -80,
      opacity: 0,
      duration: .5,
      stagger: 0.08,
      ease: "power4.inOUt",
    });
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
  page=page.toLowerCase()
  console.log("page selected", page);
  if (page === "explore") {
    console.log("explore page");
    initExplorePage(); 
  } else if (page === "about") {
    console.log("about page");
    initAboutPage();
  } else if (page =='films'){
    console.log('films page')
    initFilmsPage();
  }
  
}
function loadPage(page) {
  const route = routes[page] || routes.films;
  fetch(route)
    .then((res) => res.text())
    .then((html) => {
      app.innerHTML = html;
      requestAnimationFrame(() => {
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


