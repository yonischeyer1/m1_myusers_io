import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";

export const DEFAULT_COMPONENT_STATE = {
    open:false,
    actionName:'',
    startUrl:'',
    openRecordingModal:false,
    dynamicSnapshotModalData:false,
    pickedTag:false,
    itemAndCollectionNameToDelete:false,
    pickedAction: {
      tags:[]
    },
    actionsDropdownOptions: [
        {label:'Edit', disabled:false},
    ],
    currentUserPicked:null
}

const serviceStore = new ServiceStore();
let instance:any = null;
export default class ActionsUpsertModalEvents {
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
       const { open, pickedAction, currentUserPicked } = this.props;
       let actionName, startUrl = '';
       if(pickedAction) {
           actionName = pickedAction.name
           startUrl = pickedAction.startUrl
       }
       await this.setState({
           ...this.state, 
           open, 
           pickedAction, 
           currentUserPicked,
           actionName,
           startUrl
        })
    }
  

    async handleClose (close:any, e:any)  {
        await this.setState({...DEFAULT_COMPONENT_STATE})
        const {handleUpsertActionModalClose} = this.props;
        handleUpsertActionModalClose(close);
        this.initFlag = false;
    }

    async handleAddLiveSnapshotClick (e:any) {}
    
    async handleDeletePopupClose (e:any) {
        await this.setState({...this.state, itemAndCollectionNameToDelete:false, openDeletePopup:false})
    }
    
    async handleEditTagModalClose (e:any) {
        await this.setState({...this.state, pickedTag:false})
    }
     
    async handleRecordingModalClose (close:any) {
        if(close) {
            await this.handleClose(close, null)
        } else {
            await this.setState({...this.state, openRecordingModal:false})
        }
    }
    
    async handleRecordBtnClick  (e:any) {
        await this.setState({...this.state, openRecordingModal:true})
    }

    async handleDynamicSnapshotModalSave ({tag, coords, drawURI}) {
        tag["dynamic"] = {coords, drawURI}
    }

    async handleDynamicSnapshotModalClose (e:any) {
        await this.setState({...this.state, dynamicSnapshotOpen:false})
    }

    async handleURLChange (e:any) {
        await this.setState({...this.state, startUrl: e.target.value})
    }

    async handleActionNameChange (e:any) {
        const actionName = e.target.value
        await this.setState({...this.state, actionName})
    }

    async editTag (tag:any) {
        await this.setState({...this.state, pickedTag:tag})
    }

    async deleteTag (collectionName:any, item:any) {
        const { currentUserPicked } = this.state;
        await this.setState({
            ...this.state, 
            openDeletePopup:true,
            itemAndCollectionNameToDelete:{collectionName, item, currentUserPicked}
        })
    }
    
    async handleTagMenuItemClick (tag: any, option:any)  {
      switch (option.label) {
        case 'Edit':
          await this.editTag(tag);
        break;
    
        case 'Delete':
          return;
          //deleteTag('users', user)
        break;
      
        default:
          break;
      }
    };

    async saveCurrentActionTags (e:any) {
        const { actionName, startUrl } = this.state;
        const { pickedAction } = this.props;
        pickedAction.name = actionName;
        pickedAction.startUrl = startUrl;
        const actions = serviceStore.readDocs('actions')
        actions[pickedAction.id] = pickedAction;
        serviceStore.updateDocs('actions', actions);
        this.handleClose(false, null);
    }
    
}

