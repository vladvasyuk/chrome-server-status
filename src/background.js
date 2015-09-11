var services = {
   'test-online.sbis.ru': {
      'url': 'https://test-online.sbis.ru/service/sbis-rpc-service300.dll',
      'status': false,
      'main': true
   },
   'test-inside.tensor.ru': {
      'url': 'https://test-inside.tensor.ru/service/sbis-rpc-service300.dll',
      'status': false,
      'main': false
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
         }
         service.status = false;
      },
      success: function(data){
         if (service.main) {
            chrome.browserAction.setIcon({
               path: 'icons/alive.png'
            });
         }
         service.status = true;
      },
      complete: function() {
         setTimeout(function() {
            makeRequest(service);
         }, 5000);
      }
   });
};

window.onload = function() {
   for (service in services) {
      if (services.hasOwnProperty(service)) {
         makeRequest(services[service]);
      }
   }
};
