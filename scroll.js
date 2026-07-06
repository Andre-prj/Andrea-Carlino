(function () {
  function init() {
    var track = document.getElementById('track');
    if (!track) return;
    var panels = Array.prototype.slice.call(track.querySelectorAll('.panel'));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.topnav a'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));

    // convert vertical wheel input into horizontal motion
    track.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    function update() {
      var trackRect = track.getBoundingClientRect();
      var center = trackRect.left + trackRect.width / 2;
      var activeIndex = 0;
      var closest = Infinity;

      panels.forEach(function (panel, i) {
        var rect = panel.getBoundingClientRect();
        var panelCenter = rect.left + rect.width / 2;
        var offset = panelCenter - center;
        var progress = offset / (trackRect.width / 2);
        var clamped = Math.max(-1, Math.min(1, progress));

        var inner = panel.querySelector('.panel-inner');
        var numeral = panel.querySelector('.panel-index');

        if (inner) {
          inner.style.opacity = Math.max(0.06, 1 - Math.abs(clamped) * 1.05);
          inner.style.transform = 'translateX(' + (clamped * -46) + 'px)';
        }
        if (numeral) {
          numeral.style.transform = 'translate(-50%, -50%) translateX(' + (clamped * 130) + 'px)';
          numeral.style.opacity = 0.07 * (1 - Math.abs(clamped) * 0.6);
        }

        if (Math.abs(offset) < closest) {
          closest = Math.abs(offset);
          activeIndex = i;
        }
      });

      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', Number(a.dataset.index) === activeIndex);
      });
      dots.forEach(function (d) {
        d.classList.toggle('is-active', Number(d.dataset.index) === activeIndex);
      });
    }

    track.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update);

    function goTo(index) {
      var panel = panels[index];
      if (!panel) return;
      track.scrollTo({ left: panel.offsetLeft, behavior: 'smooth' });
    }

    navLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        goTo(Number(a.dataset.index));
      });
    });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        goTo(Number(d.dataset.index));
      });
    });

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
