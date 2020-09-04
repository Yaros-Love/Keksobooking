'use strict';

(function () {
  var mapElement = window.const.mapElement;
  var deletePopup = window.util.deletePopup;
  var advertisement = [];
  var PINS_COUNT = 5; //количество отфильтрованных пинов на карте
  var settingsForFilter = window.settingsForFilter;
  var FILTERS_COUNT = 5; //кол-во проверяющих функций

  var price = {
    'any': 'any',
    'low': 10000,
    'middle': {
      'min': 10000,
      'max': 50000
    },
    'high': 50000
  };

  var rooms = {
    'any' : 'any',
    'one romm' : 1,
    'two rooms' : 2,
    'three rooms' : 3
  };

  var guests = {
    'any' : 'any',
    'not for guests' : 0,
    'one guest' : 1,
    'two guests' : 2
  }

  var updatePins = window.debounce(function () {
    deletePopup(mapElement.querySelector('article.popup')) //удаляем карточку объявления
    window.pin.createPins(countPins(filterPins()));
  });

  //отфильтрованные пины
  var filterPins = function () {
    var filteredPins = window.advertisement.filter(function (it) {
      return (checkType(it) + checkPrice(it) + checkRooms(it) + checkGuests(it) + checkFeatures(it)) === FILTERS_COUNT;
    });
    return filteredPins;
  };

  var checkType = function (it) {
    if (it.offer.type === settingsForFilter.type || settingsForFilter.type === 'any') {
      return true;
    };
  };

  var checkPrice = function (it) {
    switch (settingsForFilter.price) {
      case price.any: return true;
      case 'low': return (it.offer.price < price.low);
      case 'middle': return (it.offer.price >= price.middle.min && it.offer.price <= price.middle.max);
      case 'high': return (it.offer.price > price.high);
      default: return true;
    };
  };

  var checkRooms = function (it) {
    switch (settingsForFilter.rooms) {
      case rooms.any: return true;
      case '1': return (it.offer.rooms === rooms['one romm']);
      case '2': return (it.offer.rooms === rooms['two rooms']);
      case '3': return (it.offer.rooms === rooms['three rooms']);
      default: return true;
    };
  };

  var checkGuests = function (it) {
    switch (window.settingsForFilter.guests) {
      case guests.any: return true;
      case '0': return (it.offer.guests === guests['not for guests']);
      case '1': return (it.offer.guests === guests['one guest']);
      case '2': return (it.offer.guests === guests['two guests']);
      default: return true;
    };
  };

  var checkFeatures = function (it) {
    if (settingsForFilter.features.length === 0) {
      return true;
    };
    if (settingsForFilter.features.length > 0) {
      var count = 0;
      for (var i = 0; i < settingsForFilter.features.length + 1; i++) {
        if (it.offer.features.includes(settingsForFilter.features[i])) {
          count++;
        };
      };
    };
    if (count === settingsForFilter.features.length) {
      return true;
    };
  };

  //отображать максимум 5 отфильтрованных пинов
  var countPins = function (data) {
    return (data.slice(0, PINS_COUNT))
  };

  window.filter = {
    updatePins: updatePins,
    countPins: countPins,
    filterPins: filterPins
  };

})()