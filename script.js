

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
  
    var BAR_OFFSET_X = 8;
    var BAR_OFFSET_Y = 6;
  
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
    
    function animateCalendarRefresh() {
      layer.style.opacity = '0.75';
      setTimeout(function () {
        renderAll();
        layer.style.opacity = '1';
      }, 120);
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
      corner.textContent = '';
      corner.setAttribute('aria-label', 'Date labels');
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

      var gridWidth = grid.offsetWidth;
      var gridHeight = grid.offsetHeight;
  
      bookings.forEach(function (booking) {
        if (booking.startDay >= visibleDays) return;
        if (booking.startDay + booking.nights <= 0) return;
  
        var clampedStart = Math.max(0, booking.startDay);
        var clampedEnd = Math.min(visibleDays, booking.startDay + booking.nights);
        var visibleSpan = clampedEnd - clampedStart;
  
        if (visibleSpan <= 0) return;

        var startCell = grid.querySelector('.dropzone[data-room="' + booking.room + '"][data-day="' + clampedStart + '"]');
        var endCell = grid.querySelector('.dropzone[data-room="' + booking.room + '"][data-day="' + (clampedEnd - 1) + '"]');
        if (!startCell || !endCell) return;
  
        var bar = document.createElement('div');
        bar.className = 'booking-bar ' + booking.status;
        bar.classList.add('room-' + booking.room);
        bar.draggable = true;
        bar.dataset.bookingId = booking.id;
  
        var top = startCell.offsetTop + BAR_OFFSET_Y;
        var left = startCell.offsetLeft + BAR_OFFSET_X;
        var width = Math.max(0, startCell.offsetWidth - BAR_OFFSET_X * 2);
        var height = Math.max(0, (endCell.offsetTop + endCell.offsetHeight) - startCell.offsetTop - BAR_OFFSET_Y * 2);

        bar.style.left = left + 'px';
        bar.style.top = top + 'px';
        bar.style.width = width + 'px';
        bar.style.height = height + 'px';
  
        bar.innerHTML =
          '<span class=\"booking-guest\">' + booking.guest + '</span>' +
          '<span class=\"booking-meta\">' + booking.nights + ' night' + (booking.nights > 1 ? 's' : '') + '</span>';
  
          bar.addEventListener('dragstart', function (e) {
            dragBookingId = booking.id;
            bar.classList.add('is-dragging');
            e.dataTransfer.setData('text/plain', booking.id);
          });
  
          bar.addEventListener('dragend', function () {
            dragBookingId = null;
            bar.classList.remove('is-dragging');
            clearDragStates();
          });
  
        layer.appendChild(bar);
      });
  
      layer.style.width = gridWidth + 'px';
      layer.style.height = gridHeight + 'px';
    }
  
    /** True if [startDay, startDay + nights) overlaps another booking in the same room (excluding ignoreId). */
    function bookingWouldOverlap(ignoreId, room, startDay, nights) {
      var newEnd = startDay + nights;
      for (var i = 0; i < bookings.length; i++) {
        var o = bookings[i];
        if (o.id === ignoreId) continue;
        if (o.room !== room) continue;
        var oEnd = o.startDay + o.nights;
        if (startDay < oEnd && o.startDay < newEnd) return true;
      }
      return false;
    }

    function clearDragStates() {
      grid.querySelectorAll('.dropzone.drag-over, .dropzone.drag-over-invalid').forEach(function (cell) {
        cell.classList.remove('drag-over', 'drag-over-invalid');
      });
    }
  
    function attachDropEvents(cell) {
      cell.addEventListener('dragover', function (e) {
        e.preventDefault();
        var dragged = dragBookingId
          ? bookings.find(function (item) {
              return item.id === dragBookingId;
            })
          : null;
        if (!dragged) {
          cell.classList.remove('drag-over-invalid');
          cell.classList.add('drag-over');
          return;
        }
        var room = cell.dataset.room;
        var day = Number(cell.dataset.day);
        var invalid = bookingWouldOverlap(dragged.id, room, day, dragged.nights);
        if (invalid) {
          e.dataTransfer.dropEffect = 'none';
          cell.classList.remove('drag-over');
          cell.classList.add('drag-over-invalid');
        } else {
          e.dataTransfer.dropEffect = 'move';
          cell.classList.remove('drag-over-invalid');
          cell.classList.add('drag-over');
        }
      });
  
      cell.addEventListener('dragleave', function () {
        cell.classList.remove('drag-over', 'drag-over-invalid');
      });
  
      cell.addEventListener('drop', function (e) {
        e.preventDefault();
        cell.classList.remove('drag-over', 'drag-over-invalid');
  
        var bookingId = e.dataTransfer.getData('text/plain') || dragBookingId;
        if (!bookingId) return;
  
        var booking = bookings.find(function (item) {
          return item.id === bookingId;
        });
  
        if (!booking) return;

        var targetRoom = cell.dataset.room;
        var targetDay = Number(cell.dataset.day);
        if (bookingWouldOverlap(booking.id, targetRoom, targetDay, booking.nights)) {
          return;
        }
  
        booking.room = targetRoom;
        booking.startDay = targetDay;

        renderAll();

        setTimeout(function () {
        var movedBar = layer.querySelector('[data-booking-id="' + booking.id + '"]');
        if (!movedBar) return;

        movedBar.style.transform = 'scale(1.02)';
        setTimeout(function () {
          movedBar.style.transform = '';
        }, 160);
        }, 20);
      });
    }
  
    function renderAll() {
      renderGrid();
      renderBookings();
    }
  
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        currentStart = addDays(currentStart, -7);
        animateCalendarRefresh();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        currentStart = addDays(currentStart, 7);
        animateCalendarRefresh();
      });
    }
    
    if (todayBtn) {
      todayBtn.addEventListener('click', function () {
        currentStart = startOfWeek(new Date());
        animateCalendarRefresh();
      });
    }

    window.addEventListener('resize', renderAll);
  
    renderAll();
  }

  function initContactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    var submitButton = form.querySelector('button[type="submit"]');
    var statusEl = document.createElement('p');
    statusEl.className = 'contact-form-status';
    statusEl.setAttribute('aria-live', 'polite');
    form.appendChild(statusEl);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var payload = {
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        message: String(data.get('message') || '').trim()
      };

      if (!payload.name || !payload.email || !payload.message) {
        statusEl.textContent = 'Please complete all fields.';
        return;
      }

      if (submitButton) submitButton.disabled = true;
      statusEl.textContent = 'Sending...';

      try {
        var response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Request failed with status ' + response.status);
        }

        form.reset();
        statusEl.textContent = 'Message sent. We will get back to you soon.';
      } catch (error) {
        statusEl.textContent = 'Could not send message. Please try again later.';
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  // -------- Run on DOM ready --------
  function run() {
    initLoad();
    initReveal();
    initHeaderScroll();
    initTabs();
    initPricingToggle();
    initNav();
    initCalendarDemo();
    initContactForm();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
