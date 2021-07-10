import Container, { CONTAINER_MODE } from "../../services /container.service";
import { setStatePromisifed } from "../../utils/general";
import { createDummyUser } from '../../models/User.model'
import { removeContainerByName } from "../../utils/IHost";


export const DEFAULT_COMPONENT_STATE = {
    open:false,
    port: null,
    loading:false,
    openRecordValidationModal:false,
    recorderContainer:null,
    stopButtonDisable:true,
    startRecordingDateTime:null, 
    currentUserPicked:null,
    actionName:'',
    startUrl:'',
    pickedAction:null
}

let instance:any = null
export default class RecordingModalEvents {
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
        let { open, currentUserPicked, actionName, startUrl, pickedAction } = this.props;
        if(!currentUserPicked.id) {
            currentUserPicked = createDummyUser(currentUserPicked.name)
        }
        await this.setState({
            ...this.state, 
            actionName,
            open, 
            currentUserPicked, 
            startUrl,
            pickedAction
        })
        await this.initRecorder(null);
    }

    async handleClose (close:any) {
        await this.setState({...DEFAULT_COMPONENT_STATE})
        const { handleRecordingModalClose } = this.props;
        handleRecordingModalClose(close);
        this.initFlag = false;
    };

    async handleModalClosing (close:any, restart = false) {
        if(close) {
            await this.handleClose(close);
        } else {
            await this.setState({...this.state, openRecordValidationModal:false})
            if(restart) {
                await this.setState({...this.state, loading:true})
                await removeContainerByName(this.state.recorderContainer._containerName)
                await this.initRecorder(null);
            }
        }
    }


    async setLoadingState (loading:boolean)  {
        await this.setState({...this.state, loading})
    }

    async abort (e:any) {
        await this.setState({...DEFAULT_COMPONENT_STATE})
    }

    async initRecorder  (e:any) {
        const { currentUserPicked, startUrl } = this.state;
        const recorderContainer = new Container(CONTAINER_MODE.recorder);
        await recorderContainer.init()
        recorderContainer.loadingFunction = this.setLoadingState.bind(this);
        await recorderContainer.record(startUrl, currentUserPicked.id)
        await this.setState({
            ...this.state,
            recorderContainer,
            port:recorderContainer._port,
            stopButtonDisable:false,
            startRecordingDateTime:new Date(),
        })
    }

    async stopRecording (e:any) {
       await this.setState({...this.state, port:null})
       const { recorderContainer } = this.state;
       await recorderContainer.stopRecording();
       await this.setState({...this.state, openRecordValidationModal:true})
    }


}

