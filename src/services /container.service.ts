import { genaratePortNumber, runDockerImage, getDockerContainerIdByName, copyFileToContainer, copyFileFromContainer, removeContainerByName, removeUserSessionFolder } from "../utils/IHost";
import { startVideoRecording, startChormium, startVnc, convertVideoFile, removeFileFromContainer, stopContainerProcess, startHandsSparkServer, startIceweasel } from "../utils/IContainer";
import IHands from "../utils/Ihands";
import IEyes from "../utils/IEyes";
import { APP_CWD } from "../utils/general";
import fs from 'fs'
export const IMAGE_NAME = 'ioroboto'
let instance:any = null;
export const CONTAINER_MODE = {
    player:'player',
    recorder:'recorder',
    login:'login'
}
export default class Container {
     _userId:null;
     autoTaggerData: null;
    _startRecordTimeStamp:null;
    _ihands :IHands | undefined;
    _ieyes :IEyes | undefined;
    _ioActions = []
    _startUrl = ""
    _mode = 'player'
    _containerId = ''
    _port = 0
    _containerName = ''
    _containerProcess = {
        vnc:{name:'x11vnc', pid:null},
        video:{name:'ffmpeg', pid:null},
        browser:{name:'chromium', pid:null},
        hands:{name:'java', pid:null}
    }
    _containerServicesPorts = {
        vnc:0,
        hands:0,
        eyes:0,
        devCustom:0
    }
    loadingFunction:any = null
    constructor(mode:string) {
        if(!instance && mode === CONTAINER_MODE.recorder){
            instance = this;
            this._mode = mode;
            this.autoTaggerData = {
                recordStartDate:null,
                timeStamps:null,
            }
        } else if (instance && mode === CONTAINER_MODE.recorder) {
            return instance;
        } else {
            this._mode = mode;
            this.autoTaggerData = {
                recordStartDate:null,
                timeStamps:null,
            }
        }
    }
    async init(startUrl:any = null, userId:any = null) {
        try {
            if(this._mode === CONTAINER_MODE.login) {
                this._containerServicesPorts.vnc = await genaratePortNumber();  
                let containerName = `${IMAGE_NAME}${this._mode}${this._containerServicesPorts.vnc}`
                await runDockerImage(this._containerServicesPorts, containerName, IMAGE_NAME);
                let containerId = (await getDockerContainerIdByName(containerName)).toString().replace(/[^a-zA-Z0-9]/g, ''); //remove spiceal chars from id
                this.setState(this._containerServicesPorts.vnc, containerId, containerName)

            }
            else {
                let port, containerName;
                this._containerServicesPorts.vnc = await genaratePortNumber();
                this._containerServicesPorts.hands = await genaratePortNumber();
                this._containerServicesPorts.eyes = await genaratePortNumber();
                this._containerServicesPorts.devCustom = await genaratePortNumber();
                console.log("  this._containerServicesPorts",  this._containerServicesPorts)
                containerName = `${IMAGE_NAME}${this._mode}${this._containerServicesPorts.vnc}`
                await runDockerImage(this._containerServicesPorts, containerName, IMAGE_NAME); 
                let containerId = (await getDockerContainerIdByName(containerName)).toString().replace(/[^a-zA-Z0-9]/g, ''); //remove spiceal chars from id
                this.setState(this._containerServicesPorts.vnc, containerId, containerName)
                this._ihands = new IHands(this._containerServicesPorts.hands);
                this._ieyes = new IEyes(this._containerServicesPorts.eyes);
                if(this._mode === CONTAINER_MODE.player) {
                   const userSessionFolderPath = `${APP_CWD}sessions/${userId}`
                   await copyFileToContainer(this._containerId, userSessionFolderPath)
                   const browserPid = await startChormium(this._containerId, this._containerProcess.browser.name, startUrl, userId);
                   this._containerProcess.browser.pid = browserPid;
                   const vncPid = await startVnc(this._containerId, this._port,this._containerProcess.vnc.name);
                   this._containerProcess.vnc.pid = vncPid;
                }
            }
        } catch(err) {

        }
    }
    setState(port:number, containerId: string, containerName:string) {
        this._containerId = containerId;
        this._containerName = containerName;
        this._port = port;
    }

    async record(startUrl:string, userId:any = null) {
        return new Promise((resolve, reject)=>{
            (async()=>{
                this._userId = userId; 
                this._startUrl = startUrl;
                const userSessionFolderPath = `${APP_CWD}sessions/${userId}`
                if(fs.existsSync(userSessionFolderPath)) {
                    await copyFileToContainer(this._containerId, userSessionFolderPath)
                }
                await this.loadingFunction(true);
                const browserPid = await startChormium(this._containerId, this._containerProcess.browser.name, startUrl, userId);
                const handsPid = await startHandsSparkServer(this._containerId, this._containerProcess.hands.name)
                this._containerProcess.hands.pid = handsPid;
                this._containerProcess.browser.pid = browserPid;
                setTimeout(()=>{
                    this._ihands.startRecordingKeyboardMouse().then((resp)=>{
                        (async()=>{
                            const vncPid = await startVnc(this._containerId, this._port, this._containerProcess.vnc.name);
                            this._containerProcess.vnc.pid = vncPid;
                            await this.loadingFunction(false);
                            resolve();
                        })()
                    });
                }, 5000)
                
            })()
        })
    }

