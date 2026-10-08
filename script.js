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
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 1. THEME TOGGLE ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("portfolio-theme");

  // Respect saved preference, otherwise default to light mode
  if (savedTheme === "dark") {
    root.setAttribute("data-theme", "dark");
  }

  themeToggle.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      localStorage.setItem("portfolio-theme", "light");
    } else {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("portfolio-theme", "dark");
    }
  });

  /* ---------- 2. STICKY HEADER SHADOW ---------- */
  const header = document.getElementById("siteHeader");
  const onScrollHeader = () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 3. MOBILE HAMBURGER MENU ---------- */
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  const closeMobileNav = () => {
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("open");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  /* ---------- 4. CLOSE MOBILE MENU ON LINK CLICK ---------- */
  document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", closeMobileNav);
  });

  /* ---------- 5. ACTIVE NAV LINK WHILE SCROLLING ---------- */
  const sections = document.querySelectorAll("main section[id], .hero[id]");
  const navLinks = document.querySelectorAll(".nav-link");

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

  if (isTouchDevice) {
    cursorGlow.style.display = "none";
  } else {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorGlow.style.opacity = "1";
    });

    document.addEventListener("mouseleave", () => {
      cursorGlow.style.opacity = "0";
    });

    // Smoothly ease the glow toward the real cursor position (soft trail effect)
    const animateGlow = () => {
      glowX += (mouseX - glowX) * 0.18;
      glowY += (mouseY - glowY) * 0.18;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
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
  document.getElementById("year").textContent = new Date().getFullYear();

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

});