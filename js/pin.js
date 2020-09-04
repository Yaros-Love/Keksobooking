'use strict';
// модуль, который отвечает за создание пина и карточки с объевлением

(function () {
  var cardTemplate = document.querySelector('#card'); //шаблон карточки объявления
  var mapPinsContainer = document.querySelector('.map__pins');//элемент с метками объявлений
  var mapPinMainElem = window.const.mapPinMainElem;//главная метка на карте
  var mapFiltersContainer = document.querySelector('.map__filters-container'); //элемент перед которым нужно вставлять карточку объявления на карте
  var onEscapeButClose = window.util.onEscapeButClose;
  var mapElement = window.const.mapElement;
  var deletePopup = window.util.deletePopup;
  // var onPinClickShowPopup = window.map.onPinClickShowPopup;
  var pinTemplate = document.querySelector('#pin'); //шаблон пина на карте
  var deleteChilds = window.util.deleteChilds;
  //объект с видом жилья
  var TYPE_LIVING_RUS = window.const.TYPE_LIVING_RUS;
  var START_LEFT = window.const.START_LEFT;
  var START_TOP = window.const.START_TOP;

  //ф-я установки главного пина в начальное положение
  var setDefaultPositionPin = function () {
    mapPinMainElem.style.left = START_LEFT + 'px';
    mapPinMainElem.style.top = START_TOP + 'px';
  }

  //ф-я создания пинов на карте
  var createPins = function (arrayObj) {
    //удаляем пины, если они есть
    deletePins();
    //контент шаблона для пина на карте
    var pinTempContent = pinTemplate.content;
    for (var j = 0; j < arrayObj.length; j++) {
      var pin = pinTempContent.cloneNode(true);
      var mapPinItem = pin.querySelector('.map__pin');
      mapPinItem.style.left = arrayObj[j].location.x + 'px';
      mapPinItem.style.top = arrayObj[j].location.y + 'px';
      mapPinItem.alt = arrayObj[j].offer.title;
      mapPinItem.value = j;
      pin.querySelector('img').src = arrayObj[j].author.avatar;
      mapPinsContainer.appendChild(pin);
    };
    onPinClickShowPopup(arrayObj);
  };

  // отрисовка карточки по клику, удаление popup если выбирается новый
  // находим все пины и слушает 'клик'
  var onPinClickShowPopup = function (data) {
    console.log(data)
    var pins = mapPinsContainer.querySelectorAll('button[type=button].map__pin');
    for (var pin of pins) {

      pin.addEventListener('click', function (evt) {
        //удаляем карточку, если она есть
        deletePopup(document.querySelector('article.popup'));

        var currentPin = data[evt.currentTarget.value]; //нажатый пин - объект
        window.pin.createCard(currentPin);

        //вешаем слушателя на esc
        document.addEventListener('keydown', function (evt) {
          onEscapeButClose(evt, function () {
            deletePopup(mapElement.querySelector('article.popup'))
          })
        });
        //вешаем слушателя на enter по кнопке .popup__close
        var popupClose = mapElement.querySelector('.popup__close');
        popupClose.addEventListener('click', function () {
          deletePopup(mapElement.querySelector('article.popup'));
        });
      })
    }
  };

  //удаление пинов на карте
  var deletePins = function () {
    var pins = mapPinsContainer.querySelectorAll('button[type=button].map__pin');
    for (var pin of pins) {
      pin.remove();
    }
  };

  //находим контент карточки
  var cardTempContent = cardTemplate.content;
  //ф-я создания карточки объявления на карте
  var createCard = function (data) {
    var card = cardTempContent.cloneNode(true);
    //заголовок
    card.querySelector('.popup__title').textContent = data.offer.title;
    //цена жилья
    card.querySelector('.popup__text--price').textContent = data.offer.price + ' р/ночь';
    //типы жилья
    card.querySelector('.popup__type').textContent = TYPE_LIVING_RUS[data.offer.type];
    //комнаты и гости
    card.querySelector('.popup__text--capacity').textContent = data.offer.rooms + ' комнаты для ' + data.offer.guests + ' гостей';
    //заезд, выезд
    card.querySelector('.popup__text--time').textContent = 'Заезд после ' + data.offer.checkin + ', выезд до ' + data.offer.checkout;

    //удобства, удаляем li, создаем новые в нужном количестве
    var popupFeatures = card.querySelector('.popup__features');
    deleteChilds(popupFeatures);

    for (var i = 0; i < data.offer.features.length; i++) {
      var createLi = document.createElement('li');
      createLi.classList.add('popup__feature', 'popup__feature--' + data.offer.features[i]);
      popupFeatures.appendChild(createLi)
    };

    //описание
    card.querySelector('.popup__description').textContent = data.offer.description;

    //добавляем галерею фотографий
    var popupPhotosElem = card.querySelector('.popup__photos');
    deleteChilds(popupPhotosElem);

    for (var i = 0; i < data.offer.photos.length; i++) {
      var createImg = document.createElement('img');
      createImg.classList.add('popup__photo');
      createImg.src = data.offer.photos[i];
      createImg.alt = 'Фотография жилья';
      createImg.style.width = 45 + 'px';
      createImg.style.height = 45 + 'px';
      popupPhotosElem.appendChild(createImg);
    }

    //аватарка
    card.querySelector('.popup__avatar').src = data.author.avatar;
    //добавляем в разметку перед след элементом:
    mapFiltersContainer.before(card);
  }

  // объект с данными, экспорт
  window.pin = {
    createPins: createPins,
    createCard: createCard,
    setDefaultPositionPin: setDefaultPositionPin,
    deletePins: deletePins,
    onPinClickShowPopup : onPinClickShowPopup
  }
})()
