/** @type {Number} Global session id. Changed, when servers list has updated */
var SESSION_ID;

/**
 * Ajax request to given url
 * @param  {string} url     server address
 * @param  {number} timeout
 * @return {object}         promise object
 */
function makeRequest(url, timeout) {
    return $.ajax({
        url: url,
        type: 'get',
        timeout: timeout,
        xhrFields: {
            withCredentials: true
        }
    });
};

/**
 * [getTimeDeltaString description]
 * @param  {[type]} time1 [description]
 * @param  {[type]} time2 [description]
 * @return {[type]}       [description]
 */
function getTimeDeltaString(time1, time2) {
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
 * [updateIcon description]
 * @return {[type]} [description]
 */
function updateIcon() {
    chrome.storage.sync.get(['servers'], function(data) {
        /** @type {Number} alive servers count */
        var alive = 0;

        /** @type {Array} watched servers from collection */
        var watchedServers = _.filter(data['servers'], function(e) { return e['show'] });

        for (key in watchedServers) {
            if (watchedServers[key]['status'] == 'done') {
                alive++;
            }
        }

        // show appropriate icon based on count of alive servers
        if (alive == watchedServers.length) {
            chrome.browserAction.setIcon({
                path: 'icons/alive.png'
            });
        } else if (alive === 0) {
            chrome.browserAction.setIcon({
                path: 'icons/dead.png'
            });
        } else {
            chrome.browserAction.setIcon({
                path: 'icons/half.png'
            });
        }

        // show badge text
        if (watchedServers.length == 1) {
            chrome.browserAction.setBadgeText({text: getTimeDeltaString(new Date(), new Date(watchedServers[0]['last_status_time']))});
        } else {
            chrome.browserAction.setBadgeText({text: alive + '/' + watchedServers.length});
        }
    });
};

/**
 * [updateData description]
 * @return {[type]} [description]
 */
function updateData() {
    SESSION_ID = _.uniqueId('session');

    chrome.browserAction.setIcon({
        path: 'icons/dead.png'
    });

    chrome.browserAction.setBadgeText({text: ''});

    chrome.storage.sync.get(['servers'], function(data) {
        if (!data['servers']) {
            return;
        }
        for (key in data['servers']) {
            if (data['servers'][key]['show']) {
                runCheck(key, data['servers'], SESSION_ID);
            }
        }
    });
};

function runCheck(key, data, session_id) {
    if (session_id != SESSION_ID) {
        return;
    }
    var actualUrl = data[key]['url'];
    // check for protocol exists
    if(!/^\w+:\/\//.exec(actualUrl)) {
        actualUrl = 'http://' + actualUrl;
    }
    var def = $.when(makeRequest(
        actualUrl,
        data[key]['timeout']
    ));
    def.always(function(html, status) {
        if (session_id != SESSION_ID) {
            return;
        }
        var oldStatus = data[key]['status'];
        if (status == 'success') {
            data[key]['status'] = 'done';
        } else if (status == 'timeout') {
            data[key]['status'] = 'schedule';
        } else {
            data[key]['status'] = status;
        }
        if (data[key]['status'] !== oldStatus) {
            data[key]['last_status_time'] = new Date().toString();
        }
        chrome.storage.sync.set({
            'servers': data
        }, updateIcon);
        setTimeout(function() {
            runCheck(key, data, session_id)
        }, parseInt(data[key]['interval']));
    });
}

window.onload = function() {
   chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 255, 255]});
   updateData();
};
