/* ============================================================
   TRX Energy - Main JS
   Matrix · FAQ accordion · Copy address · Counter · Calculator
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Matrix Canvas (deferred to after load) ---------- */
  window.addEventListener("load", function () {
    var canvas = document.getElementById("matrix-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var HEX_CHARS = "0123456789ABCDEF";
    var FONT_SIZE = 14;
    var columns, drops;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / FONT_SIZE);
      drops = Array.from({ length: columns }, function () {
        return Math.random() * -canvas.height;
      });
    }

    function draw() {
      ctx.fillStyle = "rgba(24, 26, 32, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#FCD535";
      ctx.font = FONT_SIZE + "px monospace";
      for (var i = 0; i < drops.length; i++) {
        var char = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
        ctx.fillText(char, i * FONT_SIZE, drops[i]);
        if (drops[i] > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += FONT_SIZE;
      }
    }

    resize();
    window.addEventListener("resize", resize);
    setInterval(draw, 50);
  });

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-question button");
    var answer = item.querySelector(".faq-answer");
    if (!btn || !answer) return;

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".faq-question button").setAttribute("aria-expanded", "false");
        o.querySelector(".faq-answer").hidden = true;
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        answer.hidden = false;
      }
    });
  });

  /* ---------- Copy Address ---------- */
  function copyAddress(address, btn) {
    var prev = btn.innerHTML;
    function onSuccess() {
      btn.innerHTML = "✓ 已复制！";
      btn.disabled = true;
      setTimeout(function () { btn.innerHTML = prev; btn.disabled = false; }, 2000);
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
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Smooth Scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      var headerH = (document.querySelector(".site-header") || {}).offsetHeight || 72;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ---------- Animated Counters ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.dataset.target);
    var suffix = el.dataset.suffix || "";
    var isFloat = el.dataset.float === "true";
    var duration = 1800;
    var start = performance.now();

    function format(n) {
      if (isFloat) return n.toFixed(1) + suffix;
      if (n >= 1000000) return (n / 1000000).toFixed(1) + "M" + suffix;
      if (n >= 1000) return Math.floor(n / 1000) + "K" + suffix;
      return Math.floor(n) + suffix;
    }

    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = format(target);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".trust-value[data-target]");
  if (counters.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(function (el) { io.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Savings Calculator ---------- */
  var slider = document.getElementById("calc-slider");
  var numInput = document.getElementById("calc-transfers");
  if (slider && numInput) {
    var TRX_PRICE = 0.25;        // USD per TRX
    var COST_NO_ENERGY = 13.5;   // TRX per transfer without energy
    var COST_WITH_ENERGY = 2;    // TRX per transfer with basic package

    function fmtTRX(n) {
      return n.toLocaleString("zh-CN", { maximumFractionDigits: 0 }) + " TRX";
    }
    function fmtUSD(n) {
      return "≈ $" + (n * TRX_PRICE).toLocaleString("zh-CN", { maximumFractionDigits: 0 });
    }

    function updateCalc(n) {
      n = Math.max(1, Math.min(10000, parseInt(n) || 1));
      var monthly = n * 30;
      var before = monthly * COST_NO_ENERGY;
      var after  = monthly * COST_WITH_ENERGY;
      var saved  = before - after;
      var pct    = Math.round(saved / before * 100);

      document.getElementById("calc-before").textContent = fmtTRX(before);
      document.getElementById("calc-before-usd").textContent = fmtUSD(before);
      document.getElementById("calc-after").textContent  = fmtTRX(after);
      document.getElementById("calc-after-usd").textContent  = fmtUSD(after);
      document.getElementById("calc-save").textContent   = fmtTRX(saved);
      document.getElementById("calc-save-pct").textContent = "节省 " + pct + "%";
    }

    slider.addEventListener("input", function () {
      numInput.value = this.value;
      updateCalc(this.value);
    });
    numInput.addEventListener("input", function () {
      var v = Math.min(200, Math.max(1, parseInt(this.value) || 1));
      slider.value = v;
      updateCalc(v);
    });

    updateCalc(10); // initial render
  }

})();
