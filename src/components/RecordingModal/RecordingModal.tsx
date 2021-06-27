import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { CircularProgress } from '@material-ui/core';
import VncViewerComponent from '../VncViewer/vncViewer.component';
import RecordValidationModal from '../RecordValidationModal/RecordValidationModal';
import styles from './RecordingModal.css'
import { Transition } from '../../utils/general';
import RecordingModalEvents, {DEFAULT_COMPONENT_STATE} from './RecordingModal.events';


const _events = new RecordingModalEvents();

export default function FullScreenDialog(props:any) {

  const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE});

  _events.setConstructor(state, setState, props)

  const {open, port, loading, openRecordValidationModal, recorderContainer,
    stopButtonDisable, currentUserPicked, actionName, startUrl, pickedAction }  = state;


  const title = ' Recording wizard '
   
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
                   <CircularProgress />
               </div>
             }
             { loading ? null:
                <div>
                <div className={styles["buttons-container"]}>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" 
                   color="secondary"
                   disabled={stopButtonDisable} 
                   onClick={_events.stopRecording.bind(_events)}>
                     stop
                 </Button>
                 </div>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={stopButtonDisable} onClick={_events.abort.bind(_events)}>abort</Button>
                 </div>
                </div>
                 <div style={{width:"auto"}}> 
                  <VncViewerComponent mode="recorder" port={port}/>
                 </div>
                </div>
            }
           </div>
           <RecordValidationModal
            pickedAction={pickedAction}
            startUrl={startUrl}
            actionName={actionName}
            currentUserPicked={currentUserPicked} 
            recorderContainer={recorderContainer}
            open={openRecordValidationModal} 
            handleModalClose={_events.handleModalClosing.bind(_events)}/>
         </div>
        </div>
      </Dialog>
    </div>
  ) : <div></div>
}