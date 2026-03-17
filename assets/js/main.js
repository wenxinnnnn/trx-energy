/* ============================================================
   TRX Energy - Main JS
   Matrix background + FAQ accordion + Mobile nav
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Matrix Canvas ---------- */
  const canvas = document.getElementById("matrix-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const HEX_CHARS = "0123456789ABCDEF";
    const FONT_SIZE = 14;
    let columns, drops;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / FONT_SIZE);
      drops = Array.from({ length: columns }, () => Math.random() * -canvas.height);
    }

    function draw() {
      ctx.fillStyle = "rgba(24, 26, 32, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#FCD535";
      ctx.font = FONT_SIZE + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
        ctx.fillText(char, i * FONT_SIZE, drops[i]);

        if (drops[i] > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += FONT_SIZE;
      }
    }

    resize();
    window.addEventListener("resize", resize);
    setInterval(draw, 50);
  }

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    const btn = item.querySelector(".faq-question button");
    const answer = item.querySelector(".faq-answer");

    if (!btn || !answer) return;

    btn.addEventListener("click", function () {
      const isOpen = item.classList.contains("open");

      // Close all
      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-question button").setAttribute("aria-expanded", "false");
        openItem.querySelector(".faq-answer").hidden = true;
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        answer.hidden = false;
      }
    });
  });

  /* ---------- Copy Address (hero block + pricing buttons) ---------- */
  function copyAddress(address, btn) {
    function onSuccess() {
      var prev = btn.textContent;
      btn.textContent = "✓ 已复制！";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = prev;
        btn.disabled = false;
      }, 2000);
    }
    navigator.clipboard.writeText(address).then(onSuccess).catch(function () {
      var ta = document.createElement("textarea");
      ta.value = address;
      ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      onSuccess();
    });
  }

  // Hero address block
  var heroBtn = document.getElementById("copyAddress");
  if (heroBtn) {
    heroBtn.addEventListener("click", function () {
      var address = this.dataset.address;
      var feedback = this.querySelector(".copy-feedback");
      navigator.clipboard.writeText(address).then(function () {
        feedback.textContent = "已复制！";
        setTimeout(function () { feedback.textContent = ""; }, 2000);
      }).catch(function () {
        var ta = document.createElement("textarea");
        ta.value = address;
        ta.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        feedback.textContent = "已复制！";
        setTimeout(function () { feedback.textContent = ""; }, 2000);
      });
    });
  }

  // Pricing card copy buttons
  document.querySelectorAll(".btn-copy-addr").forEach(function (btn) {
    btn.addEventListener("click", function () {
      copyAddress(this.dataset.address, this);
    });
  });

  /* ---------- Mobile Nav Toggle ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      const isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close nav when a link is clicked
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Smooth scroll offset for sticky header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector(".site-header")?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

})();
