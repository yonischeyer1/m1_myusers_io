import React, { Suspense } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AddIcon from '@material-ui/icons/Add';
import { Fab, Button } from '@material-ui/core';
import TestUpsertModal from '../TestUpsertModal/TestUpsertModal'
import UserUpsertModal from '../UserUpsertModal/userUpsertModal'
import TroubleshootMenu from '../TroubleshootMenu/TroubleshootMenu'
import PlayerLiveViewModal from '../PlayerLiveViewModal/PlayerLiveView'
import DeletePopup from '../DeletePopup/DeletePopup'
import styles from './Home.css';
import { a11yProps, TabPanel } from '../../utils/general';
import ActionsDropdown from '../ActionsDropdown/ActionsDropdown';
import HomeEvents, {DEFAULT_COMPONENT_STATE} from './Home.events';


const _events = new HomeEvents();

export default function SimpleTabs(props:any) {
const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE});

_events.setConstructor(state, setState, props);

const {tests, users, tabIndex, openUpsertTestModal, openUpsertUserModal,
  liveViewPort, currentUserPicked, currentTestPicked,
  stopLiveView, itemAndCollectionName, currentRuningTests,
  testTroubleshootPick, optionsTest, optionsUser} = state;

const disableTestAddFlag = tabIndex === 0 && Object.values(users).length === 0;
   
return (
      <div className={styles["root"]} >
        <AppBar className={styles["app-bar"]}  position="static">
          <Tabs  indicatorColor="primary"  textColor="inherit" value={tabIndex} onChange={_events.handleChangeTab.bind(_events)} aria-label="simple tabs example">
            <Tab label="Tests" {...a11yProps(0)} />
            <Tab label="Users" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={tabIndex} index={tabIndex}>
        <Suspense fallback={<div>Loading...</div>}>
          <div style={{display: tabIndex === 0 ? 'block' : 'none', color:"black"}}> 
             <div className={styles["tests-menu-container"]}>
                {
                  !tests ||tests.length === 0 ? <div> 
                          You have 0 Tests
                     </div>: tests.map((testSuite:any, testSuiteIdx:any)=> {
                    return (
                      <div className={styles["test-row"]}>
                         <div className={styles["test-name-container"]}>
                              Test suite name:&nbsp; {testSuite.name}
                         </div>
                         <div className={styles["test-name-container"]}>
                              Test runing:&nbsp; {currentRuningTests[testSuiteIdx].name}
                         </div>
                         <div className={styles["test-name-container"]}>
                              Test status: &nbsp; 
                              {currentRuningTests[testSuiteIdx].status !== "FAIL" ? currentRuningTests[testSuiteIdx].status :
                                <Button variant="outlined" color="secondary" onClick={_events.handleFailClick.bind(_events, testSuite)}>FAIL</Button>
                              }
                         </div>
                         <ActionsDropdown options={optionsTest[testSuite.id]} handleMenuItemClick={_events.handleTestMenuItemClick.bind(_events,testSuite, testSuiteIdx)} />
                      </div>
                    )
                  }) 
                }
             </div>
          </div>
          <div style={{display: tabIndex === 1 ? 'block' : 'none', color:"black"}}>
          {
             tabIndex !== 1 ? null:
          <div className={styles["tests-menu-container"]}>
                {
                  !users || users.length === 0 ? <div>
                    You have 0 Users
                  </div> : users.map((user:any, userIdx:any)=> {
                    return (<div className={styles["test-row"]}>
                       <div className={styles["test-name-container"]}>
                         name : {user.name}
                       </div>
                       <ActionsDropdown options={optionsUser[user.id]} 
                       handleMenuItemClick={_events.handleUserMenuItemClick.bind(_events, user)} />
                    </div>)
                  }) 
                }
             </div>
             }
          </div>
          </Suspense>
        </TabPanel>

        <div className={styles["add-test-floating-btn"]}>
           <Fab disabled={disableTestAddFlag} 
           color="primary" aria-label="add" onClick={_events.handleFloatingButtonClick.bind(_events)}>
            <AddIcon />
           </Fab>
        </div>
         
        <DeletePopup handleDeletePopupClose={_events.handleDeletePopupClose.bind(_events)} 
        itemAndCollectionName={itemAndCollectionName} />

        <PlayerLiveViewModal handleLivePreviewModalClose={_events.handleLivePreviewModalClose.bind(_events)} 
        stopPlaying={stopLiveView} port={liveViewPort}/>

        <TestUpsertModal style={{overflow:"hidden"}} 
        handleUpsertTestModalClose={_events.handleUpsertTestModalClose.bind(_events)} 
        open={openUpsertTestModal} currentTestPicked={currentTestPicked}/>

        <UserUpsertModal open={openUpsertUserModal} currentUserPicked={currentUserPicked} 
        handleUpsertUserModalClose={_events.handleUpsertUserModalClose.bind(_events)} />

        <TroubleshootMenu  
        pickedTest={testTroubleshootPick}
        handleTroubleshootMenuClose={_events.handleTroubleshootMenuClose.bind(_events)} />
      </div>
    );
  
}