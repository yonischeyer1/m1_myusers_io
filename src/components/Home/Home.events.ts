import { TEST_STATUS } from "../../models/Test.model";
import Container, { CONTAINER_MODE } from "../../services /container.service";
import ServiceStore from "../../services /store.service";
import { exportTestSuite } from "../../utils/exportImport";
import { setStatePromisifed } from "../../utils/general";

const DEFAULT_USER_ACTION_OPTIONS = [
  {label:'Edit', disabled:false}, 
  {label:'Delete', disabled:false}
]

const DEFAULT_TESTS_ACTION_OPTIONS = [
  {label:'Play',disabled:false}, 
  {label:'Live view', disabled:false}, 
  {label:'Edit', disabled:false},  
  {label:'Delete', disabled:false}, 
  {label:'Export', disabled:false}
]

export const DEFAULT_COMPONENT_STATE = {
    tabIndex:0,
    openUpsertTestModal:false,
    openUpsertUserModal:false,
    openliveViewPortModal:false,
    openDeletePopup:false,
    openTroubleshootMenu:false,
    liveViewPort:null,
    currentUserPicked:null,
    currentTestPicked:null,
    stopLiveView:true,
    itemAndCollectionName:null,
    currentRuningTests: [],
    testTroubleshootPick:false,
    optionsTest:{},
    optionsUser:{},
    tests:[],
    users:[]
}

const serviceStore = new ServiceStore();

