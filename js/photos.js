'use strict';

(function () {
  var FILE_TYPES = window.const.FILE_TYPES;
  var fileChooser = document.querySelector('.ad-form__upload input[type=file]');
  var preview = document.querySelector('.ad-form__photo')


  fileChooser.addEventListener('change', function () {
    var arrayFiles = Array.from(fileChooser.files);

    arrayFiles.forEach(function (it) {
      var file = it;
      var fileName = file.name.toLowerCase();

      var matches = FILE_TYPES.some(function (it) {
        return fileName.endsWith(it);
      });

      if (matches) {
        var reader = new FileReader();
        reader.addEventListener('load', function () {
          var newImg = document.createElement('img');
          preview.appendChild(newImg);
          console.log(reader.result)
          newImg.src = reader.result;
          newImg.style.width = 45 + 'px';
          newImg.style.height = 45 + 'px';
          newImg.style.margin = 1 + 'px';
        });
      };
      reader.readAsDataURL(file);
    });
  });

})();