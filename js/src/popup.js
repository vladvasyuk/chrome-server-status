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
    chrome.storage.local.get(['servers'], function(data) {
        if (data['servers'].length) {
            eng.findComponent('servers').setData(data['servers']);
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
                    Validators.required('Timeout is required'),
                    Validators.minValue(5000, 'Minimum value for timeout is 5000ms')
                ]
            });

            serversTable.setDefaultValues({
                'interval': 5000,
                'timeout': 5000,
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
                        console.log(row['status_code']);
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
                        'minutes': date.getMinutes(),
                        'day': date.getDate(),
                        'month': date.getMonth() + 1,
                        'year': date.getFullYear(),
                        'delta': bg.getTimeDeltaString(new Date(), date)
                    };
                    var template = _.template('<%=hours%>:<%=minutes%> <%=day%>.<%=month%>.<%=year%> (<strong><%=delta%></strong>)');
                    return template(formatDict);
                }
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
