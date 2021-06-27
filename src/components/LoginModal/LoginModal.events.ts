import Container, { CONTAINER_MODE } from "../../services /container.service";
import { setStatePromisifed } from "../../utils/general";
import { removeContainerByName } from "../../utils/IHost";
import { createAndSaveAccount } from '../../models/Account.model'
import { createDummyUser, saveUser } from '../../models/User.model'
import ServiceStore from '../../services /store.service'

const serviceStore = new ServiceStore();

export const DEFAULT_COMPONENT_STATE = {
    open:false,
    port: null,
    loading:false,
    loginContainer:null,
    currentUserPicked:null,
    loginURL:'',
    accountName:'',
    startUrl:''
}

let instance:any = null

export default class LoginModalEvents {
    initFlag:any
    setState:any
    state:any
    props:any
    isLoginMode:boolean = false
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
 
    async init() {
        let { open, currentUserPicked, accountName, loginURL } = this.props;
        if(!currentUserPicked.id) {
            currentUserPicked = createDummyUser(currentUserPicked.name)
        }
        await this.setState({
            ...this.state, 
            open, 
            currentUserPicked, 
            accountName, 
            loginURL
        })
        await this.startLogin(null)
    }

    async handleClose (close:any) {
        await this.setState({...DEFAULT_COMPONENT_STATE})
        const {handleLoginModalClose} = this.props;
        handleLoginModalClose(close);
        this.initFlag = false;
    }

    async setLoadingState (loading:boolean)  {
        await this.setState({...this.state, loading})
    }

    async handleURLChange (e:any) {
        await this.setState({...this.state, startUrl: e.target.value})
    }

    async startLogin (e:any)  {
        const { currentUserPicked, loginURL } = this.state;
        const loginContainer = new Container(CONTAINER_MODE.login);
        await loginContainer.init()
        loginContainer.loadingFunction = this.setLoadingState.bind(this);
        await loginContainer.login(loginURL, currentUserPicked.id)
        await this.setState({
            ...this.state, 
            port:loginContainer._port,
            recordButtonDisable:true, 
            stopButtonDisable:false,
            startRecordingDateTime:new Date(),
            loginContainer
        })
    }

    async finishLogin (e:any) {
        const users = serviceStore.readDocs('users');
        const { loginContainer, accountName, loginURL, currentUserPicked} = this.state;
        if(!users[currentUserPicked.id]) {
            await saveUser(currentUserPicked)
        }
        await createAndSaveAccount(currentUserPicked, {accountName, loginURL}) 
        await loginContainer.finishLogin(currentUserPicked.id);
        await removeContainerByName(loginContainer._containerName)
        this.handleClose(true)
    }

}

