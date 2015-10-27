/**
 * Информация о статусе сервера
 */

// Флаг, показывающий запущен ли опрос сервиса
var RUNNING = false;

var server = {
   'status': false,
   'last_status_time': new Date()
};

/**
 * Значения по-умолчанию
 */
var defaults = {
   'timeOut': 3000,
   'interval': 5000
};

/**
 * Функция выполняющая запрос к сервису и обновляющая иконку расширения
 */
var makeRequest = function() {
   chrome.storage.sync.get(['serverUrl', 'timeOut', 'interval'], function(data) {
      // Если не указан адрес сервиса, опрос не запускаем
      if(!data['serverUrl']) {
         server.status = null;
         chrome.browserAction.setIcon({
            path: 'icons/dead.png'
         });
         chrome.browserAction.setBadgeText({text: ''});
         RUNNING = false;
         return;
      }
      $.ajax({
         url: data['serverUrl'], 
         type: 'get',
         timeout: data['timeOut'],
         xhrFields: {
            withCredentials: true
         },
         error: function(XMLHttpRequest, textStatus, errorThrown){
            chrome.browserAction.setIcon({
               path: 'icons/dead.png'
            });
            if (server.status !== false) {
               server.last_status_time = new Date();
            }
            server.status = false;
         },
         success: function(data){
            chrome.browserAction.setIcon({
               path: 'icons/alive.png'
            });
            if (server.status !== true) {
               server.last_status_time = new Date();
            }
            server.status = true;
         },
         complete: function() {
            chrome.browserAction.setBadgeText({
               text: getTimeDeltaString(new Date(), server['last_status_time'])});
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
 * Запускает опрос сервиса при наличии необходимых данных
 */
var run = function() {
   chrome.storage.sync.get(['serverUrl', 'timeOut', 'interval'], function(data) {
      // Если значения интервала и тайм-аута не заданы пользователем,
      // ставим значения по-умолчанию
      chrome.storage.sync.set({
         'timeOut': data['timeOut'] || defaults['timeOut'],
         'interval': data['interval'] || defaults['interval']
      });
      // Если не указан адрес сервиса, опрос не запускаем
      if(!data['serverUrl']) {
         return;
      }
      RUNNING = true;
      makeRequest();
   });
};

/**
 * Подписываемся на изменения информации в хранилище, чтобы запустить опрос,
 * если он ещё не был запущен (URL не указан)
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
   // Если поменялся адрес сервиса, сбрасываем информацию о статусе
   if ('serverUrl' in changes) {
      server.status = null;
      chrome.browserAction.setIcon({
         path: 'icons/dead.png'
      });
      chrome.browserAction.setBadgeText({text: ''});
   }
   if (!RUNNING) {
      run();
   }
});

/**
 * Инициализируем расширение и запускаем опрос сервиса
 */
window.onload = function() {
   chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 255, 255]});
   run();
};
