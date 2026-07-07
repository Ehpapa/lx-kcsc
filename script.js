const menu = document.querySelector("#site-menu");
const openButton = document.querySelector("#menu-open");
const closeButton = document.querySelector("#menu-close");
const toast = document.querySelector("#toast");
const heroMedia = document.querySelector(".hero-media");
const heroVideo = document.querySelector("#hero-video");

let lastFocusedElement = null;
let toastTimer = null;

function openMenu() {
  lastFocusedElement = document.activeElement;
  menu.classList.add("is-open");
  menu.setAttribute("aria-hidden", "false");
  openButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("is-menu-open");
  closeButton.focus();
}

function closeMenu() {
  menu.classList.remove("is-open");
  menu.setAttribute("aria-hidden", "true");
  openButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("is-menu-open");

  window.setTimeout(() => {
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }, 340);
}

function showToast(message = "세부 페이지는 준비 중입니다.") {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

openButton.addEventListener("click", openMenu);
closeButton.addEventListener("click", closeMenu);

document.addEventListener("keydown", (event) => {
  if (!menu.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeMenu();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = [
    ...menu.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.offsetParent !== null);

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

document.querySelectorAll("[data-placeholder]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showToast();
  });
});

heroVideo.addEventListener("playing", () => {
  heroMedia.classList.add("is-playing");
});

heroVideo.addEventListener("pause", () => {
  heroMedia.classList.remove("is-playing");
});
