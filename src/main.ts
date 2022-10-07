import "./style.css";
import urls from "./urls.json";

/**
 * Helpers
 */

const createElem = (tag: string) => document.createElement(tag);

const navigateTo = (url: string) => window.history.pushState(null, "", url);

const isCurrent = (url: string) => window.location.pathname === url;

/**
 * Selectors
 */
const menuElem = document.querySelector<HTMLUListElement>(".menu")!;

const updateIframe = (src: string, container: HTMLElement) => {
  const prevFrame = container.querySelector("iframe");
  prevFrame!.contentWindow!.onload = () => prevFrame?.contentWindow?.focus();

  if (!prevFrame) {
    const frame = document.createElement("iframe");
    frame.src = src;
    container.append(frame);
  } else {
    prevFrame.src = src;
  }
};

const loadCurrentUrl = (url?: string) => {
  url = url ? `/src${url}` : "/src/practice-app";

  updateIframe(url, document.body);
  setupMenu(urls);
};

const setupMenu = (urls: string[][]) => {
  menuElem.querySelectorAll("li").forEach(li => li.remove());

  urls.forEach(([url, name]) => {
    const li = createElem("li") as HTMLUListElement;
    const a = createElem("a") as HTMLAnchorElement;

    if (isCurrent(url)) {
      a.innerText = "=> " + name;
    } else {
      a.innerText = name;
      a.href = "#";
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