    async login(startUrl:any, userId:any = null) {
        //https://accounts.google.com/signin/v2/identifier
        await this.loadingFunction(true);
        if(userId) {
            const userSessionFolderPath = `${APP_CWD}sessions/${userId}`
            await copyFileToContainer(this._containerId, userSessionFolderPath)
        }
        this._startUrl = startUrl;
        const browserPid = await startChormium(this._containerId, this._containerProcess.browser.name, startUrl, userId);
        this._containerProcess.browser.pid = browserPid;
        const vncPid = await startVnc(this._containerId, this._port, this._containerProcess.vnc.name);
        this._containerProcess.vnc.pid = vncPid;
        await this.loadingFunction(false);
    }

    async finishLogin(userId:any) {
        await this.loadingFunction(true);
        const userSessionFolderPath = `sessions/${userId}`
        await removeUserSessionFolder(`${APP_CWD}sessions/${userId}`.trim());
        await copyFileFromContainer(this._containerId, userId, userSessionFolderPath)
        await stopContainerProcess(this._containerId ,this._containerProcess.browser.pid)
        await this.loadingFunction(false);
    }


    async abort() {
        await stopContainerProcess(this._containerId ,this._containerProcess.hands.pid)
        await stopContainerProcess(this._containerId ,this._containerProcess.vnc.pid)
        await stopContainerProcess(this._containerId ,this._containerProcess.browser.pid)
        return;
    }

    async stopRecording(startUrl:any) {
        await this.loadingFunction(true);
        await stopContainerProcess(this._containerId ,this._containerProcess.vnc.pid)
        const ioActions = await (await this._ihands.stopRecordingKeyboardMouseAndGetIoActions()).json();
        this._ioActions = ioActions
        await stopContainerProcess(this._containerId ,this._containerProcess.browser.pid)
        //TODO: remove session folder and copy it again to container
        await removeFileFromContainer(this._containerId, `${this._userId}`)
        const userSessionFolderPath = `${APP_CWD}sessions/${this._userId}`
        await copyFileToContainer(this._containerId, userSessionFolderPath)
        await this.play(false, {ioActions});
        await this.loadingFunction(false);
    }

    async play(noLivePreview:boolean = true, action:any) {
        return new Promise((resolve, reject)=>{
            (async()=>{
                if(this._mode === CONTAINER_MODE.recorder) { 
                    const browserPid = await startChormium(this._containerId, this._containerProcess.browser.name, this._startUrl, this._userId);
                    this._containerProcess.browser.pid = browserPid;
                    const vncPid = await startVnc(this._containerId, this._port,this._containerProcess.vnc.name);
                    this._containerProcess.vnc.pid = vncPid;
                }
                const recordStartDate = new Date()
                const videoPid = await startVideoRecording(this._containerId, this._containerProcess.video.name);
                this._containerProcess.video.pid = videoPid;
                if(this._mode === CONTAINER_MODE.recorder) {
                    const pressActionsCount = await (await this._ihands.startRecorderPlayerKeyboardMouse(action.ioActions)).json()
                    this.autoTaggerData.recordStartDate =  recordStartDate
                    this.autoTaggerData.timeStamps = pressActionsCount;
                } else {
                    //Post /playAction to eyes server 
                    const handsPid = await startHandsSparkServer(this._containerId, this._containerProcess.hands.name)
                    setTimeout(()=>{
                        (async ()=>{ 
                            const resp = await this._ieyes.playAction(action)
                            await removeContainerByName(this._containerName);
                            resolve(resp)
                        })()
                    },5000)
                    // await this._ihands.startPlayerKeyboardMouse(ioActions)
                }
                // await waitUnitlCoreStopsByProcessName(this._containerId, this._containerProcess.hands.name);
                if(this._mode === CONTAINER_MODE.recorder) {
                    await convertVideoFile(this._containerId);
                    await stopContainerProcess(this._containerId ,this._containerProcess.video.pid)
                    await copyFileFromContainer(this._containerId, 'output.mp4', `${this._mode}.mp4`)
                    await removeFileFromContainer(this._containerId, 'output.mp4')
                    await removeFileFromContainer(this._containerId, 'output.avi')
                    //await removeFileFromContainer(this._containerId, 'recording.io.json')
                    await stopContainerProcess(this._containerId ,this._containerProcess.browser.pid)
                    //await removeContainerByName(this._containerName);
                    resolve(null);
                }
            })()
        })
    //     return;
    }
    async playRecorderAction(action:any, callbackStartedBrowser:any) {
        await removeFileFromContainer(this._containerId, `${this._userId}`)
        const userSessionFolderPath = `${APP_CWD}sessions/${this._userId}`
        await copyFileToContainer(this._containerId, userSessionFolderPath)
        const browserPid = await startChormium(this._containerId, this._containerProcess.browser.name, this._startUrl, this._userId);
        this._containerProcess.browser.pid = browserPid;
        await callbackStartedBrowser();
        const actionWithDists = await (await this._ieyes.playRecorderAction(action)).json()
        await stopContainerProcess(this._containerId ,this._containerProcess.browser.pid)
        return actionWithDists;
    }
    standBy() {
        //kill all process
        //clean files.
    }
    async startVnc() {
        const vncPid = await startVnc(this._containerId, this._port, this._containerProcess.vnc.name);
        this._containerProcess.vnc.pid = vncPid;
    }
}


