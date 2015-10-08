/**
 * Информация о статусе сервера
 */
var service = {
   'status': false,
   'last_status_time': new Date()
};

/**
 * Значения по-умолчанию
 */
var defaults = {
   'serviceUrl': 'http://test-online.sbis.ru/service/sbis-rpc-service300.dll',
   'timeOut': 3000,
   'interval': 5000
};

/**
 * Функция выполняющая запрос к сервису и обновляющая иконку расширения
 */
var makeRequest = function() {
   chrome.storage.sync.get(['serviceUrl', 'timeOut', 'interval'], function(data) {
      $.ajax({
         url: data['serviceUrl'], 
         type: 'get',
         timeout: data['timeOut'],
         xhrFields: {
            withCredentials: true
         },
         error: function(XMLHttpRequest, textStatus, errorThrown){
            chrome.browserAction.setIcon({
               path: 'icons/dead.png'
            });
            if (service.status !== false) {
               service.last_status_time = new Date();
            }
            service.status = false;
         },
         success: function(data){
            chrome.browserAction.setIcon({
               path: 'icons/alive.png'
            });
            if (service.status !== true) {
               service.last_status_time = new Date();
            }
            service.status = true;
         },
         complete: function() {
            chrome.browserAction.setBadgeText({
               text: getTimeDeltaString(new Date(), service['last_status_time'])});
            setTimeout(function() {
               makeRequest();
            }, data['interval']);
         }
      });
   });
};

/**
 * Функция-хелпер. Переводит временной промежуток в удобочитаему строку
 */
var getTimeDeltaString = function(time1, time2) {
   var deltaMs = time1 - time2;
   var deltaS = Math.floor(deltaMs / 1000);
   if (deltaS < 60) {
      return deltaS + 's';
   } else if (deltaS < 60*60) {
      return Math.floor(deltaS / 60) + 'm';
   } else {
      return Math.floor(deltaS / (60 * 60)) + 'h';
   }
};

/**
 * При загрузке расширения запускаем первый запрос, который будет вызывать себя
 * рекурсивно
 */
window.onload = function() {
   chrome.storage.sync.get(['serviceUrl', 'timeOut', 'interval'], function(data) {
      // Если значения не заданы пользователем, ставим значения по-умолчанию
      chrome.storage.sync.set({
         'serviceUrl': data['serviceUrl'] || defaults['serviceUrl'],
         'timeOut': data['timeOut'] || defaults['timeOut'],
         'interval': data['interval'] || defaults['interval']
      });
      chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 255, 255]});
      makeRequest();
   });
};
