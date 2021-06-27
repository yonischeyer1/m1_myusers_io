import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styles from './DeletePopup.css'
import { Transition } from '../../utils/general';
import DeletePopUpEvents, {DEFAULT_COMPONENT_STATE} from './DeletePopUp.events';

const _events = new DeletePopUpEvents();

export default function FullScreenDialog(props:any) {
  const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE})

  _events.setConstructor(state, setState, props);

  const { itemAndCollectionName, testSuitesFilterdTestsByItem } = state;

  const doOpen = !!itemAndCollectionName.item.name  && !!itemAndCollectionName.collectionName


  return doOpen ? (
    <div>
      <Dialog fullScreen open={doOpen} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Remove {itemAndCollectionName.item.name} 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
            <div>
                Are you sure you want to delete 
                {` ${itemAndCollectionName.item.name} `}  
                 From {itemAndCollectionName.collectionName} ? 
                 {testSuitesFilterdTestsByItem.length === 0 ? null : <div>
                  <br/>
                   The follwing Test suites are using  
                   The item { ` ${itemAndCollectionName.item.name} ` }
                   <br/>
                   This tests will be deleted if you will click the yes button.
                   </div>}<br/> 
                 {testSuitesFilterdTestsByItem.map((testSuite:any)=>{
                    return  <div> 
                      Test suite Name: {testSuite.name} 
                      <ul>
                        {testSuite.suite.map((test:any)=>{
                          return <li>
                             Test name: {test.testName}
                          </li>
                        })}
                      </ul>
                    </div>
                  })
                 }
            </div>
            <br/><br/><br/>
            <div>
            <Button size="small" variant="outlined" color="primary" onClick={_events.handleDeleteItemClick.bind(_events)}>Yes</Button>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
            <Button size="small" variant="outlined" color="primary" onClick={_events.handleClose.bind(_events)}>No</Button>
            </div>
       </div>
      </Dialog>
    </div>
  ) : <div></div>;
}