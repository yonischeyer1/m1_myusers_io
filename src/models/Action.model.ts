import ServiceStore from '../services /store.service'

const serviceStore = new ServiceStore();
export interface Action {
    id?:string
    startUrl:string
    name:string
    ioActions:[]
    tags: Tag[]
}

export enum TagType {
    LIVE = "LIVE",
    NOROMAL = "NORMAL",
    LOGIN = "LOGIN"
}

export interface Tag {
    id:any
    dynamic?:any
    skip:boolean
    name:string
    type: TagType
    hash:string
    distances:number[]
    waitTime:any
    originalReferenceSnapshotURI:string
    moreSnapshots?:any;
}

export async function createAction(currentUserPicked:any, actionToInsert:any) {
      const users = serviceStore.readDocs('users');
      const newActionId = serviceStore.createDoc('actions', actionToInsert)
      users[currentUserPicked.id].actionsIds.push(newActionId);
      serviceStore.updateDocs('users', users)
}