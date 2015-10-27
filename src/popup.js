var bg = chrome.extension.getBackgroundPage();

/**
 * Сохраняет значения из формы в хранилище
 */
var saveChanges = function() {
   chrome.storage.sync.set({
      'serverUrl': $('#serverUrl').val(),
      'timeOut': $('#timeOut').val(),
      'interval': $('#interval').val()
   }, function() {
      bg.console.log('New values saved.');
   });
};

$(document).ready(function() {
   // При открытии ставим в поля значения из хранилища
   chrome.storage.sync.get(['serverUrl', 'timeOut', 'interval'], function(data) {
      $('#serverUrl').val(data['serverUrl']);
      $('#timeOut').val(data['timeOut']);
      $('#interval').val(data['interval']);
   });

   // При нажатии на "Сохранить" сохраняем изменения и закрываем окно
   $('#saveChanges').click(function() {
      saveChanges();
      window.close();
   });
});
