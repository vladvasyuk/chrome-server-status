var services = {
   'test-online.sbis.ru': {
      'url': 'https://test-online.sbis.ru/service/sbis-rpc-service300.dll',
      'status': false,
      'main': true,
      'last_status_time': new Date()
   },
   'test-inside.tensor.ru': {
      'url': 'https://test-inside.tensor.ru/service/sbis-rpc-service300.dll',
      'status': false,
      'main': false,
      'last_status_time': new Date()
   }
};

var makeRequest = function(service) {
   $.ajax({
      url: service.url, 
      type: 'get',
      timeout: 3000,
      xhrFields: {
         withCredentials: true
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
         if (service.main) {
            chrome.browserAction.setIcon({
               path: 'icons/dead.png'
            });
            if (service.status !== false) {
               service.last_status_time = new Date();
            }
         }
         service.status = false;
      },
      success: function(data){
         if (service.main) {
            chrome.browserAction.setIcon({
               path: 'icons/alive.png'
            });
         }
         if (service.status !== true) {
            service.last_status_time = new Date();
         }
         service.status = true;
      },
      complete: function() {
         if (service.main) {
            chrome.browserAction.setBadgeText({
               text: getTimeDeltaString(new Date(), service['last_status_time'])});
         }
         setTimeout(function() {
            makeRequest(service);
         }, 5000);
      }
   });
};

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


window.onload = function() {
   chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 255, 255]});
   for (service in services) {
      if (services.hasOwnProperty(service)) {
         makeRequest(services[service]);
      }
   }
};
