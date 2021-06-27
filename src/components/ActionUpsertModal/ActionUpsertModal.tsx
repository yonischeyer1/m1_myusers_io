import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';
import RecordingModal from '../RecordingModal/RecordingModal'
import StaticMaskingWizard from '../StaticMaskingWizard/StaticMaskingWizard'
import styles from './ActionUpsertModal.css';
import DeletePopup from '../DeletePopup/DeletePopup';
import EditTagModal from '../EditTagModal/EditTagModal'
import { Transition } from '../../utils/general';
import ActionsUpsertModalEvents, {DEFAULT_COMPONENT_STATE} from './ActionUpsertModal.events';
import ActionsDropdown from '../ActionsDropdown/ActionsDropdown';

const _events = new ActionsUpsertModalEvents();

export default function FullScreenDialog(props:any) {
  const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE})

  _events.setConstructor(state, setState, props);

  const { 
     actionName,
     startUrl,
     open, 
     pickedAction, 
     actionsDropdownOptions, 
     itemAndCollectionNameToDelete,  
     dynamicSnapshotModalData,
     pickedTag,
     openRecordingModal,
     currentUserPicked,
    } = state;


  
  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Action Upsert 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events, false)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
          <div className={styles["test-name-container"]}>
             <TextField disabled={false} value={actionName}
             onChange={_events.handleActionNameChange.bind(_events)} 
             label="Action Name:" variant="outlined" className={styles["startUrl-input"]} size="small"/>
             
             <br/>
             
             <TextField 
              value={startUrl}
              disabled={false} 
              onChange={_events.handleURLChange.bind(_events)} 
              label="URL:" 
              variant="outlined" 
              className={styles["startUrl-input"]}
              size="small"/>
          </div>
            <br/>
        <div style={{display:"flex", alignItems:"center"}}>
        <div className={styles["recoreder-control-button"]}>
               <Button size="small" variant="outlined" color="secondary" disabled={false} onClick={_events.handleRecordBtnClick.bind(_events)}>
                 {pickedAction ? "Record Again" : "Record"}</Button>
        </div>
        <div className={styles["live-snapshot-controls"]}>
        <Button size="small" variant="outlined" color="primary" disabled={false} onClick={_events.handleAddLiveSnapshotClick.bind(_events)}>ADD Live snapshot +</Button>
        </div>
        </div>
        <br/><br/> 
         {
           !pickedAction ? null : 
           <div>
          <h3>Tag List:</h3>
           <div className={styles["tags-editor-container"]}>
              {
                 pickedAction.tags.map((tagItem:any, index:any)=>{
                  return (
                  <div style={{display:'flex', marginTop:'20px', justifyContent:"space-around"}}>
                    <div>
                       Tag name : {tagItem.name}
                    </div>
                    <ActionsDropdown options={actionsDropdownOptions} 
                    handleMenuItemClick={_events.handleTagMenuItemClick.bind(_events, tagItem)} />
                  </div>
                  )})
            }
           </div>
           </div>
         }
         <br/><br/>
         <div className={styles["done-cancel-btns"]}>
         <Button size="small" variant="outlined" color="secondary" onClick={_events.handleClose.bind(_events, false)}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={_events.saveCurrentActionTags.bind(_events)}>Save</Button>
         </div>
     </div>
     <EditTagModal 
      pickedAction={pickedAction}
      handleEditTagModalClose={_events.handleEditTagModalClose.bind(_events)} 
      tag={pickedTag}
     />
     <DeletePopup 
      handleDeletePopupClose={_events.handleDeletePopupClose.bind(_events)} 
      itemAndCollectionName={itemAndCollectionNameToDelete}
      />
     <StaticMaskingWizard 
        handleDynamicSnapshotModalSave={_events.handleDynamicSnapshotModalSave.bind(_events)}
        handleDynamicSnapshotModalClose={_events.handleDynamicSnapshotModalClose.bind(_events)} 
        tag={dynamicSnapshotModalData}
     />
     <RecordingModal 
       actionName={actionName}
       handleRecordingModalClose={_events.handleRecordingModalClose.bind(_events)} 
       open={openRecordingModal}
       currentUserPicked={currentUserPicked}
       startUrl={startUrl}
       pickedAction={pickedAction}
      />
      </Dialog>
    </div>
  ) : <div></div>
}