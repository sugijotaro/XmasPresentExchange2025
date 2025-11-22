class Disclosure {
  summaryEl = void 0;
  options = {};
  detailsEl = void 0;
  closers = [];
  isOpen = false;
  get noTransition() {
    const computedStyle = getComputedStyle(this.detailsEl);
    const durations = computedStyle.transitionDuration.split(", ");
    const delays = computedStyle.transitionDelay.split(", ");
    return durations.every((el) => el === "0s") && delays.every((el) => el === "0s");
  }
  /**
   * @param {HTMLElement} summaryEl - The summary element
   * @param {Object} options - Options
   * @param {boolean} options.hashNavigation - Whether the disclosure is automatically opened if the ID of the summary element matches the URL fragment on initialization
   */
  constructor(summaryEl, options) {
    this.summaryEl = summaryEl;
    this.options = {
      hashNavigation: false,
      ...options
    };
    this.init();
  }
  init() {
    this.summaryEl.addEventListener("click", this.handleSummaryElClick);
    this.detailsEl = document.querySelector(
      `#${this.summaryEl.getAttribute("aria-controls")}`
    );
    this.closers = this.detailsEl.querySelectorAll("[data-disclosure-close]");
    for (const el of this.closers) {
      el.addEventListener("click", this.handleCloseElClick);
    }
    if (this.options.hashNavigation && this.summaryEl.id && this.summaryEl.id === window.location.hash.slice(1)) {
      if (this.noTransition) {
        this.open();
      } else {
        this.detailsEl.style.transition = "none";
        this.open();
        this.detailsEl.style.transition = "";
      }
    }
  }
  scrollIntoViewIfNeeded() {
    const summaryElClientRect = this.summaryEl.getBoundingClientRect();
    if (summaryElClientRect.top < 0 || window.innerHeight < summaryElClientRect.bottom) {
      this.summaryEl.scrollIntoView({
        block: "center"
      });
    }
  }
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.detailsEl.style.height = `${this.detailsEl.scrollHeight}px`;
    this.detailsEl.removeAttribute("aria-hidden");
    this.summaryEl.setAttribute("aria-expanded", "true");
    if (this.noTransition) {
      this.cleanUp();
    } else {
      this.detailsEl.addEventListener(
        "transitionend",
        this.handleTransitionEnd
      );
    }
    this.dispatch("open");
  }
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    if (!this.noTransition) {
      this.detailsEl.style.height = `${this.detailsEl.scrollHeight}px`;
      this.detailsEl.clientHeight;
    }
    this.detailsEl.style.height = "0";
    this.detailsEl.setAttribute("aria-hidden", "true");
    this.summaryEl.setAttribute("aria-expanded", "false");
    if (this.noTransition) {
      this.cleanUp();
    } else {
      this.detailsEl.addEventListener(
        "transitionend",
        this.handleTransitionEnd
      );
    }
    this.dispatch("close");
  }
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  cleanUp() {
    if (!this.noTransition) {
      this.detailsEl.removeEventListener(
        "transitionend",
        this.handleTransitionEnd
      );
    }
    this.detailsEl.style.height = "";
    if (this.isOpen) {
      this.dispatch("opened");
    } else {
      this.dispatch("closed");
    }
  }
  dispatch(type) {
    this.summaryEl.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true
      })
    );
  }
  handleSummaryElClick = () => {
    this.toggle();
  };
  handleCloseElClick = () => {
    this.close();
    this.summaryEl.focus();
    this.scrollIntoViewIfNeeded();
  };
  handleTransitionEnd = (e) => {
    if (e.target !== this.detailsEl) return;
    this.cleanUp();
  };
}
if (typeof window !== "undefined") {
  const passiveTestOptions = {
    get passive() {
      return void 0;
    }
  };
  window.addEventListener("testPassive", null, passiveTestOptions);
  window.removeEventListener("testPassive", null, passiveTestOptions);
}
const isIosDevice = typeof window !== "undefined" && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
let locks = [];
const clearAllBodyScrollLocks = () => {
  if (isIosDevice) {
    locks.forEach((lock) => {
      lock.targetElement.ontouchstart = null;
      lock.targetElement.ontouchmove = null;
    });
  }
  locks = [];
};
const mql = window.matchMedia("(min-width: 1024px)");
const handleChange = () => {
  if (mql.matches) {
    clearAllBodyScrollLocks();
  }
};
mql.addListener(handleChange);
document.querySelectorAll("[data-disclosure]").forEach((el) => {
  new Disclosure(el, {
    hashNavigation: true
  });
});
const backdrop = document.querySelector(".p-backdrop");
const contentEl = document.getElementById("content");
const contentTopObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      backdrop.classList.add("is-fixed");
    } else {
      backdrop.classList.remove("is-fixed");
    }
  });
}, {
  root: null,
  rootMargin: "0px 0px -100%",
  threshold: 0
});
let firstTime = false;
const contentBottomObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (firstTime) {
        backdrop.classList.add("is-fixed");
        backdrop.classList.remove("is-bottom");
      }
      firstTime = true;
    } else {
      backdrop.classList.remove("is-fixed");
      backdrop.classList.add("is-bottom");
    }
  });
}, {
  root: null,
  rootMargin: "-100% 0px 0px",
  threshold: 0
});
contentTopObserver.observe(contentEl);
contentBottomObserver.observe(contentEl);
const stickyLink = document.querySelector(".p-sticky-link");
const bottomEl = document.getElementById("bottom");
let bottomTop = 0;
function updateBottomTop() {
  bottomTop = bottomEl.getBoundingClientRect().top + window.scrollY;
}
updateBottomTop();
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(updateBottomTop, 200);
});
const bottomTopObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      stickyLink?.classList.add("is-bottom");
    } else {
      if (window.scrollY < bottomTop) {
        stickyLink?.classList.remove("is-bottom");
      } else {
        stickyLink?.classList.add("is-bottom");
      }
    }
  });
}, {
  root: null,
  rootMargin: "0px",
  threshold: 0
});
bottomTopObserver.observe(bottomEl);
const scrollAnimationEls = document.querySelectorAll(".js-scroll-animation");
const scrollAnimationObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-active");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: "0px 0px -20%"
  }
);
scrollAnimationEls.forEach(function(scrollFadeInEl) {
  scrollAnimationObserver.observe(scrollFadeInEl);
});
window.addEventListener("load", () => {
  const openingAnimationEls = document.querySelectorAll(".js-opening-animation");
  openingAnimationEls.forEach((el) => {
    el.classList.add("is-active");
  });
});
const scrollFadeInEls = document.querySelectorAll(".js-scroll-fadein");
const scrollFadeInObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-active");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: "0px 0px -10%"
  }
);
scrollFadeInEls.forEach(function(scrollFadeInEl) {
  scrollFadeInObserver.observe(scrollFadeInEl);
});
window.addEventListener("load", () => {
  const mv = document.getElementById("mv");
  if (mv) {
    mv.classList.add("is-active");
  }
});
function mountParallaxSection(section, {
  root = null,
  prestartVH = 0.5,
  baseMoveVH = 40,
  inertia = 0.15,
  marginBottom = {
    enabled: true,
    target: null,
    speed: 0.5,
    linkToLayer: "[data-speed]",
    basePx: null,
    clampMinPx: null,
    clampMaxPx: null
  }
} = {}) {
  const layers = section.querySelectorAll(".px-layer");
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) (e.isIntersecting ? start : stop)();
    },
    {
      root,
      threshold: [0, 1],
      rootMargin: `${prestartVH * 100}% 0px ${prestartVH * 100}% 0px`
    }
  );
  let rafId = null;
  const getRects = () => {
    const r = section.getBoundingClientRect();
    if (!root) return { top: r.top, height: r.height, vh: window.innerHeight || 1 };
    const rr = root.getBoundingClientRect();
    return { top: r.top - rr.top, height: r.height, vh: rr.height || 1 };
  };
  const readRawProgress = () => {
    const { top, height } = getRects();
    return -top / (height || 1);
  };
  let mbEl = section;
  if (marginBottom?.target) {
    if (typeof marginBottom.target === "string") {
      mbEl = document.querySelector(marginBottom.target) || section;
    } else if (marginBottom.target instanceof HTMLElement) {
      mbEl = marginBottom.target;
    }
  }
  const csMb = getComputedStyle(mbEl);
  const baseMarginBottom = typeof marginBottom?.basePx === "number" && Number.isFinite(marginBottom.basePx) ? marginBottom.basePx : parseFloat(csMb.marginBottom) || 0;
  let linkedSpeed = null;
  if (marginBottom?.linkToLayer) {
    const ref = section.querySelector(marginBottom.linkToLayer);
    if (ref) {
      const s = parseFloat(ref.dataset.speed);
      if (!Number.isNaN(s)) linkedSpeed = s;
    }
  }
  let eased = 0;
  const render = () => {
    const raw = readRawProgress();
    eased += (raw - eased) * inertia;
    const deltaVH = eased * baseMoveVH;
    const { vh } = getRects();
    const vhPx = vh / 100;
    layers.forEach((el) => {
      const speed = parseFloat(el.dataset.speed ?? "0.3");
      const translateYvh = -deltaVH * speed;
      el.style.transform = `translate3d(0, ${translateYvh}vh, 0)`;
      el.style.willChange = "transform";
    });
    if (marginBottom?.enabled) {
      const sp = linkedSpeed ?? Number(marginBottom.speed ?? 0.5);
      const deltaPx = -deltaVH * sp * vhPx;
      let next = baseMarginBottom + deltaPx;
      if (typeof marginBottom.clampMinPx === "number") {
        next = Math.max(marginBottom.clampMinPx, next);
      }
      if (typeof marginBottom.clampMaxPx === "number") {
        next = Math.min(marginBottom.clampMaxPx, next);
      }
      mbEl.style.marginBottom = `${next.toFixed(2)}px`;
      mbEl.style.willChange = "margin-bottom";
      document.documentElement.style.setProperty("--mb-current", next.toFixed(2) + "px");
    }
    rafId = requestAnimationFrame(render);
  };
  const start = () => {
    if (rafId == null) rafId = requestAnimationFrame(render);
  };
  const stop = () => {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  const scroller = root ?? window;
  const noop = () => {
  };
  scroller.addEventListener("scroll", noop, { passive: true });
  window.addEventListener("resize", noop, { passive: true });
  io.observe(section);
  return () => {
    stop();
    io.disconnect();
    scroller.removeEventListener("scroll", noop);
    window.removeEventListener("resize", noop);
  };
}
mountParallaxSection(document.getElementById("mv"), {
  prestartVH: 0.5,
  inertia: 1,
  marginBottom: {
    enabled: true,
    target: "#mv",
    linkToLayer: '[data-speed="0.6"]'
  }
});
function mountParallax(section) {
  const layers = section.querySelectorAll(".px-layer");
  const rafUpdate = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const progress = 1 - rect.bottom / (rect.height + vh);
    layers.forEach((el) => {
      const axis = el.dataset.axis || "y";
      const speed = parseFloat(el.dataset.speed || 0);
      let x = 0, y = 0;
      if (axis === "x") x = progress * 100 * speed;
      if (axis === "y") y = progress * 100 * speed;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    requestAnimationFrame(rafUpdate);
  };
  rafUpdate();
}
document.querySelectorAll(".js-parallax").forEach(mountParallax);
