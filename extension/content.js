(function () {
  const configAppUrl =
    globalThis.MY_STUDENT_LIFE_CONFIG?.appUrl || "http://localhost:3000/";

  const selectors = {
    primaryNav: "#asu-header-nav .navlist",
    utilityNav: ".universal-nav .nav-grid",
    loginStatus: ".universal-nav .nav-grid .login-status",
    userName: ".universal-nav .nav-grid .login-status .name, .user-name",
    userInfoButton: "#user-info-popup",
  };

  const markers = {
    myStudentLife: "data-my-student-life-link",
    dashboard: "data-my-student-life-dashboard",
    rewardsButton: "data-my-student-life-rewards",
    sparkyRoot: "data-my-student-life-sparky",
    sparkyStyle: "data-my-student-life-style",
  };

  const state = {
    sparkyOpen: false,
  };

  function getAppBaseUrl() {
    try {
      return new URL(configAppUrl);
    } catch (error) {
      console.warn("[My Student Life] Invalid appUrl:", configAppUrl, error);
      return null;
    }
  }

  const appBaseUrl = getAppBaseUrl();

  if (!appBaseUrl) {
    return;
  }

  const urls = {
    app: appBaseUrl.toString(),
    simulate: new URL("/simulate", appBaseUrl).toString(),
    dashboard: new URL("/dashboard", appBaseUrl).toString(),
    rewards: new URL("/rewards", appBaseUrl).toString(),
    chat: new URL("/chat", appBaseUrl).toString(),
    chatEmbed: new URL("/chat/embed", appBaseUrl).toString(),
    mascot: new URL("/mascot/happy.png", appBaseUrl).toString(),
  };
  const canEmbedChat = appBaseUrl.protocol === "https:";
  const defaultRewardsUserName = "Chirag";
  const defaultRewardsSignOutUrl = "https://webapp4.asu.edu/myasu/Signout";

  function assignLocation(url) {
    window.location.assign(url);
  }

  function openNewTab(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function takeTextContent(node) {
    return node?.textContent?.trim() || "";
  }

  function getRewardsDestinationUrl() {
    const destination = new URL(urls.rewards);
    const loginStatus = document.querySelector(selectors.loginStatus);
    const nameElement = loginStatus?.querySelector(".name");
    const signOutLink = loginStatus?.querySelector(".signout");

    const userName = takeTextContent(nameElement) || defaultRewardsUserName;
    const signOutUrl = signOutLink?.getAttribute("href")?.trim() || defaultRewardsSignOutUrl;

    destination.searchParams.set("myasuName", userName);
    destination.searchParams.set("signoutUrl", signOutUrl);

    return destination.toString();
  }

  function ensureStyles() {
    if (document.head.querySelector(`[${markers.sparkyStyle}="true"]`)) {
      return;
    }

    const style = document.createElement("style");
    style.setAttribute(markers.sparkyStyle, "true");
    style.textContent = `
      .msl-rewards-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        margin-left: 0.55rem;
        border: 1px solid rgba(140, 29, 64, 0.16);
        border-radius: 999px;
        background: #fff;
        color: #8c1d40;
        cursor: pointer;
        transition: border-color 180ms ease, background-color 180ms ease, transform 180ms ease;
      }

      .msl-rewards-link:hover,
      .msl-rewards-link:focus-visible {
        border-color: rgba(255, 198, 39, 0.96);
        background: rgba(255, 198, 39, 0.12);
        transform: translateY(-1px);
      }

      .msl-utility-link {
        white-space: nowrap;
      }

      .msl-sparky-launcher {
        position: fixed;
        right: 1.25rem;
        bottom: 1.25rem;
        z-index: 2147483646;
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.98);
        color: #191919;
        padding: 0.8rem 1rem 0.8rem 0.85rem;
        box-shadow: 0 20px 60px rgba(16, 11, 7, 0.22);
        cursor: pointer;
        transition: transform 180ms ease, border-color 180ms ease, background-color 180ms ease;
      }

      .msl-sparky-launcher:hover,
      .msl-sparky-launcher:focus-visible {
        transform: translateY(-1px);
        border-color: rgba(255, 198, 39, 0.96);
        background: #fff;
      }

      .msl-sparky-avatar-wrap {
        position: relative;
        width: 3rem;
        height: 3rem;
        overflow: hidden;
        border: 1px solid rgba(140, 29, 64, 0.12);
        border-radius: 999px;
        background: radial-gradient(circle at 35% 30%, rgba(255, 198, 39, 0.28), rgba(255, 255, 255, 0.98));
      }

      .msl-sparky-avatar {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 0.2rem;
      }

      .msl-sparky-label {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-width: 0;
      }

      .msl-sparky-kicker {
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: #8c1d40;
      }

      .msl-sparky-title {
        font-size: 0.95rem;
        line-height: 1.2;
      }

      .msl-sparky-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483645;
        background: rgba(17, 12, 8, 0.28);
        backdrop-filter: blur(2px);
      }

      .msl-sparky-panel {
        position: fixed;
        right: 1.25rem;
        bottom: 6rem;
        z-index: 2147483646;
        display: flex;
        flex-direction: column;
        width: min(26rem, calc(100vw - 2rem));
        height: min(44rem, calc(100vh - 8rem));
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 1.7rem;
        background: rgba(249, 243, 234, 0.98);
        box-shadow: 0 28px 80px rgba(18, 12, 8, 0.28);
      }

      .msl-sparky-panel[hidden],
      .msl-sparky-backdrop[hidden] {
        display: none;
      }

      .msl-sparky-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        border-bottom: 1px solid rgba(140, 29, 64, 0.12);
        background: rgba(255, 255, 255, 0.86);
        padding: 0.95rem 1rem;
      }

      .msl-sparky-header-copy {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        min-width: 0;
      }

      .msl-sparky-panel-title {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #8c1d40;
      }

      .msl-sparky-panel-subtitle {
        margin: 0.2rem 0 0;
        font-size: 0.9rem;
        line-height: 1.4;
        color: rgba(25, 25, 25, 0.78);
      }

      .msl-sparky-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 999px;
        background: #fff;
        color: #191919;
        font-size: 1.2rem;
        cursor: pointer;
      }

      .msl-sparky-close:hover,
      .msl-sparky-close:focus-visible {
        border-color: rgba(255, 198, 39, 0.96);
        background: rgba(255, 198, 39, 0.12);
      }

      .msl-sparky-frame {
        flex: 1;
        width: 100%;
        border: 0;
        background: #fff;
      }

      .msl-sparky-fallback {
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 1rem;
        padding: 1.35rem;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(249, 243, 234, 0.98)),
          #fff;
      }

      .msl-sparky-fallback p {
        margin: 0;
        color: rgba(25, 25, 25, 0.8);
        font-size: 0.95rem;
        line-height: 1.6;
      }

      .msl-sparky-fallback-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        border: 0;
        border-radius: 999px;
        background: #8c1d40;
        color: #fffefc;
        padding: 0.85rem 1.2rem;
        font-size: 0.94rem;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
      }

      .msl-sparky-fallback-link:hover,
      .msl-sparky-fallback-link:focus-visible {
        background: #5e1030;
      }

      @media (max-width: 640px) {
        .msl-sparky-launcher {
          right: 0.75rem;
          bottom: 0.75rem;
          padding-right: 0.9rem;
        }

        .msl-sparky-panel {
          right: 0.75rem;
          left: 0.75rem;
          bottom: 5.5rem;
          width: auto;
          height: min(42rem, calc(100vh - 7rem));
        }

        .msl-sparky-label {
          display: none;
        }
      }
    `;

    document.head.append(style);
  }

  function buildRewardsIcon() {
    return `
      <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M7 4.75h10a1.25 1.25 0 0 1 1.25 1.25v2.4a3.7 3.7 0 0 1-2.55 3.52L13.25 12.7v4.1l1.82.82a.8.8 0 0 1-.33 1.53H9.26a.8.8 0 0 1-.33-1.53l1.82-.82v-4.1l-2.45-.78A3.7 3.7 0 0 1 5.75 8.4V6A1.25 1.25 0 0 1 7 4.75Z" fill="currentColor"/>
        <path d="M5.75 6.75H4.8A1.8 1.8 0 0 0 3 8.55v.15a3.3 3.3 0 0 0 2.75 3.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M18.25 6.75h.95A1.8 1.8 0 0 1 21 8.55v.15a3.3 3.3 0 0 1-2.75 3.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;
  }

  function buildPrimaryNavItem() {
    const item = document.createElement("li");
    item.className = "navlink";
    item.setAttribute(markers.myStudentLife, "true");

    const link = document.createElement("a");
    link.className = "nav-item";
    link.href = urls.simulate;
    link.textContent = "My Student Life";
    link.setAttribute("data-tracking", "my-student-life");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      assignLocation(urls.simulate);
    });

    item.append(link);
    return item;
  }

  function injectPrimaryNavLink() {
    const navList = document.querySelector(selectors.primaryNav);

    if (!navList || navList.querySelector(`[${markers.myStudentLife}="true"]`)) {
      return;
    }

    const alreadyPresent = Array.from(navList.querySelectorAll("a.nav-item")).some((anchor) => {
      return anchor.textContent?.trim() === "My Student Life" || anchor.getAttribute("href") === urls.simulate;
    });

    if (!alreadyPresent) {
      navList.append(buildPrimaryNavItem());
    }
  }

  function injectDashboardLink() {
    const utilityNav = document.querySelector(selectors.utilityNav);
    const loginStatus = document.querySelector(selectors.loginStatus);

    if (
      !utilityNav ||
      !loginStatus ||
      utilityNav.querySelector(`[${markers.dashboard}="true"]`)
    ) {
      return;
    }

    const alreadyPresent = Array.from(utilityNav.querySelectorAll("a")).some((anchor) => {
      return anchor.textContent?.trim() === "Dashboard" || anchor.getAttribute("href") === urls.dashboard;
    });

    if (alreadyPresent) {
      return;
    }

    const link = document.createElement("a");
    link.href = urls.dashboard;
    link.textContent = "Dashboard";
    link.className = "msl-utility-link";
    link.setAttribute(markers.dashboard, "true");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      assignLocation(urls.dashboard);
    });

    utilityNav.insertBefore(link, loginStatus);
  }

  function injectRewardsButton() {
    const userName = document.querySelector(selectors.userName);

    if (!userName || document.querySelector(`[${markers.rewardsButton}="true"]`)) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "msl-rewards-link";
    button.setAttribute(markers.rewardsButton, "true");
    button.setAttribute("aria-label", "Open rewards page");
    button.innerHTML = buildRewardsIcon();
    button.addEventListener("click", () => {
      assignLocation(getRewardsDestinationUrl());
    });

    userName.insertAdjacentElement("afterend", button);
  }

  function setSparkyOpen(nextOpen) {
    const root = document.body.querySelector(`[${markers.sparkyRoot}="true"]`);

    if (!root) {
      return;
    }

    const backdrop = root.querySelector(".msl-sparky-backdrop");
    const panel = root.querySelector(".msl-sparky-panel");
    const launcher = root.querySelector(".msl-sparky-launcher");

    state.sparkyOpen = nextOpen;

    if (backdrop) {
      backdrop.hidden = !nextOpen;
    }

    if (panel) {
      panel.hidden = !nextOpen;
    }

    if (launcher) {
      launcher.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    }
  }

  function injectSparkyWidget() {
    if (document.body.querySelector(`[${markers.sparkyRoot}="true"]`)) {
      return;
    }

    const root = document.createElement("div");
    root.setAttribute(markers.sparkyRoot, "true");

    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "msl-sparky-backdrop";
    backdrop.hidden = true;
    backdrop.setAttribute("aria-label", "Close Sparky chat");
    backdrop.addEventListener("click", () => setSparkyOpen(false));

    const panel = document.createElement("section");
    panel.className = "msl-sparky-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Sparky chat");
    panel.innerHTML = `
      <div class="msl-sparky-header">
        <div class="msl-sparky-header-copy">
          <div class="msl-sparky-avatar-wrap">
            <img class="msl-sparky-avatar" src="${urls.mascot}" alt="Sparky" />
          </div>
          <div>
            <p class="msl-sparky-panel-title">SPARKY</p>
            <p class="msl-sparky-panel-subtitle">Chat with us without leaving MyASU.</p>
          </div>
        </div>
        <button type="button" class="msl-sparky-close" aria-label="Close chat">×</button>
      </div>
      ${
        canEmbedChat
          ? `<iframe
        class="msl-sparky-frame"
        title="Sparky chat"
        src="${urls.chatEmbed}"
        loading="lazy"
        referrerpolicy="no-referrer"
      ></iframe>`
          : `<div class="msl-sparky-fallback">
        <p>
          Local dev chat is running over HTTP, so MyASU cannot embed it inside this HTTPS page.
          Open the full chat in a new tab instead.
        </p>
        <button type="button" class="msl-sparky-fallback-link">Open SPARKY chat</button>
      </div>`
      }
    `;

    const closeButton = panel.querySelector(".msl-sparky-close");
    closeButton?.addEventListener("click", () => setSparkyOpen(false));
    const fallbackLink = panel.querySelector(".msl-sparky-fallback-link");
    fallbackLink?.addEventListener("click", () => {
      openNewTab(urls.chat);
      setSparkyOpen(false);
    });

    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "msl-sparky-launcher";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-label", "Open Sparky chat");
    launcher.innerHTML = `
      <span class="msl-sparky-avatar-wrap">
        <img class="msl-sparky-avatar" src="${urls.mascot}" alt="Sparky" />
      </span>
      <span class="msl-sparky-label">
        <span class="msl-sparky-kicker">SPARKY</span>
        <span class="msl-sparky-title">Chat with us</span>
      </span>
    `;
    launcher.addEventListener("click", () => {
      if (!canEmbedChat) {
        openNewTab(urls.chat);
        return;
      }

      setSparkyOpen(!state.sparkyOpen);
    });

    root.append(backdrop, panel, launcher);
    document.body.append(root);
  }

  function injectEverything() {
    ensureStyles();
    injectPrimaryNavLink();
    injectDashboardLink();
    injectRewardsButton();
    injectSparkyWidget();
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.sparkyOpen) {
      setSparkyOpen(false);
    }
  });

  injectEverything();

  const observer = new MutationObserver(() => {
    injectEverything();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
