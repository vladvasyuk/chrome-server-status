require.config({
    baseUrl: "../js",
    waitSeconds: 15,
    map: {
        '*': {
            'css': 'lib/require-css/css'
        }
    }
});

/**
 * [updateView description]
 * @return {[type]} [description]
 */
function updateView() {
    chrome.storage.sync.get(['servers'], function(data) {
        if (data['servers'].length) {
            eng.findComponent('servers').setData(data['servers']);
        } else {
            eng.findComponent('servers').addRow();
        }
    });
}

require([
    '../js/src/engine/engine.js',
    '../js/src/engine/validators.js'
    ],
    function(Engine, Validators) {
        var eng = new Engine();
        window.eng = eng;
        var bg = chrome.extension.getBackgroundPage();

        setInterval(function() { $('body, html').height($('body > div').height()) }, 100);

        eng.ready(function() {
            var serversTable = eng.findComponent('servers');

            // init add button
            $('#addServer').click(function() {
                serversTable.addRow();
            });

            // init servers data table
            $(serversTable).on('dataChanged', function() {
                chrome.storage.sync.set({
                    'servers': serversTable.getData()
                }, function() {
                    bg.updateData();
                });
            });

            serversTable.setValidators({
                'url': [
                    Validators.required('Please, specify server url')
                ],
                'interval': [
                    Validators.required('Interval is required'),
                    Validators.minValue(5000, 'Minimum value for interval is 5000ms')
                ],
                'timeout': [
                    Validators.required('Timeout is required'),
                    Validators.minValue(5000, 'Minimum value for timeout is 5000ms')
                ]
            });

            // on collection data changed - reload table
            chrome.storage.onChanged.addListener(function(changes, namespace) {
                if (!serversTable.isThereDrafts()) {
                    updateView();
                }
            });
            updateView();
        });

        eng.go();
    }
);
