import { setStatePromisifed } from "../../utils/general";
import ServiceStore from '../../services /store.service'

const serviceStore = new ServiceStore();

export const DEFAULT_COMPONENT_STATE = {
    tag: {
        name:"",
        waitTime: {
            label: "custom",
            value: 1000
        },
        originalReferenceSnapshotURI:"",
        dynamic:null,
        skip:false
      },
      dynamicSnapshotModalData: false,
      pickedAction:null
}


let instance:any = null;
export default class EditTagModalEvents {
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
         if(!this.initFlag && this.props.tag) {
            this.initFlag = true;
            await this.init();
         }
   }

   async init () {
    const { tag, pickedAction } = this.props;
    await this.setState({...this.state, tag, pickedAction})
   }

    async handleClose (e:any)  {
        await this.setState({...DEFAULT_COMPONENT_STATE})
        const {handleEditTagModalClose} = this.props;
        handleEditTagModalClose(false);
        this.initFlag = false;
    };
    
    async handleSetTimeoutChange  (e:any) {
          const label = e.target.value
          const tag = this.state.tag
          tag.waitTime.label = label;
          await this.setState({...this.state, tag})
    };
    
    async handleCustomWaitTimeChange (e:any)  {
        const value = e.target.value
        const tag = this.state.tag
        tag.waitTime.value = value
        await this.setState({...this.state, tag})
      }
    
    async handleSkipChange (e:any) {
        const skip = e.target.checked
        const tag = this.state.tag
        tag.skip = skip
        await this.setState({...this.state, tag})
    }

    async handleTagNameChange (e:any) {
        const { tag } = this.state;
        const newTagName = e.target.value;
        tag.name = newTagName;
        await this.setState({...this.state, tag})
    }

    async handleTagImageClick (tag:any) {
        await this.setState({...this.state, dynamicSnapshotOpen:true, dynamicSnapshotModalData:tag})
    }
    
    async handleDynamicSnapshotModalClose (e:any)  {
        await this.setState({...this.state, dynamicSnapshotModalData:false}) 
    }

    async save (e:any) {
        const { tag, pickedAction } = this.state
        const actions = serviceStore.readDocs('actions');
        actions[pickedAction.id].tags = actions[pickedAction.id].tags.map((tagItem:any)=>{ 
            if(tagItem.id === tag.id) return tag;
            return tagItem;
        })
        serviceStore.updateDocs('actions', actions);
        this.handleClose(false)
    }
    
}

