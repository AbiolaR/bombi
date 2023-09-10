importScripts('./ngsw-worker.js');
// const { environment } = require('src/environments/environment');
//const apiUrl = `${environment.apiServerUrl}/v1/books/`;
const apiUrl = `http://localhost:3000/api/v1/books/`; // TODO

(function () {
    'use strict';

    self.addEventListener('notificationclick', (event) => {
        if (clients.openWindow && (event.notification.data.url || event.action)) {
            event.waitUntil(clients.matchAll({
                type: "window",
                includeUncontrolled: true
            }).then(function (clientList) {
                switch (event.action) {
                    case 'download':
                        download(event.notification.data.filename, event.notification.data.md5);
                        break;
                    case 'send-to-ereader':
                        sendToEReader(event.notification.data.filename, event.notification.data.md5);
                        break;
                    default:
                        if (event.notification.data.url) {
                            let client = null;
                    
                            for (let i = 0; i < clientList.length; i++) {
                                let item = clientList[i];
                    
                                if (item.url) {
                                    client = item;
                                    break;
                                }
                            }
                    
                            if (client && 'navigate' in client) {
                                client.focus();
                                event.notification.close();
                                return client.navigate(event.notification.data.url);
                            }
                            else {
                                event.notification.close();
                                // if client doesn't have navigate function, try to open a new browser window
                                return clients.openWindow(event.notification.data.url);
                            }
                        }
                }
            }));
        }
    });

    self.addEventListener('push', (event) => {
        if (event.data && event.data.json().notification.data.type == 'BOMBI_NOTIFICATION') {
            // Select who we want to respond to
            self.clients.matchAll({
                includeUncontrolled: true,
                type: 'window',
            }).then((clients) => {
                if (clients && clients.length) {
                  // Send a response - the clients
                  // array is ordered by last focused
                  clients[0].postMessage({
                    type: 'UPDATE_USERDATA'
                  });
                }
            });
        }
    });

}());

function download(filename, md5) {
    fetch(`${apiUrl}download?md5=${md5}`).then(response => {
        return response.blob();
    }).then(file => {
        const anchor = window.document.createElement('a');
        anchor.href = window.URL.createObjectURL(file);
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(anchor.href);  
    });
}

function sendToEReader(filename, md5Hash) {
    fetch(`${apiUrl}send`, {
        method: 'post',
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: {
            [md5]: md5Hash, 
            filename: filename
        }
    });
}

function getAccessToken() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        return userData.access_token || '';
    }
    return '';
}