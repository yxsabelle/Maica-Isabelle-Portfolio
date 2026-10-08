/* ==========================================================================
   COQUETTE PORTFOLIO — SCRIPT
   1. Theme toggle (with localStorage persistence)
   2. Sticky header shadow
   3. Mobile hamburger menu
   4. Smooth scroll (native CSS handles most; this closes mobile menu on click)
   5. Active nav link on scroll
   6. Scroll reveal animations
   7. Cursor glow effect (disabled on touch devices)
   8. Certification flip cards (tap-to-flip on touch devices)
   9. Footer year
   10. Scroll-progress ribbon
   11. Ask Yxsa chat (Chatbase) open / close
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- small helpers: localStorage can throw (private mode, blocked cookies) ---------- */
  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }
  };

  /* ---------- 1. THEME TOGGLE ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  // Respect saved preference, otherwise default to light mode
  if (store.get("portfolio-theme") === "dark") {
    root.setAttribute("data-theme", "dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
        store.set("portfolio-theme", "light");
      } else {
        root.setAttribute("data-theme", "dark");
        store.set("portfolio-theme", "dark");
      }
    });
  }

  /* ---------- 2. STICKY HEADER SHADOW ---------- */
  const header = document.getElementById("siteHeader");
  if (header) {
    const onScrollHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* ---------- 3. MOBILE HAMBURGER MENU ---------- */
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  const closeMobileNav = () => {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("open");
  };

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    // close the drawer when the window is resized up to desktop width
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMobileNav();
    });
  }

  /* ---------- 4. CLOSE MOBILE MENU ON LINK CLICK ---------- */
  document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", closeMobileNav);
  });

  /* ---------- 5. ACTIVE NAV LINK WHILE SCROLLING ---------- */
  const navLinks = document.querySelectorAll(".nav-link");
  const navTargets = new Set(
    Array.from(navLinks).map(link => link.getAttribute("href").replace("#", ""))
  );

  // only track sections that actually have a nav link, so scrolling through
  // "Beyond the Screen" keeps Certifications highlighted instead of clearing the nav
  const sections = Array.from(document.querySelectorAll("main section[id]"))
    .filter(section => navTargets.has(section.id));

  const setActiveLink = () => {
    let currentId = "home";
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      const targetId = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active-link", targetId === currentId);
    });
  };

  window.addEventListener("scroll", setActiveLink, { passive: true });
  window.addEventListener("resize", setActiveLink);
  setActiveLink();

  /* ---------- 6. SCROLL REVEAL ANIMATIONS ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: just show everything
    revealEls.forEach(el => el.classList.add("in-view"));
  }

  /* ---------- 7. CURSOR GLOW EFFECT ---------- */
  const cursorGlow = document.getElementById("cursorGlow");
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  if (cursorGlow) {
    if (isTouchDevice) {
      cursorGlow.style.display = "none";
    } else {
      // hidden until the mouse first moves, so it doesn't sit in the top-left corner on load
      cursorGlow.style.opacity = "0";

      let mouseX = 0, mouseY = 0;
      let glowX = 0, glowY = 0;
      let hasMoved = false;
      let rafId = null;

      // Smoothly ease the glow toward the real cursor position (soft trail effect).
      // The loop stops by itself once the glow catches up, so it isn't running forever.
      const animateGlow = () => {
        glowX += (mouseX - glowX) * 0.18;
        glowY += (mouseY - glowY) * 0.18;
        cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;

        if (Math.abs(mouseX - glowX) > 0.1 || Math.abs(mouseY - glowY) > 0.1) {
          rafId = requestAnimationFrame(animateGlow);
        } else {
          rafId = null;
        }
      };

      window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!hasMoved) {
          // start right at the cursor instead of flying in from the corner
          glowX = mouseX;
          glowY = mouseY;
          hasMoved = true;
        }
        cursorGlow.style.opacity = "1";
        if (rafId === null) rafId = requestAnimationFrame(animateGlow);
      });

      document.addEventListener("mouseleave", () => {
        cursorGlow.style.opacity = "0";
      });
    }
  }

  /* ---------- 8. CERTIFICATION FLIP CARDS (touch support) ---------- */
  // On touch devices there's no hover, so the first tap flips the card
  // to reveal the back; a second tap on an already-flipped card follows
  // the link to open the certificate.
  const certCards = document.querySelectorAll(".cert-flip");

  if (isTouchDevice) {
    certCards.forEach(card => {
      card.addEventListener("click", (e) => {
        if (!card.classList.contains("is-flipped")) {
          e.preventDefault();
          certCards.forEach(c => c.classList.remove("is-flipped"));
          card.classList.add("is-flipped");
        }
        // already flipped: let the click through so the certificate link opens
      });
    });

    // tapping anywhere outside a certificate card flips it back
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".cert-flip")) {
        certCards.forEach(c => c.classList.remove("is-flipped"));
      }
    });
  }

  /* ---------- 8b. PROJECT IMAGE CAROUSELS ---------- */
  document.querySelectorAll(".project-image").forEach(container => {
    const imgs = container.querySelectorAll(".carousel-img");
    const dots = container.querySelectorAll(".dot");
    const prevBtn = container.querySelector(".carousel-btn.prev");
    const nextBtn = container.querySelector(".carousel-btn.next");
    if (!imgs.length) return;
    let index = 0;

    const show = (i) => {
      index = (i + imgs.length) % imgs.length;
      imgs.forEach((img, n) => img.classList.toggle("active", n === index));
      dots.forEach((dot, n) => dot.classList.toggle("active", n === index));
    };

    if (nextBtn) nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      show(index + 1);
    });
    if (prevBtn) prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      show(index - 1);
    });
  });

  /* ---------- 8c. PROFILE PHOTO FAN (ribbon click) ---------- */
  const fanToggle = document.getElementById("fanToggle");
  const profileCard = document.getElementById("profileCard");

  if (fanToggle && profileCard) {
    fanToggle.addEventListener("click", () => {
      const isOpen = profileCard.classList.toggle("fan-open");
      fanToggle.setAttribute("aria-pressed", String(isOpen));
    });
  }

  /* ---------- 9. FOOTER YEAR ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 10. SCROLL-PROGRESS RIBBON ---------- */
  const ribbonFill = document.getElementById("scrollRibbonFill");
  if (ribbonFill) {
    const updateRibbon = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      ribbonFill.style.width = pct + "%";
    };
    window.addEventListener("scroll", updateRibbon, { passive: true });
    window.addEventListener("resize", updateRibbon);
    updateRibbon();
  }

  /* ---------- 11. ASK YXSA CHAT (Chatbase) ---------- */
  // Only opens and closes the window. The Chatbase iframe stays loaded the whole time,
  // so the visitor's conversation isn't reset when they close the chat.
  const aiButton = document.getElementById("aiChatButton");
  const aiWindow = document.getElementById("aiChatWindow");
  const aiClose = document.getElementById("aiChatClose");

  if (aiButton && aiWindow) {
    const setChatOpen = (open) => {
      aiWindow.classList.toggle("active", open);
      aiButton.classList.toggle("active", open);
      aiButton.setAttribute("aria-expanded", String(open));
      aiWindow.setAttribute("aria-hidden", String(!open));
      aiButton.setAttribute(
        "aria-label",
        open ? "Close Elle's AI assistant" : "Open Elle's AI assistant"
      );
    };

    aiButton.addEventListener("click", () => {
      setChatOpen(!aiWindow.classList.contains("active"));
    });

    if (aiClose) {
      aiClose.addEventListener("click", () => {
        setChatOpen(false);
        aiButton.focus();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && aiWindow.classList.contains("active")) {
        setChatOpen(false);
        aiButton.focus();
      }
    });
  }

});
