const menu = document.querySelector("#site-menu");
const openButtons = document.querySelectorAll("[data-open-menu]");
const closeButton = document.querySelector("#menu-close");
const toast = document.querySelector("#toast");
const heroMedia = document.querySelector(".hero-media");
const heroVideo = document.querySelector("#hero-video");
const contentPage = document.querySelector("#content-page");
const pagePanels = document.querySelectorAll("[data-page-panel]");
const pageLinks = document.querySelectorAll("[data-page-link]");
const subVisualTitle = document.querySelector("#sub-visual-title");
const subVisualCurrent = document.querySelector("#sub-visual-current");
const contentTitle = document.querySelector("#content-title");
const contentCurrent = document.querySelector("#content-current");
const principleTabs = document.querySelectorAll("[data-principle-tab]");
const principleTitle = document.querySelector("[data-principle-title]");
const principleBody = document.querySelector("[data-principle-body]");

let lastFocusedElement = null;
let toastTimer = null;

const pageMeta = {
  chairperson: "위원장 소개",
  organization: "조직도",
};

const principleCopy = {
  declaration: {
    title: "선 언",
    body: `
      <p>
        한국국토정보공사노동조합 조합원 일동은 민주화의 도도한 흐름과 호흡을 함께 하면서
        진정한 동지애로 강철같이 단결하여 어떠한 형태의 부당한 탄압이나 간섭에도 굴하지 않고
        자주적이고 민주적인 조합을 운영함으로써, 우리 자신의 노동권을 확립하여 정치적, 경제적,
        사회적, 지위향상을 기한다.
      </p>
      <p>
        우리는 공사내의 전근대적 비민주성을 척결하고 우리 자신의 창발성을 최대한 발휘하여
        국토정보의 발전에 노력하며 나아가 전문기술의 민족적 자립기반을 확립하고 사회공공성 강화에 이바지한다.
      </p>
      <p>
        우리는 민주적인 모든 노동단체와의 연대강화를 통하여 노동운동의 정통성과 자주성을 지키며
        결연한 단결력으로 민주복지국가 건설에 동참할 것을 엄숙히 선언한다.
      </p>
      <p class="principle-date">2015년 6월 4일<br />한국국토정보공사노동조합</p>
    `,
  },
  platform: {
    title: "강 령",
    body: `
      <p><strong>한국국토정보공사노동조합</strong></p>
      <p>
        1. 강철같이 단결하여 노동권을 확립하고 노동 조건 개선의 역군이 된다.<br />
        2. 건설적인 노사관계를 정립하여 자주적이고 민주적인 노동조합을 운영한다.<br />
        3. 공사의 경영자율과 민주화를 기함으로써 우리 자신의 능력과 창발성을 최대한 발휘한다.<br />
        4. 노동자의 인간적 삶의 향상을 위해 공공성을 강화하고 평등사회 구현을 위해 노력한다.<br />
        5. 전체 노동자의 정치, 사회, 경제, 문화적 지위 향상 운동에 적극 동참하며 국민 경제 발전에 적극 참여한다.
      </p>
    `,
  },
};

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
  const pageTitle = pageMeta[pageName];

  if (!pageTitle) {
    showToast();
    return;
  }

  closeMenu({ restoreFocus: false });
  contentPage.hidden = false;
  document.body.classList.add("is-subpage");
  contentPage.setAttribute("aria-label", pageTitle);
  subVisualTitle.textContent = pageTitle;
  subVisualCurrent.textContent = pageTitle;
  contentTitle.textContent = pageTitle;
  contentCurrent.textContent = pageTitle;

  pagePanels.forEach((panel) => {
    panel.hidden = panel.dataset.pagePanel !== pageName;
  });

  pageLinks.forEach((link) => {
    const isCurrentPage = link.dataset.pageLink === pageName;
    const isIntroSectionLink = link.closest(".sub-nav") && link.dataset.pageLink === "chairperson";

    link.classList.toggle("is-active", isCurrentPage || isIntroSectionLink);
    if (isCurrentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setPrinciple(name) {
  const selected = principleCopy[name];

  if (!selected) {
    return;
  }

  principleTabs.forEach((tab) => {
    const isSelected = tab.dataset.principleTab === name;
    tab.classList.toggle("is-active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
  });

  principleTitle.textContent = selected.title;
  principleBody.innerHTML = selected.body;
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

principleTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setPrinciple(tab.dataset.principleTab);
  });
});

heroVideo.addEventListener("playing", () => {
  heroMedia.classList.add("is-playing");
});

heroVideo.addEventListener("pause", () => {
  heroMedia.classList.remove("is-playing");
});
