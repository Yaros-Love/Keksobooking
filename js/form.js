'use strict';
// модуль с валидацией форм

(function () {
  var save = window.backend.save;
  var deletePins = window.pin.deletePins; //удаление пинов
  var deletePopup = window.map.deletePopup;//удаление карточки объявления
  var mapPinMainElem = window.const.mapPinMainElem//главная метка на карте
  var showErrorPopup = window.map.showErrorPopup;//ф-я отрисовки ошибки и ее поведения
  var showSuccessPopup = window.map.showSuccessPopup;//отрисовка и поведение сообщения об удачной закгрузки
  var onMainPinClick = window.map.onMainPinClick; //слушатель по клику на главном пине
  var mapPinMainWidth = window.const.mapPinMainWidth;
  var mapPinMainHeight = window.const.mapPinMainHeight;
  var mapElement = window.const.mapElement;
  var addFormElement = window.const.addFormElement;
  var PIN_ARROW_HEIGHT = window.const.PIN_ARROW_HEIGHT;
  var updatePins = window.filter.updatePins;
  var setDefaultPositionPin = window.pin.setDefaultPositionPin;
  var onPinClickShowPopup = window.pin.onPinClickShowPopup;
  var hideMap = window.map.hideMap;
  var formSubmitButt = document.querySelector('.ad-form__submit');
  var inputAddress = document.querySelector('#address');
  var housingType = document.querySelector('#housing-type');
  var housingPrice = document.querySelector('#housing-price');
  var housingRooms = document.querySelector('#housing-rooms');
  var housingGuests = document.querySelector('#housing-guests');
  var housingFeatures = document.querySelector('#housing-features');

  //тк .reset() сбрасывает все значения, установим поля в нужное состояние
  var resetForm = function () {
    priceInputElement.setAttribute('min', '1000');
    priceInputElement.setAttribute('placeholder', '1 000')
  }

  var onUnLoadSucsess = function (message) {
    console.log(message)
    showSuccessPopup();
    addFormElement.reset(); //сбрасываем значения
    setDefaultPositionPin();//устанавливаем пин в нач положение
    deletePopup(document.querySelector('article.popup'));//удалем карточку объявления
    deletePins();//удаляем пины
    mapPinMainElem.addEventListener('mousedown', onMainPinClick)//слушатель загрузки на пин
    hideMap();
  };

  var onErrorUnLoad = function (message) {
    showErrorPopup(message);
    formSubmitButt.setAttribute('disabled', true)

  };

  /// переменные координат x и y для адреса
  var positionXAddress;
  var positionYAddress;

  ///координаты метки в неактивном состоянии
  var valueAddressDisabled = function () {
    positionXAddress = Math.floor(mapPinMainElem.offsetLeft + mapPinMainWidth * 0.5);
    positionYAddress = Math.floor(mapPinMainElem.offsetTop + mapPinMainHeight * 0.5);
    inputAddress.value = positionXAddress + ', ' + positionYAddress;
    if (mapElement.classList.contains('map--faded') === true) {
      valueAddressDisabled();
    }
  }

  /// координаты в активном при нажатии мышью на маркер
  mapPinMainElem.addEventListener('mousemove', function () {
    positionXAddress = Math.floor(mapPinMainElem.offsetLeft + mapPinMainWidth * 0.5);
    positionYAddress = Math.floor(mapPinMainElem.offsetTop + mapPinMainHeight + PIN_ARROW_HEIGHT);
    inputAddress.value = positionXAddress + ', ' + positionYAddress;
  })

  // валидация полей с комнатами и количеством гостей
  var roomNumberSelect = document.querySelector('#room_number');
  var capacitySelect = document.querySelector('#capacity');

  var checkValidRooms = function () {
    if (roomNumberSelect.value === '100' && capacitySelect.value !== '0') {
      roomNumberSelect.setCustomValidity('Количетво комнат явно не для гостей')
      return (roomNumberSelect.reportValidity(), capacitySelect.setCustomValidity(""))
    }

    if (roomNumberSelect.value !== '100' && capacitySelect.value === '0') {
      capacitySelect.setCustomValidity('Выберите количество гостей')
      return (capacitySelect.reportValidity(), roomNumberSelect.setCustomValidity(""))
    }

    if (roomNumberSelect.value < capacitySelect.value) {
      roomNumberSelect.setCustomValidity('Количество комнат не должно быть меньше количества гостей!')
      return (roomNumberSelect.reportValidity(), capacitySelect.setCustomValidity(""))
    }

    else {
      roomNumberSelect.setCustomValidity("");
      capacitySelect.setCustomValidity("");
      return
    }
  }

  // слушатели на изм значений в полях "гостей" и "комнат"
  roomNumberSelect.addEventListener('input', checkValidRooms);
  capacitySelect.addEventListener('input', checkValidRooms);

  //валидация вида жилья и стоимости
  var typeSelectElement = document.querySelector('#type');
  var priceInputElement = document.querySelector('#price');

  typeSelectElement.addEventListener('input', function () {
    if (typeSelectElement.value === 'bungalo') {
      priceInputElement.setAttribute('min', '0');
      priceInputElement.setAttribute('placeholder', '0')
    }
    if (typeSelectElement.value === 'flat') {
      priceInputElement.setAttribute('min', '1000');
      priceInputElement.setAttribute('placeholder', '1 000')
    }
    if (typeSelectElement.value === 'house') {
      priceInputElement.setAttribute('min', '5000');
      priceInputElement.setAttribute('placeholder', '5 000')
    }
    if (typeSelectElement.value === 'palace') {
      priceInputElement.setAttribute('min', '10000');
      priceInputElement.setAttribute('placeholder', '10 000')
    }
  })

  //валидация времени заезда и выезда
  var timeinSelectElement = document.querySelector('#timein');
  var timeoutSelectElement = document.querySelector('#timeout');

  timeinSelectElement.addEventListener('change', function () {
    timeoutSelectElement.value = timeinSelectElement.value;
  })
  timeoutSelectElement.addEventListener('change', function () {
    timeinSelectElement.value = timeoutSelectElement.value
  })

  addFormElement.addEventListener('submit', function (evt) {
    save(new FormData(addFormElement), onUnLoadSucsess, showErrorPopup);
    resetForm();
    evt.preventDefault();
  });


  //слушатели, фильтры
  housingType.addEventListener('change', function () {
    window.settingsForFilter.type = housingType.value;
    updatePins();
  });

  housingPrice.addEventListener('change', function () {
    window.settingsForFilter.price = housingPrice.value;
    updatePins();
  })

  housingRooms.addEventListener('change', function () {
    window.settingsForFilter.rooms = housingRooms.value;
    updatePins();
  });

  housingGuests.addEventListener('change', function () {
    window.settingsForFilter.guests = housingGuests.value;
    updatePins();
  });

  var inputsFeatures = housingFeatures.querySelectorAll('input');
  inputsFeatures.forEach(function (input) {
    input.addEventListener('change', function () {
      if (input.checked == true) {
        window.settingsForFilter.features.push(input.value);
      };
      if (input.checked === false) {
       settingsForFilter.features.splice(settingsForFilter.features.indexOf(input.value), 1)
      }
      updatePins();
    });
  });

})()
