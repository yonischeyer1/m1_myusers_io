import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";

export const DEFAULT_COMPONENT_STATE = { 
  open:false,
  tabIndex:0,
  openUpsertAccountModal:false,
  openUpsertActionModal:false,
  pickedAction:null,
  pickedAccount:null,
  openDeletePopup:false,
  itemAndCollectionNameToDelete:null,
  accountsView:[],
  actionsView:[],
  currentUserPicked: {
     name:'',
  }
}

const serviceStore = new ServiceStore();

let instance:any = null
export default class UserUpsertModalEvents {
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
         if(this.props.open && !this.initFlag) {
            this.initFlag = true;
            await this.init();
         }
    }

    async init () {
        const { currentUserPicked, open } = this.props;
        if(currentUserPicked) {
          const accounts = this.readUserAccounts();
          const actions =  this.readUserActions();
          await this.setState({...this.state, currentUserPicked, 
            accountsView:accounts, actionsView:actions, open})  
        } else {
          await this.setState({...this.state, open})  
        }
    }

    async handleClose (e:any)  {
        const {handleUpsertUserModalClose} = this.props;
        handleUpsertUserModalClose(false);
        await this.setState({...DEFAULT_COMPONENT_STATE})
        this.initFlag = false;
    }
      
    async deleteAccountOrAction  (collectionName:any, item:any)  {
      const { currentUserPicked }  = this.state;
        await this.setState({...this.state, openDeletePopup:true, itemAndCollectionNameToDelete:{collectionName, item, currentUserPicked}})
    }
    
    async handleDeletePopupClose  (e:any) {
      const accounts = this.readUserAccounts();
      const actions =  this.readUserActions();
      await this.setState({
        ...this.state, 
        itemAndCollectionNameToDelete:null, 
        openDeletePopup:false,
        accountsView:accounts, 
        actionsView:actions
      })
    }
    
    async handleUpsertAccountModalClose  (close:any) {
        const accounts = this.readUserAccounts();
        await this.setState({
          ...this.state, 
          openUpsertAccountModal:false,
          accountsView:accounts,
          pickedAccount:null
        })
        if(close) {
          await this.handleClose(null);
        }
    }
    
    async handleUpsertActionModalClose  (close:any) {
        const actions =  this.readUserActions();
        await this.setState({
          ...this.state, 
          openUpsertActionModal:false,
          actionsView:actions
        })
        if(close) {
          await this.handleClose(null);
        }
    }
    
    async handleChange  (event: React.ChangeEvent<{}>, newValue: number)  {
        await this.setState({...this.state, tabIndex:newValue})
    }

    async handleUserNameChange (e:any)  {
       const { currentUserPicked } = this.state;
       const newUserName = e.target.value
       await this.setState({...this.state, currentUserPicked:{
         ...currentUserPicked, name:newUserName
       }});
       if(currentUserPicked.id) {
         const users = serviceStore.readDocs('users')
         users[currentUserPicked.id].name = newUserName
         serviceStore.updateDocs('users', users)
      }
    }
    
    async editAction  (action:any)  {
         await this.setState({...this.state, openUpsertActionModal:true, pickedAction:action});
    }
    
    async editAccount  (account:any)  {
        await this.setState({...this.state, openUpsertAccountModal:account, pickedAccount:account})
    }
    
    async handleFloatingButtonClick (e:any)  {
        if(this.state.tabIndex === 0) {
          await this.setState({...this.state, openUpsertAccountModal: true, pickedAccount:null})
        } else {
          await this.setState({...this.state, openUpsertActionModal: true, pickedAction:null})
        }
    }

    readUserAccounts ()  {
      const { currentUserPicked } = this.props;
      if(!currentUserPicked || !currentUserPicked.id) {
        return [];
      }
      const users = serviceStore.readDocs('users')
      const user = users[currentUserPicked.id]
      if(user.accountsIds.length > 0) {
        const accounts = serviceStore.readDocs('accounts')
          let temp = []
          for(const acccountId of user.accountsIds) {
            temp.push(accounts[acccountId])
          }
          return temp;
      } else {
          return []
      }

  }
  
  readUserActions () { 
     const { currentUserPicked } = this.props;
     if(!currentUserPicked || !currentUserPicked.id) {
      return [];
     }
     const users = serviceStore.readDocs('users')
     const user = users[currentUserPicked.id]
     if(user.actionsIds.length > 0) {
     const actions = serviceStore.readDocs('actions')
     let temp = []
     for(const actionId of user.actionsIds) {
       temp.push(actions[actionId])
     }
     return temp;
     } else {
      return []
     }
  }

}

