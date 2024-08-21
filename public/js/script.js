// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict';
  window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

//Search Box
let box = document.getElementById('search-box');
let search = document.getElementById("search");
let searchBtn = document.getElementById("search-btn");
document.addEventListener('click', function (event) {
  // Check if the click was outside the button
  if (!box.contains(event.target)) {
    searchBtn.classList.remove('clicked');
    search.style.display = 'none';
  }
});

box.addEventListener('click', function (event) {
  console.log(searchBtn);
  search.style.display = "block";
  searchBtn.classList.add('clicked');
  // searchBtn.classList.remove('unclicked');
  event.stopPropagation(); // Prevents the event from bubbling up to the document
});