let instance :any = null;
export default class HomeEvents {
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
         if(!this.initFlag) {
            this.initFlag = true;
            await this.init();
         }
   }

   async init () {
       const tests = Object.values(serviceStore.readDocs('tests'));
       const users =  Object.values(serviceStore.readDocs('users'));
       const currentRuningTests = tests.map((test:any) => {return {name:"", status:""}})
       const optionsUser:any = {}
       const optionsTest:any = {}
       users.forEach((user:any) => {optionsUser[user.id] = [...DEFAULT_USER_ACTION_OPTIONS]}) 
       tests.forEach((test:any) => {optionsTest[test.id] = [...DEFAULT_TESTS_ACTION_OPTIONS]}) 

       await this.setState({
         ...this.state, 
         users, 
         tests, 
         currentRuningTests,
         optionsUser,
         optionsTest
      })
   }

    //*** Modals Close events */

    async handleTroubleshootMenuClose () {
        await this.setState({...this.state, testTroubleshootPick:false})
    };

    async handleUpsertTestModalClose () {
      const { optionsUser, optionsTest } = this.state;
      const tests =  Object.values(serviceStore.readDocs('tests'));
      const currentRuningTests = tests.map((test:any) => {return {name:"", status:""}})
      tests.forEach((test:any) => {optionsTest[test.id] = [...DEFAULT_TESTS_ACTION_OPTIONS]})
        await this.setState({
          ...this.state, 
          tests,
          currentTestPicked:null, 
          openUpsertTestModal:false,
          optionsUser,
          optionsTest,
          currentRuningTests
        })
    }

    async handleUpsertUserModalClose () {
        const { optionsUser, optionsTest } = this.state;
        const tests = Object.values(serviceStore.readDocs('tests'));
        const users =  Object.values(serviceStore.readDocs('users'));
        users.forEach((user:any) => {optionsUser[user.id] = [...DEFAULT_USER_ACTION_OPTIONS]}) 
        await this.setState({
          ...this.state, 
          openUpsertUserModal:false, 
          currentUserPicked:null, 
          users,
          tests,
          optionsUser,
          optionsTest
        })
    }

    async handleDeletePopupClose () {
       const tests = Object.values(serviceStore.readDocs('tests'));
       const users = Object.values(serviceStore.readDocs('users'));
        await this.setState({
          ...this.state, 
          itemAndCollectionName:null, 
          openDeletePopup:false,
          tests,
          users
        })
    }

    async handleLivePreviewModalClose () {
        await this.setState({...this.state, stopLiveView:true})
        setTimeout(async ()=>{
          await this.setState({...this.state, liveViewPort:null})
        }, 0)
    }

    //*** Inputs handles */

    async handleChangeTab (event: React.ChangeEvent<{}>, newValue: number) {
        await this.setState({...this.state, tabIndex:newValue})
    }

    async handleLiveViewClick (test:any) {
        await this.setState({...this.state, liveViewPort:this.state.portsPlaying[test.id], 
            stopLiveView:false, liveViewPortModalOpen:true})
    }

    async handleFloatingButtonClick (e:any)  {
        if(this.state.tabIndex === 0) {
            await this.setState({...this.state, openUpsertTestModal: !this.state.openUpsertTestModal})
          } else {
            await this.setState({...this.state, currentUserPicked:null, openUpsertUserModal:!this.state.openUpsertUserModal})
          }
    }

    async handleFailClick (testSuite:any) {
        await this.setState({...this.state, testTroubleshootPick:testSuite})
    }

    async handleTestMenuItemClick (test:any, testSuiteIdx:any, option:any) {
        switch (option.label) {
            case "Play":
              await this.playTestSuite(test, testSuiteIdx)
            break;
        
            case "Live view":
              await this.handleLiveViewClick(test)
            break;
        
            case "Edit":
              await this.editTest(test)
            break;
        
            case "Delete":
              await this.deleteTest(test)
            break;

            case "Export":
              console.log("before export");
              await exportTestSuite(test);
              console.log("after export");
            break;
          
            default:
              break;
          }
    }

    async handleUserMenuItemClick (user:any, option:any) {
        switch (option.label) {
            case "Edit":
              await this.editUser(user);
            break;
        
            case "Delete":
              await this.deleteUser(user)
            break;
          
            default:
              break;
          }
    }

    //*** Output handles */

    async changeTestStatus (test:any, status:any, testSuiteIdx:any) {
        let { currentRuningTests } = this.state
        currentRuningTests[testSuiteIdx] = {name:test.testName, status};
        await this.setState({
          ...this.state, 
          currentRuningTests
        })
    }

    async editUser (user:any) {
        await this.setState({...this.state, currentUserPicked:user, openUpsertUserModal:true})
    }

    async editTest (test:any) {
        await this.setState({...this.state, currentTestPicked:test, openUpsertTestModal:true})
    }

    async deleteUser (user:any) {
        await this.setState({...this.state, itemAndCollectionName:{collectionName:'users', item:user}})
    }

    async deleteTest (test:any) {
        await this.setState({...this.state, itemAndCollectionName:{collectionName:'tests', item:test}})
    }

    async playTestSuite (testSuite:any, testSuiteIdx:any)  { 
        //await this.disableUserActionsDropDown(testSuite, true);
        let testIdx = 0;
        for(const test of testSuite.suite) {
           await this.playTest(test, testSuite.id, testIdx, testSuiteIdx)
           testIdx++;
        }
        //await this.disableUserActionsDropDown(testSuite, false);
    }

    async disableUserActionsDropDown (testSuite:any, disabled:any) {
        const { optionsUser } = this.state;
        const userIdsInTest  = testSuite.suite.map(test => test.userId)
        userIdsInTest.map((userId:any) => {optionsUser[userId] = optionsUser[userId].map((option:any) =>{ return {...option, disabled}})})
        await this.setState({...this.state, optionsUser})
    }

    async saveTestFail (testResp:any, testSuiteIdx:any) { 
        const testsModel = serviceStore.readDocs('tests')
        let tests:any = Object.values(testsModel);
        testsModel[tests[testSuiteIdx].id].lastFailResult = testResp;
        serviceStore.updateDocs('tests', testsModel)
        tests = Object.values(serviceStore.readDocs('tests'));
        await this.setState({...this.state, tests})
    }

    async playTest (test:any, testSuiteId:any, testIdx:any, testSuiteIdx:any) {
        const users = serviceStore.readDocs('users');
        await this.changeTestStatus(test, TEST_STATUS.PLAYING , testSuiteIdx)
        const actions = serviceStore.readDocs('actions');
        const user = users[test.userId];
        const action = actions[test.actionId]
        const playingContainerInstance = new Container(CONTAINER_MODE.player);
        await playingContainerInstance.init(action.startUrl, user.id);
        await this.setState({...this.state, portsPlaying:{...this.state.portsPlaying, [testSuiteId]:playingContainerInstance._port}})
        const testResp:any = await (await playingContainerInstance.play(true, action)).json()
        if(testResp.success) {
          await this.changeTestStatus(test, TEST_STATUS.SUCCESS, testSuiteIdx)
        } else {
          testResp.testIdx = testIdx;
          await this.saveTestFail(testResp, testSuiteIdx)
          await this.changeTestStatus(test, TEST_STATUS.FAIL, testSuiteIdx)
        }
        await this.setState({...this.state, portsPlaying:{...this.state.portsPlaying, [test.id]:false}})
    }

    
}

