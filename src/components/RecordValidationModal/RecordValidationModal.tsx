import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {APP_CWD, Transition } from '../../utils/general';
import styles from './RecordValidationModal.css'
import RecordValidationModalEvents, {DEFAULT_COMPONENT_STATE} from './RecordValidationModal.events';
import { CircularProgress } from '@material-ui/core';



const _events = new RecordValidationModalEvents()

export default function FullScreenDialog(props:any) {
  const videoPlayerOutputSrc = `${APP_CWD}recorder.mp4`

  const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE})

  _events.setConstructor(state, setState, props)

  const { open, loading } = state;

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Validate & Save 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
              Close
            </Button>
          </Toolbar>
        </AppBar>
        <div className={styles["modal-content-container"]}>
        {!loading ? null:
               <div className={styles["loading-container"]}>
                   <CircularProgress />
               </div>
        } 
        {loading ? null:
        <div>
           <div className="guide-label-record">
             Is this what you recorded ?
           </div>
           <div className={styles["video-container"]}>
             <video id="video-playback-player" width="768" height="610" controls>
               <source src={videoPlayerOutputSrc} type="video/mp4" />
             </video>
           </div>
           <div className={styles["modal-verifaction-buttons-controls"]}>
             <Button size="small" variant="outlined" color="secondary"  onClick={_events.recordAgain.bind(_events)}>record again</Button>
              <div className={styles["yes-button"]}>
                 <Button  size="small" variant="outlined" color="primary" onClick={_events.userValidatedIoActions.bind(_events)}>yes</Button>
              </div>
           </div> 
        </div>
        }
        </div>
      </Dialog>
    </div>
  ) : <div></div>
}


