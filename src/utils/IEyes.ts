export default class IEyes {
    _endPointBase:string;
    _port:number;

    constructor(port:number) {
        this._port = port;
        this._endPointBase = `http://localhost:${port}`;
    }
    async playAction(action:any) {
      const endpoint = `${this._endPointBase}/playAction`
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
            body: JSON.stringify(action)
          })
    }

    async playRecorderAction(action:any) {
      const endpoint = `${this._endPointBase}/playRecorderAction`
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
            body: JSON.stringify(action)
          })
    }
}


