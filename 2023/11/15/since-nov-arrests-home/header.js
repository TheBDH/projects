document.addEventListener('DOMContentLoaded', function () {
  var header = document.getElementById('sticky-header');
  var headerHeight = header.offsetHeight;
  var headerPosition = document.getElementById('header').offsetTop;
  var triggerPosition = headerPosition + headerHeight;

  window.addEventListener('scroll', function () {
    var currentPosition = window.pageYOffset;

    if (currentPosition > triggerPosition) {
      // Scrolling down below the header
      header.style.top = '0';
    } else {
      // Scrolling up or above the header
      header.style.top = `-${headerHeight}px`;
    }
  });
});
