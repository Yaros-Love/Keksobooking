'use strict';

(function () {
  var URL = 'https://javascript.pages.academy/keksobooking/data';//для GET
  var URL_POST = 'https://javascript.pages.academy/keksobooking'//для POST
  var TIME_OUT = 10000;

  var load = function (onLoad, onError) {
    setConnection(URL, onLoad, onError, 'GET').send();
  };

  var save = function (data, onLoad, onError) {
    setConnection(URL_POST, onLoad, onError, 'POST').send(data);
  };

  //ф-я обрабатывает запрос, успешный и ошибочный
  var setConnection = function (url, onLoad, onError, method) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.addEventListener('load', function () {
      if (xhr.status === 200) {
        if (xhr.responseURL === 'https://javascript.pages.academy/keksobooking/data') {
          window.advertisement = xhr.response;
          window.pin.createPins(window.filter.countPins(advertisement));//отрисовываем пины по нажатию главного пина на скрытой карте
        }
        if (xhr.responseURL === 'https://javascript.pages.academy/keksobooking') {
          onLoad();
        }
        console.log('Cтатус ответа: ' + xhr.status + ' ' + xhr.statusTex)
      }
      else {
        switch (xhr.status) {
          case 404: onError('Неверный запрос');
            break;
          case 500: onError('Ошибка сервера');
            break;
          case 505: onError('Сервер не найден');
            break;
          default: onError('Произошла ошибка соединения');
        }
      };
    });

    xhr.addEventListener('error', function () {
      onError('Произошла ошибка соединения');
    });

    xhr.addEventListener('timeout', function () {
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });
    xhr.timeout = TIME_OUT; //10s

    xhr.open(method, url);

    return xhr
  };

  window.backend = {
    load: load,
    save: save
  }
})();


