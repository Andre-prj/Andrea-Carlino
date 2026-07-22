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
    var radius = size / 2 - 10;
    var projection = d3.geoOrthographic().scale(radius).translate([size / 2, size / 2]).clipAngle(90);
    var path = d3.geoPath(projection, context);
    var rotation = [0, -12];
    var countries = [];
    Promise.all([
      fetch('countries.txt').then(function (r) { return r.text(); }),
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(function (r) { return r.json(); })
    ]).then(function (results) {
      var targetNames = results[0].split('\n')
        .filter(function (l) { return /\]\s*yes\s*$/i.test(l); })
        .map(function (l) { return l.trim().replace(/^\[/, '').replace(/\]\s*yes\s*$/i, ''); });
      var feats = topojson.feature(results[1], results[1].objects.countries).features;
      countries = feats.filter(function (f) { return targetNames.indexOf(f.properties.name) !== -1; });
    });
    function render() {
      context.clearRect(0, 0, size, size);
      projection.rotate(rotation);
      context.beginPath(); path({ type: 'Sphere' }); context.fillStyle = '#cdd2d6'; context.fill();
      context.beginPath(); path({ type: 'Sphere' }); context.strokeStyle = 'rgba(20,20,20,0.22)'; context.lineWidth = 1; context.stroke();
      countries.forEach(function (f) {
        context.beginPath(); path(f); context.fillStyle = '#95705F'; context.fill();
      });
    }
    function tick() {
      if (document.querySelector('.boat-wrap').classList.contains('dark')) { rotation[0] += 0.3; render(); }
      requestAnimationFrame(tick);
    }
    tick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
