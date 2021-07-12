import { Action, createAction, Tag, TagType } from "../../models/Action.model";
import { saveUser } from "../../models/User.model";
import ServiceStore from "../../services /store.service";
import { getRandomId, setStatePromisifed } from "../../utils/general";
import { removeContainerByName } from "../../utils/IHost";

const serviceStore = new ServiceStore();

export const DEFAULT_COMPONENT_STATE = {
  open:false,
  recorderContainer:null,
  tagsPresent:[],
  saveThis:null,
  currentUserPicked:null,
  actionName:'',
  startUrl:'',
  loading:false,
  pickedAction:null
}


let instance:any = null
export default class RecordValidationModalEvents {
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
 
    async init() {
      const { open, recorderContainer, currentUserPicked, actionName, startUrl, pickedAction } = this.props;
      await this.setState({
        ...this.state, 
        open, 
        recorderContainer, 
        currentUserPicked, 
        actionName,
        startUrl,
        pickedAction
      })
    }



    async handleClose  (close:any, restart = false)  {
        await this.setState({...DEFAULT_COMPONENT_STATE})
        const {handleModalClose} = this.props;
        handleModalClose(close, restart);
        this.initFlag = false;
    };

    async handleTagTimeoutChange (e:any, tagChanged:any) {
      const value = e.target.value
      const newTags = this.state.tagsPresent.map((tag:any)=>{
        if(tag.hash === tagChanged.hash) {
           tag.maxWaitTimeUntilFail = value;
        }
        return tag;
      })
      await this.setState({...this.state, tagsPresent:newTags})
    }
    
    async startAutoTagging () {
         const { recorderContainer } = this.props;
         let { timeStamps } = recorderContainer.autoTaggerData;
         const tags: Tag[] = [];
         for(let bbb = 0; bbb < timeStamps; bbb++) {
           tags.push({
             id:getRandomId(),
             type: TagType.NOROMAL,
             originalReferenceSnapshotURI: "",
             distances:[0],
             waitTime: {
              label: "custom",
              value: 1000
            },
             hash:"",
             skip:false,
             name:`tag-${bbb}`,
             moreSnapshots:[]
           })
         }
         return tags;
    }

    async recordAgain (e:any) {
      await this.handleClose(false, true);
    }
     
      async userValidatedIoActions (e:any)  {
        const { recorderContainer } = this.props;
        const tags = await this.startAutoTagging();
        const action = {
          tagHashFillFlag:true,
          ioActions:recorderContainer._ioActions,
          tags
        }
        this.setState({...this.state, loading:true})
        const actionWithHashes = await recorderContainer.playRecorderAction(action,async ()=>{})
        await this.setState({
          ...this.state, 
          saveThis:{tags: actionWithHashes.tags, ioActions:actionWithHashes.ioActions},
          tagsPresent:actionWithHashes.tags, 
        })
        await this.saveTags();
        await removeContainerByName(recorderContainer._containerName)
        await this.handleClose(true);
      }
    
      async saveTags() {
        const {actionName, currentUserPicked, saveThis, startUrl, pickedAction} = this.state;
        const {ioActions, tags} = saveThis;
        const users = serviceStore.readDocs('users');
        if(!users[currentUserPicked.id]) {
          await saveUser(currentUserPicked)
        }
        if(pickedAction) {
          const actions = serviceStore.readDocs('actions');
          actions[pickedAction.id] = {...pickedAction, startUrl, ioActions, tags}
          serviceStore.updateDocs('actions', actions);
        } else {
          const actionToInsert:Action = {
            name: actionName,
            ioActions,
            tags,
            startUrl
          }
          await createAction(currentUserPicked, actionToInsert); 
        }
    }
}

