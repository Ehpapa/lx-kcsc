const menu = document.querySelector("#site-menu");
const openButtons = document.querySelectorAll("[data-open-menu]");
const closeButton = document.querySelector("#menu-close");
const toast = document.querySelector("#toast");
const heroMedia = document.querySelector(".hero-media");
const heroVideo = document.querySelector("#hero-video");
const contentPage = document.querySelector("#content-page");

let lastFocusedElement = null;
let toastTimer = null;

function setMenuExpanded(isExpanded) {
  openButtons.forEach((button) => {
    button.setAttribute("aria-expanded", String(isExpanded));
  });
}

function openMenu(trigger = document.activeElement) {
  lastFocusedElement = trigger;
  menu.classList.add("is-open");
  menu.setAttribute("aria-hidden", "false");
  setMenuExpanded(true);
  document.body.classList.add("is-menu-open");
  closeButton.focus();
}

function closeMenu({ restoreFocus = true } = {}) {
  if (!menu.classList.contains("is-open")) {
    return;
  }

  menu.classList.remove("is-open");
  menu.setAttribute("aria-hidden", "true");
  setMenuExpanded(false);
  document.body.classList.remove("is-menu-open");

  if (restoreFocus) {
    window.setTimeout(() => {
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }, 340);
  }
}

function showToast(message = "세부 페이지는 준비 중입니다.") {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function showHome() {
  closeMenu({ restoreFocus: false });
  contentPage.hidden = true;
  document.body.classList.remove("is-subpage");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showSubPage(pageName) {
  if (pageName !== "chairperson") {
    showToast();
    return;
  }

  closeMenu({ restoreFocus: false });
  contentPage.hidden = false;
  document.body.classList.add("is-subpage");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

openButtons.forEach((button) => {
  button.addEventListener("click", () => openMenu(button));
});
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

document.querySelectorAll("[data-page-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showSubPage(link.dataset.pageLink);
  });
});

document.querySelectorAll("[data-home]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showHome();
  });
});

heroVideo.addEventListener("playing", () => {
  heroMedia.classList.add("is-playing");
});

heroVideo.addEventListener("pause", () => {
  heroMedia.classList.remove("is-playing");
});
