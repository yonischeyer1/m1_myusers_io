import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { CircularProgress } from '@material-ui/core';
import VncViewerComponent from '../VncViewer/vncViewer.component';
import styles from './LoginModal.css'
import { Transition } from '../../utils/general';
import LoginModalEvents, {DEFAULT_COMPONENT_STATE} from './LoginModal.events';


const _events = new LoginModalEvents();

export default function FullScreenDialog(props:any) {

  const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE});

  _events.setConstructor(state, setState, props)

  const {open, port, loading }  = state;


  const title = 'Login Account';
   
  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              {title}
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
       <div className={styles["modal-content-container"]}>
       <div>
         <br/>
           <div className={styles["modal-content-sub-container"]}>
             {!loading ? null:
               <div className={styles["loading-container"]}>
                 <CircularProgress className={styles["loading-circle"]}/>
               </div>
             }
             {loading ? null : 
               <div>
                 <div className={styles["buttons-container"]}>
                   <div className={styles["recoreder-control-button"]}> 
                     <Button size="small" variant="outlined" color="secondary" 
                     disabled={false} 
                     onClick={_events.finishLogin.bind(_events)}>Finish</Button>      
                   </div>
                 </div>
                  <div style={{width:"auto"}}> 
                  <VncViewerComponent mode="login" port={port}/>
                 </div>
              </div>
             }
           </div>
         </div>
        </div>
      </Dialog>
    </div>
  ) : <div></div>
}