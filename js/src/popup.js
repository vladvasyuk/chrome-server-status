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
 * [padZero description]
 * @param  {[type]} len [description]
 * @return {[type]}     [description]
 */
Number.prototype.padZero = function(len) {
    var s = String(this), c= '0';
    len = len || 2;
    while(s.length < len) s= c + s;
    return s;
};

/**
 * [updateView description]
 * @return {[type]} [description]
 */
function updateView() {
    chrome.storage.local.get(['servers'], function(data) {
        var serversTable = eng.findComponent('servers');
        data['servers'] = data['servers'] || {};
        serversTable.setData(data['servers'], true);
        if (!serversTable.isThereDrafts() && !serversTable.isThereEditing()) {
            // add empty row if there's no data
            if (!serversTable.getRowsCount(true)) {
                serversTable.addRow(true);
            }
        }
        serversTable.render();

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

        eng.ready(function() {
            var serversTable = eng.findComponent('servers');

            // init add button
            $('#addServer').click(function() {
                serversTable.addRow();
            });

            // init servers data table
            $(serversTable).on('dataChanged', function() {
                chrome.storage.local.set({
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
                    Validators.required('Timeout is required')
                ]
            });

            serversTable.setDefaultValues({
                'interval': 5000,
                'timeout': 3000,
                'show': true
            });

            serversTable.setRenders({
                url: function(row) {
                    if ('name' in row && row['name']) {
                        return row['name'];
                    }
                    return row['url'];
                },
                status: function(row) {
                    if (row['status'] == 'success') {
                        var iconName = 'done';
                    } else if (row['status'] == 'timeout') {
                        var iconName = 'schedule';
                    } else {
                        var iconName = 'error';
                    }
                    return '<i class="material-icons md-18">' + iconName +  '</i>';
                },
                status_code: function(row) {
                    if (row['status_code']) { 
                        return row['status_code'] + ' ' + row['status_text']; 
                    } else if (row['status'] == 'timeout') {
                        return 'timeout';
                    } else {
                        return 'error';
                    }
                },
                last_status_time: function(row) {
                    var date = new Date(row['last_status_time']);
                    var formatDict = {
                        'hours': date.getHours(),
                        'minutes': date.getMinutes().padZero(),
                        'day': date.getDate().padZero(),
                        'month': date.getMonth() + 1,
                        'year': date.getFullYear(),
                        'delta': row['time_delta']
                    };
                    var template = _.template('<%=hours%>:<%=minutes%> <%=day%>.<%=month%>.<%=year%> (<strong><%=delta%></strong>)');
                    return template(formatDict);
                }
            });

            updateView();

            // on collection data changed - reload table
            chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse) {
                    if (request['type'] == 'dataChanged') {
                        updateView();   
                    }
                }
            );
        });

        eng.go();
    }
);
