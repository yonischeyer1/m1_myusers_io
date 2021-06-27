import ServiceStore from '../services /store.service'
export interface Account {
    id?:string
    name:string,
    loginURL:string
}

const serviceStore = new ServiceStore();

export const createAndSaveAccount = (currentUser:any, accountDits:any) => {
    const { accountName, loginURL } = accountDits;
    const accountToInsert:Account = {
      name: accountName,
      loginURL
    }
    return saveNewAccount(accountToInsert, currentUser);
}

export const saveNewAccount = (accountToInsert:any, currentUser:any) => {
    const users:any = serviceStore.readDocs('users');
    const createdAccountId:any = serviceStore.createDoc('accounts', accountToInsert);
    users[currentUser.id].accountsIds.push(createdAccountId)
    serviceStore.updateDocs('users', users)
    return currentUser.id
}

export const saveUpdatedAccount = (account:any) => {
     const accounts:any = serviceStore.readDocs('accounts');  
     accounts[account.id] = account;
     serviceStore.updateDocs('accounts', accounts)
}