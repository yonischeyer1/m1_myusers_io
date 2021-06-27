import { saveUpdatedAccount } from "../../models/Account.model";
import { setStatePromisifed } from "../../utils/general";


export const DEFAULT_COMPONENT_STATE = {
    open:false,
    openLoginModal:false,
    accountName:{value:'', disabled:false},
    loginURL:{value:'', disabled:false},
    currentUserPicked:null,
    pickedAccount:null,
}


let instance:any = null
export default class AccountUpsertModalEvents {
    initFlag:any
    setState:any
    state:any
    props:any
    anchorRef:any
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
         if(!this.initFlag && this.props.open) {
            this.initFlag = true;
            await this.init();
         }
      }
  
    async init () {
        const { pickedAccount, open,  currentUserPicked} = this.props;
        if(pickedAccount) { 
           await this.setState({
            ...this.state, 
            accountName:{value:pickedAccount.name, disabled:false}, 
            loginURL:{value:pickedAccount.loginURL, disabled:false}, 
            open, 
            currentUserPicked,
            pickedAccount
          })
        } else {
            await this.setState({...this.state, open, currentUserPicked})
        }
    }

    async handleClose (close:any, e:any)  {
        await this.setState({...DEFAULT_COMPONENT_STATE})
        const {handleUpsertAccountModalClose} = this.props;
        handleUpsertAccountModalClose(close);
        this.initFlag = false;
    }
    
    async handleLoginModalClose (close:any) {
        if(close) {
            await this.handleClose(close, null);
        } else {
            await this.setState({...this.state, openLoginModal:false});
        }
    }
    
    async handleAccountNameChange (e:any)  {
        const newAccountName = e.target.value
        await this.setState({
            ...this.state, 
            accountName:{value:newAccountName, disabled:false}
        })
    }
    
    async handleLoginUrlChange  (e:any)  {
        const newLoginUrl = e.target.value
        await this.setState({
            ...this.state, 
            loginURL:{value:newLoginUrl, disabled:false}
        })
    }
    
    async handleLoginClick (e:any)  {
        await this.setState({...this.state, openLoginModal:true});
    }

    async handleCancelBtnClick (e:any) {
        this.handleClose(false, null);
    }

    async handleSaveBtnClick (e:any) {
        const { pickedAccount, accountName, loginURL } = this.state;
        saveUpdatedAccount({id:pickedAccount.id, name:accountName.value, loginURL:loginURL.value});
        this.handleClose(false, null);
    }
    
}

