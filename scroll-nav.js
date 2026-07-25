/* ============================================================
   scroll-nav.js
   Builds a floating "reading dial" in the bottom-right corner:

     - a ring that fills up as you read the page
     - one click sends you back to the top, smoothly
     - a small button opens a list of every section on the page,
       and highlights the one you are currently reading

   The section list is built automatically from the <h2> heading
   inside each <section class="section">, so when you add a new
   section to your HTML it appears in the menu on its own. You
   never have to edit this file.
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    var sections = collectSections();
    var widget = buildWidget(sections);
    document.body.appendChild(widget.root);

    wireUp(widget, sections);
  }

  /* ----------------------------------------------------------
     1. Find the sections and make sure each one has an id
     ---------------------------------------------------------- */
  function collectSections() {
    var headings = document.querySelectorAll("h1, h2");
    var list = [];

    Array.prototype.forEach.call(headings, function (heading, i) {
      /* ignore anything in the navigation, footer or this widget */
      if (heading.closest &&
          heading.closest(".dp-quicknav, .header-nav, .site-footer")) {
        return;
      }

      var label = heading.textContent.replace(/\s+/g, " ").trim();
      if (!label) return;

      /* If the heading sits inside a section that already has an id
         (your #education, #publications and so on), reuse that id so
         the menu matches your top navigation links. */
      var parent = heading.parentElement;
      var target = heading;

      if (parent && parent.id && parent.querySelector("h1, h2") === heading) {
        target = parent;
      } else if (!heading.id) {
        heading.id = "dp-section-" + (i + 1);
      }

      list.push({
        el: target,
        id: target.id,
        label: shorten(toTitleCase(label))
      });
    });

    return list;
  }

  /* Keep menu entries readable */
  function shorten(text) {
    if (text.length <= 52) return text;
    return text.slice(0, 49).replace(/[\s,;:.\-]+$/, "") + "\u2026";
  }

  /* SOIL CHEMISTRY -> Soil Chemistry (leaves normal text untouched) */
  var SMALL_WORDS = [
    "and", "or", "of", "for", "in", "on", "at", "to", "the",
    "a", "an", "with", "by", "from"
  ];

  function toTitleCase(text) {
    if (text !== text.toUpperCase()) return text;

    var words = text.toLowerCase().split(" ");

    return words
      .map(function (word, i) {
        if (i > 0 && SMALL_WORDS.indexOf(word) !== -1) return word;
        return word.replace(/(^|[\-\/(])([a-z])/g, function (m, pre, ch) {
          return pre + ch.toUpperCase();
        });
      })
      .join(" ");
  }

  /* ----------------------------------------------------------
     2. Build the widget markup
     ---------------------------------------------------------- */
  function buildWidget(sections) {
    var root = document.createElement("div");
    root.className = "dp-quicknav";
    root.setAttribute("data-open", "false");

    /* --- the section panel --- */
    var panel = document.createElement("nav");
    panel.className = "dp-quicknav__panel";
    panel.id = "dp-quicknav-panel";
    panel.setAttribute("aria-label", "Page sections");

    var title = document.createElement("p");
    title.className = "dp-quicknav__title";
    title.textContent = "Jump to section";
    panel.appendChild(title);

    var list = document.createElement("ul");
    list.className = "dp-quicknav__list";

    var links = [];
    sections.forEach(function (section) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "dp-quicknav__link";
      a.href = "#" + section.id;
      a.textContent = section.label;
      a.setAttribute("data-target", section.id);
      li.appendChild(a);
      list.appendChild(li);
      links.push(a);
    });

    panel.appendChild(list);

    /* --- the two buttons --- */
    var buttons = document.createElement("div");
    buttons.className = "dp-quicknav__buttons";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "dp-quicknav__toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "dp-quicknav-panel");
    toggle.setAttribute("aria-label", "Jump to a section");
    toggle.title = "Jump to a section";
    toggle.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" aria-hidden="true">' +
      '<line x1="4" y1="7" x2="20" y2="7"></line>' +
      '<line x1="4" y1="12" x2="20" y2="12"></line>' +
      '<line x1="4" y1="17" x2="14" y2="17"></line>' +
      "</svg>";

    var top = document.createElement("button");
    top.type = "button";
    top.className = "dp-quicknav__top";
    top.setAttribute("aria-label", "Back to top of page");
    top.title = "Back to top";
    top.innerHTML =
      '<svg class="dp-quicknav__ring" viewBox="0 0 56 56" aria-hidden="true">' +
      "<defs>" +
      '<linearGradient id="dp-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#3498db"></stop>' +
      '<stop offset="100%" stop-color="#ff5733"></stop>' +
      "</linearGradient>" +
      "</defs>" +
      '<circle class="dp-quicknav__ring-track" cx="28" cy="28" r="25"></circle>' +
      '<circle class="dp-quicknav__ring-fill" cx="28" cy="28" r="25"></circle>' +
      "</svg>" +
      '<svg class="dp-quicknav__arrow" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="12" y1="19" x2="12" y2="6"></line>' +
      '<polyline points="6 12 12 6 18 12"></polyline>' +
      "</svg>" +
      '<span class="dp-quicknav__percent" aria-hidden="true">0%</span>';

    /* If a page has no sections worth listing, drop the menu button */
    if (sections.length < 2) {
      panel.setAttribute("hidden", "hidden");
    } else {
      buttons.appendChild(toggle);
    }

    buttons.appendChild(top);

    root.appendChild(panel);
    root.appendChild(buttons);

    return {
      root: root,
      panel: panel,
      toggle: sections.length < 2 ? null : toggle,
      top: top,
      links: links,
      ring: top.querySelector(".dp-quicknav__ring-fill"),
      percent: top.querySelector(".dp-quicknav__percent")
    };
  }

  /* ----------------------------------------------------------
     3. Behaviour
     ---------------------------------------------------------- */
  function wireUp(widget, sections) {
    var CIRCUMFERENCE = 2 * Math.PI * 25; /* r = 25 in the SVG */
    var ticking = false;

    widget.ring.style.strokeDasharray = CIRCUMFERENCE;
    widget.ring.style.strokeDashoffset = CIRCUMFERENCE;

    /* -- keep the widget clear of a fixed footer -- */
    function measureFooter() {
      var footer = document.querySelector(".site-footer");
      var gap = 20;

      if (footer) {
        var style = window.getComputedStyle(footer);
        if (style.position === "fixed") {
          gap = footer.offsetHeight + 16;
        }
      }
      document.documentElement.style.setProperty("--dp-bottom-gap", gap + "px");
    }

    /* -- how far down the page are we, 0 to 1 -- */
    function scrollProgress() {
      var scrolled = window.pageYOffset || document.documentElement.scrollTop;
      var height =
        document.documentElement.scrollHeight - window.innerHeight;
      if (height <= 0) return 0;
      return Math.min(1, Math.max(0, scrolled / height));
    }

    function update() {
      ticking = false;

      var scrolled = window.pageYOffset || document.documentElement.scrollTop;
      var progress = scrollProgress();
      var canScroll =
        document.documentElement.scrollHeight - window.innerHeight > 120;

      /* show the dial once the reader has moved down a little */
      if (canScroll && scrolled > 220) {
        widget.root.classList.add("is-visible");
      } else {
        widget.root.classList.remove("is-visible");
        closePanel();
      }

      widget.ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
      widget.percent.textContent = Math.round(progress * 100) + "%";

      highlightCurrent(scrolled);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    /* -- which section is being read right now -- */
    function highlightCurrent(scrolled) {
      if (!widget.links.length) return;

      var marker = window.innerHeight * 0.3;
      var currentIndex = 0;

      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el.getBoundingClientRect().top <= marker) {
          currentIndex = i;
        }
      }

      /* at the very bottom, highlight the last one */
      if (
        window.innerHeight + scrolled >=
        document.documentElement.scrollHeight - 4
      ) {
        currentIndex = sections.length - 1;
      }

      widget.links.forEach(function (link, i) {
        if (i === currentIndex) {
          link.classList.add("is-current");
        } else {
          link.classList.remove("is-current");
        }
      });
    }

    /* -- panel open / close -- */
    function openPanel() {
      if (!widget.toggle) return;
      widget.root.setAttribute("data-open", "true");
      widget.toggle.setAttribute("aria-expanded", "true");

      var active = widget.panel.querySelector(".is-current");
      if (active && typeof active.scrollIntoView === "function") {
        try {
          active.scrollIntoView({ block: "nearest" });
        } catch (e) {
          /* older browsers simply skip this nicety */
        }
      }
    }

    function closePanel() {
      if (!widget.toggle) return;
      widget.root.setAttribute("data-open", "false");
      widget.toggle.setAttribute("aria-expanded", "false");
    }

    function togglePanel() {
      if (widget.root.getAttribute("data-open") === "true") {
        closePanel();
      } else {
        openPanel();
      }
    }

    if (widget.toggle) {
      widget.toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        togglePanel();
      });
    }

    /* -- back to top -- */
    widget.top.addEventListener("click", function () {
      closePanel();
      scrollToPosition(0);
    });

    /* -- clicking a section in the list -- */
    widget.panel.addEventListener("click", function (event) {
      var link = event.target.closest
        ? event.target.closest(".dp-quicknav__link")
        : null;
      if (!link) return;

      event.preventDefault();
      var target = document.getElementById(link.getAttribute("data-target"));
      if (!target) return;

      closePanel();
      scrollToPosition(target.getBoundingClientRect().top + window.pageYOffset - headerOffset());
    });

    function headerOffset() {
      var nav = document.querySelector(".header-nav");
      if (!nav) return 20;
      var style = window.getComputedStyle(nav);
      if (style.position !== "fixed" && style.position !== "sticky") return 20;
      return nav.offsetHeight + 16;
    }

    function scrollToPosition(y) {
      var reduce =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      try {
        window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
      } catch (e) {
        window.scrollTo(0, y); /* very old browsers */
      }
    }

    /* -- close when clicking elsewhere or pressing Escape -- */
    document.addEventListener("click", function (event) {
      if (!widget.root.contains(event.target)) closePanel();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" || event.key === "Esc") closePanel();
    });

    /* -- listeners -- */
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      measureFooter();
      onScroll();
    });
    window.addEventListener("load", function () {
      measureFooter();
      update();
    });

    measureFooter();
    update();
  }
})();
