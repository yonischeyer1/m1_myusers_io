const fetch = require('node-fetch')

class IHands {
    // _endPointBase = null
    // _port = null
    constructor(port = 4567) {
        this._port = port;
        this._endPointBase = `http://localhost:${port}`;
    }
    async startRecordingKeyboardMouse() {
      const endpoint = `${this._endPointBase}/record/start`
      return fetch(endpoint, {
            method: 'POST', 
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin', 
            headers: {
              'Content-Type': 'application/json'
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer', 
            body: JSON.stringify({})
          })
    }
    async stopRecordingKeyboardMouseAndGetIoActions() {
        const endpoint = `${this._endPointBase}/record/stop`
        return fetch(endpoint, {
              method: 'GET', 
              mode: 'cors', 
              cache: 'no-cache', 
              credentials: 'same-origin', 
              headers: {
                'Content-Type': 'application/json'
              },
              redirect: 'follow', 
              referrerPolicy: 'no-referrer', 
            })
    }
    async startRecorderPlayerKeyboardMouse(ioActions) {
        const endpoint = `${this._endPointBase}/record/player/start`
        return fetch(endpoint, {
              method: 'POST', 
              mode: 'cors', 
              cache: 'no-cache', 
              credentials: 'same-origin', 
              headers: {
                'Content-Type': 'application/json'
              },
              redirect: 'follow', 
              referrerPolicy: 'no-referrer', 
              body: JSON.stringify(ioActions)
            })
    }
    async startPlayerKeyboardMouse(ioActions, actionId) {
        const endpoint = `${this._endPointBase}/player/start?actionId=${actionId}`
        return fetch(endpoint, {
              method: 'POST', 
              mode: 'cors', 
              cache: 'no-cache', 
              credentials: 'same-origin', 
              headers: {
                'Content-Type': 'application/json'
              },
              redirect: 'follow', 
              referrerPolicy: 'no-referrer', 
              body: JSON.stringify(ioActions)
            })
    }
    async stopPlayerKeyboardMouse() {
        const endpoint = `${this._endPointBase}/play/stop`
        return fetch(endpoint, {
              method: 'POST', 
              mode: 'cors', 
              cache: 'no-cache', 
              credentials: 'same-origin', 
              headers: {
                'Content-Type': 'application/json'
              },
              redirect: 'follow', 
              referrerPolicy: 'no-referrer', 
              body: JSON.stringify({})
            })
    }
}

module.exports = {IHands}
