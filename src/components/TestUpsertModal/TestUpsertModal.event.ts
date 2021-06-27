import { Test, TestModel, TEST_STATUS } from "../../models/Test.model";
import ServiceStore from "../../services /store.service";
import { getRandomId, setStatePromisifed } from "../../utils/general";


export const DEFAULT_COMPONENT_STATE = {
  open:false,
  testName:"",
  pickedUserId:"",
  pickedUserActions:null,
  pickedUserAction:"",
  suite:[],
  name:"",
  users:[],
  actions:[],
  currentTestPicked:null
}

const serviceStore = new ServiceStore();

let instance:any = null;
export default class TestUpsertModalEvents {
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
      if(!this.initFlag && this.props.open) {
         this.initFlag = true;
         await this.init();
      }
  }

  async init () {
    const users = serviceStore.readDocs('users');
    const actions = serviceStore.readDocs('actions');
    const { currentTestPicked, open } = this.props;
    if(currentTestPicked) {
      await this.setState({
        ...this.state, 
        suite:currentTestPicked.suite, 
        name:currentTestPicked.name,
        users,
        actions,
        open
      })
    } else {
      await this.setState({
        ...this.state, 
        suite:[], 
        name:'',
        users,
        actions,
        open
      })
    }
  }

  async handleClose (e:any) {
        const { handleUpsertTestModalClose } = this.props;
        handleUpsertTestModalClose(false);
        await this.setState({...DEFAULT_COMPONENT_STATE})
        this.initFlag = false;
  }

  async handleSuiteNameChange(e:any) {
    await this.setState({...this.state, name:e.target.value})
  }

  async handleTestNameChange(e:any) {
    await this.setState({...this.state, testName:e.target.value})
  }
    
  async getUserActions  (e:any)  {
        const users = serviceStore.readDocs('users')
        const actions = serviceStore.readDocs('actions')
        const menuItemSelected = e.target.value;
        const user:any = users[menuItemSelected];
        let userActions = []
        for(const userActionId of user.actionsIds) {
          userActions.push(actions[userActionId])
        }
        return {userActions, user};
  }
    
  async handleUserPick (e:any)  {
        const {userActions, user} = await this.getUserActions(e);
        await this.setState({...this.state, pickedUserId:user.id, pickedUserActions:userActions});
  }
    
  async handleActionPick  (e:any)  {
        const pickedAction = e.target.value
        await this.setState({...this.state, pickedUserAction:pickedAction})
  }
    
  async save (e:any)  {
        const test:Test = {
          name: this.state.name,
          suite:this.state.suite,
          lastFailResult:null
        }
        serviceStore.createDoc('tests', test);
        this.handleClose(null)
  }
    
  async addTestToSuite (e:any) {
        const {testName, pickedUserId, pickedUserAction} = this.state;
        const test:TestModel = {
          id: getRandomId(),
          testName,
          userId:pickedUserId,
          actionId:pickedUserAction,
          schedule:{},
          status:TEST_STATUS.IDLE
        }
        await this.setState({
          ...this.state, 
          suite:[...this.state.suite, test], 
          testName:"", 
          pickedUserId:"", 
          pickedUserAction:"", 
          pickedUserActions:null
        });
  }

  async deleteTestFromSuite (test:any) {
        const newSuite = this.state.suite.filter(item => item.id !== test.id)
        await this.setState({...this.state, suite:newSuite})
  }
}

