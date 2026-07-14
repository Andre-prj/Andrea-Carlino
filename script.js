(function () {
  var boatWrap = document.querySelector('.boat-wrap');
  var pressCircle = document.querySelector('.press-circle');

  boatWrap.addEventListener('click', function () {
    if (pressCircle.style.display === 'none') boatWrap.classList.toggle('dark');
  });

  pressCircle.addEventListener('click', function (event) {
    event.stopPropagation();
    boatWrap.classList.toggle('dark');
    pressCircle.style.display = 'none';
  });

  var aqua = [[26, 143, 181], [20, 110, 150]], deep = [[5, 30, 50], [3, 20, 32]];
  function mix(a, b, t) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }); }
  function updateSea() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    var top = mix(aqua[0], deep[0], t), bottom = mix(aqua[1], deep[1], t);
    document.documentElement.style.setProperty('--sea-top', 'rgb(' + top + ')');
    document.documentElement.style.setProperty('--sea-bottom', 'rgb(' + bottom + ')');
  }
  window.addEventListener('scroll', updateSea, { passive: true });
  updateSea();
})();

(function () {
  var listGroup = document.querySelector('.library-list');
  var startY = 1395, spacing = 85;
  fetch('books.txt').then(function (r) { return r.text(); }).then(function (text) {
    var books = text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    [books, books].forEach(function (block, blockIndex) {
      block.forEach(function (title, i) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        el.setAttribute('x', 320);
        el.setAttribute('y', startY + (blockIndex * books.length + i) * spacing);
        el.textContent = title;
        listGroup.appendChild(el);
      });
    });
    listGroup.style.setProperty('--scroll-dist', (-(books.length * spacing)) + 'px');
  });
})();

(function () {
  function init() {
    var canvas = document.getElementById('globe');
    if (!canvas || typeof d3 === 'undefined') return;
    var context = canvas.getContext('2d');
    var size = canvas.width;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = size * dpr;
    context.scale(dpr, dpr);
    var radius = size / 2 - 34;
    var projection = d3.geoOrthographic().scale(radius).translate([size / 2, size / 2]).clipAngle(90);
    var path = d3.geoPath(projection, context);
    var graticule = d3.geoGraticule10();
    var rotation = [10, -12];
    var countries = null;
    Promise.all([
      fetch('countries.txt').then(function (r) { return r.text(); }),
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(function (r) { return r.json(); })
    ]).then(function (results) {
      var lines = results[0].split('\n');
      var targetNames = lines.filter(function (l) { return /\]\s*yes\s*$/i.test(l); })
        .map(function (l) { return l.trim().replace(/^\[/, '').replace(/\]\s*yes\s*$/i, ''); });
      var feats = topojson.feature(results[1], results[1].objects.countries).features;
      countries = feats.filter(function (f) { return targetNames.indexOf(f.properties.name) !== -1; });
    }).catch(function () { countries = []; });
    function drawPin(x, y, ballScale, rodScale, angle) {
      var s = Math.max(ballScale, 0.02);
      var rodLength = 19 * Math.max(rodScale, 0.02), rodWidth = 1.5 * s;
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.beginPath();
      context.ellipse(0, 1, rodWidth * 1.6, rodWidth * 0.7, 0, 0, Math.PI * 2);
      context.fillStyle = 'rgba(0,0,0,0.16)';
      context.fill();
      var rodGrad = context.createLinearGradient(-rodWidth / 2, 0, rodWidth / 2, 0);
      rodGrad.addColorStop(0, '#6b7178'); rodGrad.addColorStop(0.5, '#e4e7ea'); rodGrad.addColorStop(1, '#4d5257');
      context.fillStyle = rodGrad;
      context.fillRect(-rodWidth / 2, -rodLength, rodWidth, rodLength);
      var ballR = 3.1 * s;
      var ballGrad = context.createRadialGradient(-ballR * 0.3, -rodLength - ballR * 0.35, ballR * 0.15, 0, -rodLength, ballR);
      ballGrad.addColorStop(0, '#ff7a6b'); ballGrad.addColorStop(0.55, '#c0392b'); ballGrad.addColorStop(1, '#7e2015');
      context.beginPath();
      context.arc(0, -rodLength, ballR, 0, Math.PI * 2);
      context.fillStyle = ballGrad;
      context.fill();
      context.restore();
    }
    function render() {
      context.clearRect(0, 0, size, size);
      projection.rotate(rotation);
      context.save();
      context.shadowColor = 'rgba(0,0,0,0.65)'; context.shadowBlur = 8;
      context.shadowOffsetX = -3; context.shadowOffsetY = 5;
      context.beginPath(); path({ type: 'Sphere' }); context.fillStyle = '#cdd2d6'; context.fill();
      context.restore();
      context.save();
      context.shadowColor = 'rgba(0,0,0,0.55)'; context.shadowBlur = 2;
      context.shadowOffsetX = -1; context.shadowOffsetY = 2;
      context.beginPath(); path({ type: 'Sphere' }); context.fillStyle = '#cdd2d6'; context.fill();
      context.restore();
      context.save();
      context.globalCompositeOperation = 'source-atop';
      var lightGrad = context.createRadialGradient(size * 0.68, size * 0.26, 0, size * 0.68, size * 0.26, size * 0.45);
      lightGrad.addColorStop(0, 'rgba(255,255,255,0.75)'); lightGrad.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = lightGrad; context.fillRect(0, 0, size, size);
      var shadeGrad = context.createRadialGradient(size * 0.3, size * 0.76, 0, size * 0.3, size * 0.76, size * 0.5);
      shadeGrad.addColorStop(0, 'rgba(0,0,0,0.4)'); shadeGrad.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = shadeGrad; context.fillRect(0, 0, size, size);
      context.restore();
      context.beginPath(); path(graticule); context.strokeStyle = 'rgba(20,20,20,0.07)'; context.lineWidth = 0.6; context.stroke();
      context.beginPath(); path({ type: 'Sphere' }); context.strokeStyle = 'rgba(20,20,20,0.22)'; context.lineWidth = 1; context.stroke();
      if (countries && countries.length) {
        countries.forEach(function (f) {
          context.save();
          context.shadowColor = 'rgba(37,99,235,0.9)'; context.shadowBlur = 14;
          context.beginPath(); path(f); context.fillStyle = 'rgba(59,130,246,0.55)'; context.fill();
          context.restore();
          context.beginPath(); path(f); context.strokeStyle = 'rgba(29,78,216,0.9)'; context.lineWidth = 1.1; context.stroke();
        });
      }
      var rotateFn = d3.geoRotation(rotation);
      var pins = [];
      (countries || []).forEach(function (f) {
        var coord = d3.geoCentroid(f);
        var xy = projection(coord);
        if (!xy) return;
        var r = rotateFn(coord);
        var lambda = (r[0] * Math.PI) / 180, phi = (r[1] * Math.PI) / 180;
        var z = Math.cos(phi) * Math.cos(lambda);
        if (z < 0) return;
        pins.push({ x: xy[0], y: xy[1], z: z });
      });
      pins.sort(function (a, b) { return a.z - b.z; });
      pins.forEach(function (p) {
        var ballScale = 0.5 + 0.5 * p.z;
        var rodScale = Math.sqrt(Math.max(0, 1 - p.z * p.z));
        var angle = Math.atan2(p.x - size / 2, -(p.y - size / 2));
        drawPin(p.x, p.y, ballScale, rodScale, angle);
      });
    }
    function tick() { rotation[0] += 0.55; render(); requestAnimationFrame(tick); }
    tick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
