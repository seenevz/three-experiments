import "./style.css";
import urls from "./urls.json";

/**
 * Helpers
 */
const defaultUrl = urls[4][0];
console.log(defaultUrl);

const createElem = (tag: string) => document.createElement(tag);

const navigateTo = (url: string) => window.history.pushState(null, "", url);

const isCurrent = (url: string) => window.location.pathname.includes(url);

const isValidPath = () =>
  urls.reduce(
    (isValid, [url, _]) => isValid || url === window.location.pathname.replaceAll("/", ""),
    false
  ) || window.location.pathname === "/";

/**
 * Selectors
 */
const menuElem = document.querySelector<HTMLUListElement>(".menu")!;
const prevFrame = document.querySelector("iframe")!;

const updateIframe = (src: string) => {
  src = src.endsWith("/") ? src : src + "/";

  prevFrame.src = src;
};

const display404 = () => {
  document.body.innerHTML = `
    <h1 style="text-align:center;line-height: 100vh;margin: 0;">Woops, that doesn't look right...</h1>
  `;
};

const loadCurrentUrl = (url?: string) => {
  url = url === "/" ? `/src/${defaultUrl}` : `/src${url}`;

  if (isValidPath()) updateIframe(url);
  else display404();
};

const setupMenu = (urls: string[][]) => {
  menuElem.querySelectorAll("li").forEach(li => li.remove());

  urls.forEach(([url, name]) => {
    const li = createElem("li") as HTMLUListElement;
    const a = createElem("a") as HTMLAnchorElement;

    url = url.startsWith("/") ? url : "/" + url;

    if (isCurrent(url)) {
      a.innerText = "=> " + name;
    } else {
      a.innerText = name;
      a.href = "";
      a.addEventListener("click", () => navigateTo(url));
    }

    li.append(a);
    menuElem.append(li);
  });
};

const toggleMenu = (_ev: Event, menuElem: HTMLUListElement) => {
  const className = "open-menu";
  const isOpen = Boolean(menuElem.classList.contains(className));

  if (isOpen) {
    document.querySelector("html")?.style.setProperty("--sign", '">"');
    menuElem.classList.remove(className);
  } else {
    document.querySelector("html")?.style.setProperty("--sign", '"<"');
    menuElem.classList.add(className);
  }
};

menuElem.addEventListener("click", ev => toggleMenu(ev, menuElem));
window.addEventListener("popstate", () => loadCurrentUrl(window.location.pathname));
window.addEventListener("DOMContentLoaded", () => loadCurrentUrl(window.location.pathname));
setupMenu(urls);
