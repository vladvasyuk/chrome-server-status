var bg = chrome.extension.getBackgroundPage();

var updateStatus = function() {
   for (service in bg.services) {
      if (bg.services.hasOwnProperty(service)) {
         if (bg.services[service].status) {
            status = 'работает';
         } else {
            status = 'не работает';
         }
         $('ul li[data-url="' + service + '"] span').html(status);
      }
   }
};

updateStatus();
setInterval(updateStatus, 1000);
