import ServiceStore from "../../services /store.service";
import { APP_CWD, setStatePromisifed } from "../../utils/general";
import { removeUserSessionFolder } from "../../utils/IHost";

export const DEFAULT_COMPONENT_STATE = {
  itemAndCollectionName: {
    item: {
      name:''
    },
    collectionName: '',
 },
 testSuitesFilterdTestsByItem:[]
}

const serviceStore = new ServiceStore();
let instance:any = null;

export default class ActionsDropdownEvents {
  initFlag:any
  setState:any
  state:any
  props:any
  constructor() {
      if(instance) {
          return instance;
      }
      this.initFlag = false;
      instance = this;
      return this;
  }

   async setConstructor(state:any, setState:any, props:any) {
       this.state = state;
       this.setState = setStatePromisifed.bind(null, setState);
       this.props = props;
       if(!this.initFlag && this.props.itemAndCollectionName) {
          this.initFlag = true;
          await this.init();
       }
    }

    async init () {
       //TODO fetch test suite and test names that will be deleted if user will delete action
       //TODO: and notify user about it  
       const { itemAndCollectionName } = this.props;
       await this.checkIfTestUsingItem(itemAndCollectionName);
       await this.setState({...this.state, itemAndCollectionName})
    }

    async checkIfTestUsingItem (itemAndCollectionName:any) { 
       const {item, collectionName} = itemAndCollectionName;
       if(collectionName === 'actions' || collectionName === 'users') {
          const tests = Object.values(serviceStore.readDocs('tests'));
          const testSuitesFilterdTestsByItem = tests.filter((testSuite:any) => {
             const testsContainingItem = testSuite.suite.filter((test:any)=>{
                 if(test.actionId === item.id || test.userId === item.id) {
                    return test;
                 }
             })
             if(testsContainingItem.length > 0) {
               return {...testSuite, suite:testsContainingItem}
             }
          })
          await this.setState({...this.state, testSuitesFilterdTestsByItem})
       } 
    }

    async handleClose (e:any) {
        await this.setState({...DEFAULT_COMPONENT_STATE})
        const {handleDeletePopupClose} = this.props;
        handleDeletePopupClose(false);
        this.initFlag = false;
    };
    
    async handleDeleteItemClick (e:any)  {
        await deleteTestsUsedByItem (this.state.testSuitesFilterdTestsByItem);
        const { collectionName, item, currentUserPicked } = this.props.itemAndCollectionName;
        switch (collectionName) {
          case 'accounts':
            await deleteAccount(item, currentUserPicked);
          break;

          case 'actions':
            await deleteAction(item, currentUserPicked);
          break;

          case 'tests':
            await deleteTest(item);
          break;

          case 'users':
            await deleteUser(item);
          break;
        
          default:
            break;
        }
        await this.handleClose(null)
      }
    
}

async function deleteTestsUsedByItem (testSuitesFilterdTestsByItem:any) {
  const tests = serviceStore.readDocs('tests')
  for (const testSuiteToDelete of testSuitesFilterdTestsByItem) {
       const filterdSuite = tests[testSuiteToDelete.id].suite.filter((item:any) => {
            const x = testSuiteToDelete.suite.filter(testItemToDelete => item.id === testItemToDelete.id);
            if(x.length === 0) {
              return item;
            }
       });
       if(filterdSuite.length === 0) {
          deleteTest(testSuiteToDelete);
       } else {
        tests[testSuiteToDelete.id] = filterdSuite;
        serviceStore.updateDocs('tests', tests);
       }
  }
}

async function deleteTest (item:any) {
  serviceStore.deleteDoc('tests', item)
}

async function deleteAction(item:any, currentUserPicked:any) {
  const users = serviceStore.readDocs('users')
  const user = users[currentUserPicked.id]
  user.actionsIds = user.actionsIds.filter(actionId => actionId !== item.id)
  users[user.id] = user;
  serviceStore.updateDocs('users', users)
  serviceStore.deleteDoc('actions', item)
  //TODO: need to delete actionId from test if exsists 
  //testSuitesFilterdTestsByItem
}

async function deleteAccount(item:any, currentUserPicked:any) {
  const users = serviceStore.readDocs('users')
  const user = users[currentUserPicked.id]
  user.accountsIds = user.accountsIds.filter(accountId => accountId !== item.id)
  users[user.id] = user;
  serviceStore.updateDocs('users', users)
  serviceStore.deleteDoc('accounts', item)
  //TODO: need to delete accountID from test if exsists 
}

async function deleteUser (item:any) {
  const users = serviceStore.readDocs('users')
  const user = users[item.id]
  if(user.accountsIds.length > 0) {
    await deleteAllUserAccounts(user);
  }
  if(user.actionsIds.length > 0) {
    await deleteAllUserActions(user);
  }
  serviceStore.deleteDoc('users', item)
  await removeUserSessionFolder(`${APP_CWD}sessions/${user.id}`.trim());
}

async function deleteAllUserActions(user:any) {
    const actions = serviceStore.readDocs('actions');
    for(const actionId of user.actionsIds) {
      delete actions[actionId];
    }
    serviceStore.updateDocs('actions',actions)
}

async function deleteAllUserAccounts(user:any) {
    const accounts = serviceStore.readDocs('accounts');
    for(const accountId of user.accountsIds) {
      delete accounts[accountId];
    }
    serviceStore.updateDocs('accounts',accounts)
}