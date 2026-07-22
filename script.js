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
