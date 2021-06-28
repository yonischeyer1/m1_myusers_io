import fs from 'fs'
import { APP_CWD, getRandomId } from '../utils/general'
import EventEmitter from 'events'


class MyEmitter extends EventEmitter {}
let instance:any;
const DB_FOLDER_PATH = `${APP_CWD}DB`

const MY_COLLECTIONS = ['accounts','actions','tests','users','settings']

export default class ServiceStore {
    _store:any = {
        DB: {
           accounts:{},
           actions:{},
           tests:{},
           users:{},
           settings:{} 
        },
        appState: {}
    }
    _myEmitter:any
    constructor() {
        if(instance) {
            return instance;
        }
        this._myEmitter = new MyEmitter();
        this._myEmitter.setMaxListeners(4)
        instance = this
        return this;
    }
    async init() {
         const loadPromises = MY_COLLECTIONS.map(collectionName => this.load(collectionName))
         const [accounts, actions, tests, users, settings]: any = await Promise.all(loadPromises).catch(e => console.error(e));
         this._store.DB = {accounts, actions, tests, users, settings}
         return;
    }
    getEventEmitter() {
        return this._myEmitter;
    }
    getAppStateValue(key:string) {
        return typeof this._store.appState[key] === "object" ? JSON.parse(JSON.stringify(this._store.appState[key])) : this._store.appState[key];
    }
    upsertAppStateValue(key:string, value:any) {
        const copyOfValue = typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value
        this._store.appState[key] = copyOfValue;
        this._myEmitter.emit(`state-${key}`)
    }
    createDoc(collectionName:any, newDoc:any) {
        const copyOfDoc = JSON.parse(JSON.stringify(newDoc))
        copyOfDoc["id"] = getRandomId();// create random id
        this._store.DB[collectionName][copyOfDoc["id"]] = copyOfDoc;
        this.save(collectionName, this._store.DB[collectionName])
        this._myEmitter.emit(`DB-reread-${collectionName}`)
        return copyOfDoc["id"];
    }
    readDocs(collectionName:any) {
        return JSON.parse(JSON.stringify(this._store.DB[collectionName]));
    }
    updateDocs(collectionName:any, updatedCollection:any) {
        console.log("updateDocs")
        this._store.DB[collectionName] = updatedCollection;
        this.save(collectionName, this._store.DB[collectionName])
        this._myEmitter.emit(`DB-reread-${collectionName}`)
    }
    deleteDoc(collectionName:any, value:any) {
        delete this._store.DB[collectionName][value.id]
        this.save(collectionName, this._store.DB[collectionName])
        this._myEmitter.emit(`DB-reread-${collectionName}`)
    }
    save(collectionName:any, docs:any) {
        fs.writeFileSync(`${DB_FOLDER_PATH}/${collectionName}.json`, JSON.stringify(docs))
    }
    load(collectionName:any) {
        return new Promise((resolve, reject)=>{
            if (!fs.existsSync(DB_FOLDER_PATH)){
                fs.mkdirSync(DB_FOLDER_PATH);
            }
            const modelJsonPath = `${DB_FOLDER_PATH}/${collectionName}.json`
            console.log("modelJsonPath",modelJsonPath)
            fs.exists(modelJsonPath,(exsists) => {
                console.log("not exsisting", exsists)
                if(!exsists) {
                    console.log("not exsisting")
                    fs.writeFileSync(modelJsonPath, JSON.stringify({}))
                    return resolve([])
                }
                const Model = JSON.parse(fs.readFileSync(modelJsonPath))
                return resolve(Model)
                
            })
        })
    }
}