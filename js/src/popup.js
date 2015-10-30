require.config({
    baseUrl: "../js",
    waitSeconds: 15,
    map: {
        '*': {
            'css': 'lib/require-css/css'
        }
    }
});

require( ['../js/src/engine/engine.js'],
    function(Engine) {
        var eng = new Engine();
        window.eng = eng;

        eng.ready(function() {
            chrome.storage.sync.get(['serverUrl', 'timeOut', 'interval'], function(data) {
                eng.findComponent('servers').setData(
                    [
                        {url: data['serverUrl'], timeout: data['timeOut'], interval: data['interval']}
                    ]
                );
            });
        });

        eng.go();
    }
);
