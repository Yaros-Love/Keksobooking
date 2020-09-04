'use strict';
//модуль, который управляет карточками объявлений и пинами: добавляет на страницу нужную карточку, отрисовывает пины и осуществляет взаимодействие карточки и метки на карте

(function () {
  var load = window.backend.load; //get запрос
  var formSubmitButt = document.querySelector('.ad-form__submit');
  var mapElement = window.const.mapElement;
  var mapPinMainElem = window.const.mapPinMainElem//главная метка на карте
  var mapPinMainWidth = window.const.mapPinMainWidth;
  var mapPinMainHeight = window.const.mapPinMainHeight;
  var mapFiltersElem = document.querySelector('.map__filters');//форма с фильтрами для объявлений
  var mapOverlayElem = window.const.mapOverlayElem;
  var ENTER_KEYCODE = window.const.ENTER_KEYCODE;
  var ESCAPE_KEYCODE = window.const.ESCAPE_KEYCODE;
  //допустимый диапазон по Х для пинов на элемете .map__overlay
  var MAP_OVERLAY_WIDTH = window.const.MAP_OVERLAY_WIDTH;
  //допустимый диапазон по Y для пинов на элемете .map__overlay
  var MAP_OVERLAY_HEIGTH = window.const.MAP_OVERLAY_HEIGTH
  var addFormElement = window.const.addFormElement;
  var addFormTextarea = addFormElement.querySelector('textarea');
  var addFormFieldsets = addFormElement.querySelectorAll('fieldset');//Fieldsets в форме, кот нужно сделать активными
  var addFormButtons = addFormElement.querySelectorAll('button');
  var mapFiltersSelects = mapFiltersElem.querySelectorAll('select'); //select в форме фильтров
  var mapFiltersFieldset = mapFiltersElem.querySelector('fieldset'); //fielset в форме фильтров
  var PIN_ARROW_HEIGHT = window.const.PIN_ARROW_HEIGHT;
  var onLoadSucsess = window.backend.onLoadSucsess;//при успешном ответе
  var onErrorLoad = window.backend.onErrorLoad;//при ошибках
  var onKeyClick = window.util.onKeyClick; //действия по нажатию клавиши
  var onEscapeButClose = window.util.onEscapeButClose;

  var onErrorLoad = function (message) {
    showErrorPopup(message);
    hideMap();
    mapPinMainElem.addEventListener('mousedown', onMainPinClick)
  };

  //переключение карты и форм в активное состояние
  var showMap = function () {
    mapElement.classList.toggle('map--faded', false);
    addFormElement.classList.toggle('ad-form--disabled', false);
    mapFiltersElem.classList.toggle('ad-form--disabled', false);

    mapFiltersFieldset.removeAttribute('disabled');
    addFormTextarea.removeAttribute('disabled');
    for (var select of mapFiltersSelects) {
      select.removeAttribute('disabled')
    };
    for (var fieldset of addFormFieldsets) {
      fieldset.removeAttribute('disabled');
    };
    for (var button of addFormButtons) {
      button.removeAttribute('disabled');
    }
  };

  //переключение карты и форм в ytактивное состояние
  var hideMap = function () {
    for (var select of mapFiltersSelects) {
      select.setAttribute('disabled', true)
    };
    for (var fieldset of addFormFieldsets) {
      fieldset.setAttribute('disabled', true);
    };
    for (var button of addFormButtons) {
      button.setAttribute('disabled', true);
    }
    mapFiltersFieldset.setAttribute('disabled', true);
    addFormTextarea.setAttribute('disabled', true);
    mapElement.classList.toggle('map--faded', true);
    addFormElement.classList.toggle('ad-form--disabled', true);
    mapFiltersElem.classList.toggle('ad-form--disabled', true);
  };

//отрисовка и поведение сообщения об удачной загрузки
var showSuccessPopup = function () {
  var template = document.querySelector('#success').content;
  var successElem = template.cloneNode(true);
  successElem.querySelector('.success__message').textContent = 'Форма успешно отправленна!';
  document.querySelector('main').appendChild(successElem);

  var successElem = document.querySelector('.success');
  document.addEventListener('keydown', function (evt) {
    onEscapeButClose(evt, function () {
      deletePopup(successElem)
    })
  })
  document.addEventListener('click', function () {
    deletePopup(successElem)
  });
};

//отрисовка и поведение сообщения с ошибкой
var showErrorPopup = function (message) {
  console.log(message)
  var template = document.querySelector('#error').content;
  var errorElem = template.cloneNode(true);

  errorElem.querySelector('.error__message').textContent = message;
  document.querySelector('main').appendChild(errorElem);
  var errorPopup = document.querySelector('.error');
  var errorButton = document.querySelector('.error__button');
  document.addEventListener('keydown', function (evt) {
    onEscapeButClose(evt, function () {
      deletePopup(errorPopup)
    })
  });

  errorButton.addEventListener('click', function () {
    deletePopup(errorPopup);
    formSubmitButt.removeAttribute('disabled');
  });
  errorButton.addEventListener('keydown', function () {
    onEnterButClose(evt, function () {
      deletePopup(errorPopup);
      formSubmitButt.removeAttribute('disabled');
    });
  });
}

//события по клику на главный пин, ф-я обработчик!
  var onMainPinClick = function () {
    showMap();
    load(onLoadSucsess, onErrorLoad)
    mapPinMainElem.removeEventListener('mousedown', onMainPinClick)
  }

  //слушатель по нажатию мыши на метку
  mapPinMainElem.addEventListener('mousedown', onMainPinClick)

  // слушатель по нажатию enter
  mapPinMainElem.addEventListener('keydown', function (evt) {
    onKeyClick(evt, onMainPinClick, ENTER_KEYCODE);
  })

  //удаление/закрытие попапа с ошибкой и удаление слушателя с документа
  var deletePopup = function (element) {
    if (document.contains(element)) {
      element.remove();
      document.removeEventListener('keydown', onEscapeButClose)
    }
  };

  //удаление popup по enter
  var onEnterButClose = function (evt, foo) {
    if (evt.keyCode === ENTER_KEYCODE) {
      foo();
    }
  }

  //перетаскивание главной метки по карте
  var dragged; //флаг перетаскивания
  var coordsLimit = mapOverlayElem.getBoundingClientRect();

  //ограничения за которые нельзя перетащить главный пин
  var limits = {
    top: MAP_OVERLAY_HEIGTH.min - mapPinMainHeight * 0.5 - PIN_ARROW_HEIGHT,
    rigth: MAP_OVERLAY_WIDTH.max,
    bottom: MAP_OVERLAY_HEIGTH.max - mapPinMainHeight * 0.5 - PIN_ARROW_HEIGHT,
    left: MAP_OVERLAY_WIDTH.min
  };

  mapPinMainElem.addEventListener('mousedown', function (evt) {
    evt.preventDefault();
    dragged = true;

    var onMouseMove = function (moveEvt) {
      moveEvt.preventDefault();
      if (dragged) {
        var newLocaton = {
          x: limits.left,
          y: limits.top
        };
        if (moveEvt.clientX > limits.rigth + coordsLimit.x) {
          newLocaton.x = limits.rigth;
        }
        else if (moveEvt.clientX > limits.left + coordsLimit.x) {
          newLocaton.x = moveEvt.clientX - coordsLimit.x;
        }
        if (moveEvt.clientY > limits.bottom - pageYOffset) {
          newLocaton.y = limits.bottom - pageYOffset;
        }
        else if (moveEvt.clientY > limits.top - pageYOffset) {
          newLocaton.y = moveEvt.clientY;
        }
        //координаты метки с корректировкой относительно размеров метки
        mapPinMainElem.style.top = newLocaton.y + pageYOffset - mapPinMainHeight * 0.5 + 'px';
        mapPinMainElem.style.left = newLocaton.x - mapPinMainWidth * 0.5 + 'px';
      }
    };
    var onMouseUp = function (upEvt) {
      upEvt.preventDefault();
      dragged = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });


  window.map = {
    // onPinClickShowPopup : onPinClickShowPopup,
    onEnterButClose: onEnterButClose,
    onEscapeButClose: onEscapeButClose,
    deletePopup: deletePopup,
    showErrorPopup: showErrorPopup,
    showSuccessPopup: showSuccessPopup,
    hideMap: hideMap,
    showMap: showMap,
    onMainPinClick : onMainPinClick
  }
})()


