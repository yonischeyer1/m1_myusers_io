import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import VncViewerComponent from '../VncViewer/vncViewer.component';
import styles from './PlayerLiveViewModal.css'
import { Transition } from '../../utils/general';
import PlayerLiveViewModalEvents, {DEFAULT_COMPONENT_STATE} from './PlayerLiveViewModal.events';

const _events = new PlayerLiveViewModalEvents();


export default function FullScreenDialog(props:any) {
  const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE});

  _events.setConstructor(state, setState, props)

  const { port } = state;

  return port ? (
    <div>
      <Dialog fullScreen open={!!port} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
             Player Live view 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
         {!port ? null : <VncViewerComponent mode="player" port={port}/>} 
       </div>
      </Dialog>
    </div>
  ) : <div></div>
}