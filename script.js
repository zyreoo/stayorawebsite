

(function () {
  function initLoad() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('loaded');
      });
    });
  }


  function initReveal() {
    var reveal = document.querySelectorAll('.reveal');
    if (!reveal.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
      }
    );

    reveal.forEach(function (el) {
      observer.observe(el);
    });
  }

  // -------- Header: sticky + scrolled state --------
  function initHeaderScroll() {
    var bar = document.querySelector('.header-sticky');
    if (!bar) return;
    function update() {
      bar.classList.toggle('is-scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // -------- Feature tabs (Web App / Mobile) --------
  function initTabs() {
    document.querySelectorAll('.feature-tabs').forEach(function (group) {
      var tabs = group.querySelectorAll('.tab');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
        });
      });
    });
  }

  // -------- Pricing toggle (Annually / Monthly) --------
  function initPricingToggle() {
    var section = document.querySelector('.pricing');
    var btn = document.querySelector('.toggle-billing');
    if (!section || !btn) return;
    btn.addEventListener('click', function () {
      var isAnnual = section.classList.toggle('pricing-annual');
      section.classList.toggle('pricing-monthly', !isAnnual);
    });
    // Start as monthly (default)
    section.classList.add('pricing-monthly');
    section.classList.remove('pricing-annual');
  }

  // -------- Mobile nav: hamburger toggle --------
  function initNavToggle() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    function open() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }
    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }

    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) close();
      else open();
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        close();
      });
    });
  }

  // -------- Nav: logo → top of page, anchor links → smooth scroll (native, like Framer) --------
  function initNav() {
    function scrollToTop(e) {
      e.preventDefault();
      var topEl = document.getElementById('top');
      if (topEl) {
        topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    document.querySelectorAll('.logo-home').forEach(function (logo) {
      logo.addEventListener('click', scrollToTop);
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      link.addEventListener('click', function (e) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initCalendarDemo() {
    var grid = document.getElementById('calendarGrid');
    var layer = document.getElementById('calendarBookingsLayer');
    var prevBtn = document.getElementById('calendarPrev');
    var nextBtn = document.getElementById('calendarNext');
    var todayBtn = document.getElementById('calendarToday');
  
    if (!grid || !layer) return;
  
    var DAY_LABEL_WIDTH = 110;
    var ROOM_WIDTH = 140;
    var HEADER_HEIGHT = 72;
    var ROW_HEIGHT = 72;
    var BAR_OFFSET_X = 8;
    var BAR_OFFSET_Y = 6;
    var BAR_WIDTH = ROOM_WIDTH - 16;
  
    var rooms = ['101', '102', '103', '104'];
    var visibleDays = 7;
    var currentStart = startOfWeek(new Date());
    var dragBookingId = null;
  
    var bookings = [
      { id: 'b1', guest: 'Emma Wilson', room: '101', startDay: 0, nights: 4, status: 'confirmed' },
      { id: 'b2', guest: 'James Chen', room: '102', startDay: 1, nights: 2, status: 'checkedin' },
      { id: 'b3', guest: 'Sofia Rossi', room: '103', startDay: 2, nights: 3, status: 'cleaning' },
      { id: 'b4', guest: 'Liam Brown', room: '104', startDay: 4, nights: 2, status: 'confirmed' }
    ];
  
    function startOfWeek(date) {
      var d = new Date(date);
      var day = d.getDay();
      var diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d;
    }
  
    function addDays(date, days) {
      var d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    }
  
    function formatDay(date) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  
    function renderGrid() {
      grid.innerHTML = '';
  
      var corner = document.createElement('div');
      corner.className = 'calendar-cell header';
      corner.textContent = 'Dates';
      grid.appendChild(corner);
  
      rooms.forEach(function (room) {
        var roomHead = document.createElement('div');
        roomHead.className = 'calendar-cell header';
        roomHead.textContent = 'Room ' + room;
        grid.appendChild(roomHead);
      });
  
      for (var d = 0; d < visibleDays; d++) {
        var dayLabel = document.createElement('div');
        dayLabel.className = 'calendar-cell day-label';
        dayLabel.textContent = formatDay(addDays(currentStart, d));
        grid.appendChild(dayLabel);
  
        rooms.forEach(function (room) {
          var cell = document.createElement('div');
          cell.className = 'calendar-cell dropzone';
          cell.dataset.room = room;
          cell.dataset.day = d;
          attachDropEvents(cell);
          grid.appendChild(cell);
        });
      }
    }
  
    function renderBookings() {
      layer.innerHTML = '';
  
      bookings.forEach(function (booking) {
        var roomIndex = rooms.indexOf(booking.room);
        if (roomIndex === -1) return;
  
        if (booking.startDay >= visibleDays) return;
        if (booking.startDay + booking.nights <= 0) return;
  
        var clampedStart = Math.max(0, booking.startDay);
        var clampedEnd = Math.min(visibleDays, booking.startDay + booking.nights);
        var visibleSpan = clampedEnd - clampedStart;
  
        if (visibleSpan <= 0) return;
  
        var bar = document.createElement('div');
        bar.className = 'booking-bar ' + booking.status;
        bar.draggable = true;
        bar.dataset.bookingId = booking.id;
  
        bar.style.left = (DAY_LABEL_WIDTH + roomIndex * ROOM_WIDTH + BAR_OFFSET_X) + 'px';
        bar.style.top = (HEADER_HEIGHT + clampedStart * ROW_HEIGHT + BAR_OFFSET_Y) + 'px';
        bar.style.width = BAR_WIDTH + 'px';
        bar.style.height = (visibleSpan * ROW_HEIGHT - 12) + 'px';
  
        bar.innerHTML =
          '<span class=\"booking-guest\">' + booking.guest + '</span>' +
          '<span class=\"booking-meta\">' + booking.nights + ' night' + (booking.nights > 1 ? 's' : '') + '</span>';
  
        bar.addEventListener('dragstart', function (e) {
          dragBookingId = booking.id;
          e.dataTransfer.setData('text/plain', booking.id);
        });
  
        bar.addEventListener('dragend', function () {
          dragBookingId = null;
          clearDragStates();
        });
  
        layer.appendChild(bar);
      });
  
      layer.style.width = (DAY_LABEL_WIDTH + rooms.length * ROOM_WIDTH) + 'px';
      layer.style.height = (HEADER_HEIGHT + visibleDays * ROW_HEIGHT) + 'px';
    }
  
    function clearDragStates() {
      grid.querySelectorAll('.dropzone.drag-over').forEach(function (cell) {
        cell.classList.remove('drag-over');
      });
    }
  
    function attachDropEvents(cell) {
      cell.addEventListener('dragover', function (e) {
        e.preventDefault();
        cell.classList.add('drag-over');
      });
  
      cell.addEventListener('dragleave', function () {
        cell.classList.remove('drag-over');
      });
  
      cell.addEventListener('drop', function (e) {
        e.preventDefault();
        cell.classList.remove('drag-over');
  
        var bookingId = e.dataTransfer.getData('text/plain') || dragBookingId;
        if (!bookingId) return;
  
        var booking = bookings.find(function (item) {
          return item.id === bookingId;
        });
  
        if (!booking) return;
  
        booking.room = cell.dataset.room;
        booking.startDay = Number(cell.dataset.day);
  
        renderAll();
      });
    }
  
    function renderAll() {
      renderGrid();
      renderBookings();
    }
  
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        currentStart = addDays(currentStart, -7);
        renderAll();
      });
    }
  
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        currentStart = addDays(currentStart, 7);
        renderAll();
      });
    }
  
    if (todayBtn) {
      todayBtn.addEventListener('click', function () {
        currentStart = startOfWeek(new Date());
        renderAll();
      });
    }
  
    renderAll();
  }

  // -------- Run on DOM ready --------
  function run() {
    initLoad();
    initReveal();
    initHeaderScroll();
    initNavToggle();
    initTabs();
    initPricingToggle();
    initNav();
    initCalendarDemo();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
