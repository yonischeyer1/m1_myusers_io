import { setStatePromisifed } from "../../utils/general";

export const DEFAULT_COMPONENT_STATE = {
    port:null,
    stopPlaying:false
}

let instance:any = null

export default class PlayerLiveViewModalEvents {
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
       if(!this.initFlag && this.props.port) {
          this.initFlag = true;
          await this.init();
       }
    }
 
    async init() {
        const { port, stopPlaying } = this.props;
        await this.setState({...this.state, port, stopPlaying})
    }

    async handleClose  (e:any) {
        const {handleLivePreviewModalClose} = this.props;
        handleLivePreviewModalClose(false);
        await this.setState({...DEFAULT_COMPONENT_STATE})
        this.initFlag = false;
    }

    
}

