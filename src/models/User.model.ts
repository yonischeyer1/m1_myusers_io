import ServiceStore from "../services /store.service";
import { getRandomId } from "../utils/general";
export interface User {
    id?:string
    name:string
    accountsIds:[]
    actionsIds:[]
}

const serviceStore = new ServiceStore();

export const createDummyUser = (userName:any) => {
    const userToInsert:any = {
      id: getRandomId(),
      name:userName,
      accountsIds:[],
      actionsIds:[],
      dummy:true,
    }

    return userToInsert;
}

export const saveUser = (user:any) => {
  if(user.dummy) {
     delete user.dummy
  }
  const users = serviceStore.readDocs('users');
  users[user.id] = user;
  serviceStore.updateDocs('users', users);
}