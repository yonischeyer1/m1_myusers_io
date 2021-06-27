import { APP_CWD, isWindows, getRandomArbitrary, APP_DOCKER_META_PATH, ExtractFrames } from "./general";
import { IMAGE_NAME } from "../services /container.service";
const { spawn } = require("child_process");
import config from '../config'

export function runLocalCMD(cmd:string, condToReturn?:any, onExit?:boolean, onData?:any) {
    try {
        return new Promise((resolve, reject)=>{
                console.log("cmd", cmd)
                const someCMD = spawn(cmd, { shell: true})
                if(!onExit) {
                    if(typeof onData === "function") {
                        someCMD.stdout.pipe(new ExtractFrames("FFD8FF")).on("data", async (data: any) => {
                            onData(data);
                        })
                    } else {
                        someCMD.stdout.on("data", async (data: any) => {
                            data = data.toString()
                            console.log("data",data)
                            if(typeof condToReturn !== "function") {
                                console.log(`someCMD.stdout condToReturn !== function`)
                                someCMD.kill()
                                resolve(data);
                            } else if(typeof condToReturn === "function" && condToReturn(data)) {
                                console.log(`someCMD.stdout condToReturn !== function && condToReturn(data)`)
                                someCMD.kill()
                                resolve(data)
                            }
                        })
                    }
                    someCMD.stderr.on("data", (err: any) => {
                        console.log(`someCMD.stderr ${err.toString()}`)
                        if(typeof onData !== "function"){
                            someCMD.kill()
                            resolve({err:err.toString()})
                        }
                    })
                } 
                someCMD.on("exit", (data:any) => {
                    if(data) {
                        data = data.toString()
                    }
                    console.log(`exit `,data)
                    someCMD.kill()
                    resolve({exit:true});
                })
        })
    } catch (err) {

    }
}


//"docker exec 2ca4b0903e48 bash -c 'export DISPLAY=:1 && java -jar iocore.jar"
export async function runContainerCMD(containerId:string ,containerCMD: string, condToReturn?:any, onExit?:boolean,ownQuots?:boolean, onData?:any) : Promise<any> {
    const containerCMDNew = ownQuots ? containerCMD : `"${containerCMD}"`
    const command = `docker exec -i ${containerId} /bin/bash -c ${containerCMDNew}`;
    const response = await runLocalCMD(command, condToReturn, onExit, onData);
    return response;
}

export async function buildDockerImage(imageName:string) {
 let cmd = ''
 if(isWindows()) {
     cmd = `cd ${APP_DOCKER_META_PATH} && docker build --rm -t ${imageName} .`
 } else {
     cmd = `docker build --rm -t ${IMAGE_NAME} ${APP_DOCKER_META_PATH}`
 }
 const response = await runLocalCMD(cmd,(data: string)=>{
     return data.indexOf("Successfully tagged") > -1;
 },false);
 return response;
}

export async function isDockerImageBuilt(imageName: string) {
    const cmd = `docker inspect --type=image ${imageName}`;
    let response:any = await runLocalCMD(cmd);
    if(response.err) {
        return false;
    }
    response = JSON.parse(response);
    return response.length > 0
}

export async function runDockerImage(ports:any, containerName:string ,imageName: string, devPort?:any) {
    const cmd = `docker run --log-driver none --shm-size=1g --name ${containerName} -d -p ${ports.vnc}:${config.CONTAINER_VNC_PORT} -p ${ports.hands}:${config.CONTAINER_IOCORE_PORT} -p ${ports.eyes}:${config.CONTAINER_VIDEO_ANALYZER_PORT} -p ${ports.devCustom}:${config.CONTAINER_DEV_CUSTOM_PORT} ${imageName} `
    const response = await runLocalCMD(cmd);
    return response;
}

export async function copyFileFromContainer(containerId:string, containerFileName:string, newFileName?:string) {
    const cotainerIoFilePath = `${containerId}:/usr/src/app/${containerFileName}`
    const outputIoFilePathInHostMachine = newFileName ? `${APP_CWD}${newFileName}` : APP_CWD;
    const command = isWindows() ? `${APP_CWD}\\dockerMeta\\pollIoFile.bat ${cotainerIoFilePath} ${outputIoFilePathInHostMachine}` : `${APP_CWD}/dockerMeta/pollIoFile.sh ${cotainerIoFilePath} ${outputIoFilePathInHostMachine}`
    const response = await runLocalCMD(command, (response: string) => {
        return response.indexOf("waited") === -1 && response.indexOf(containerId) === -1
    });
}

export async function copyFileToContainer(containerId:string, fileLocalOSPath:string) {
    const cotainerIoFilePath = `${containerId}:/usr/src/app`
    const outputIoFilePathInHostMachine = fileLocalOSPath;
    const command = isWindows() ? `${APP_CWD}\\dockerMeta\\pollIoFile.bat ${outputIoFilePathInHostMachine} ${cotainerIoFilePath}` : `${APP_CWD}/dockerMeta/pollIoFile.sh ${outputIoFilePathInHostMachine} ${cotainerIoFilePath}`
    const response = await runLocalCMD(command, (response: string) => {
        return response.indexOf("waited") === -1 && response.indexOf(containerId) === -1
    });
}

export async function removeContainerByName(containerName:any) {
    const command = `docker rm -f ${containerName}`
    await runLocalCMD(command);
    const command2 = " docker system prune -a --volumes --filter label=repo=ioroboto --filter label=repo=amd64/debian -f"
    const response = await runLocalCMD(command2);
    return response;
}


export async function killContainer(imageName:string) {
    const command = `docker rm -vf $(docker ps -a -q --filter ancestor=${imageName} | tr '\n' ' ')`;
    const response = await runLocalCMD(command);
    return response;
}

export async function removeImage(imageName:string) {
    const command = `docker rmi ${imageName}`;
    const response = await runLocalCMD(command);
    return response;
}

export async function getFullContainerName(containerName:string) :Promise<any> {
    const command = `docker ps --format "{{.Names}}" -f "name=${containerName}"`;
    const response = await runLocalCMD(command, null, false);
    return response;
}


export async function getDockerImageId(imageName: string) {
    const command = `docker ps -a -q  --filter ancestor=${imageName}`;
    const response = await runLocalCMD(command);
    return response;
}

export async function getDockerContainerIdByName(containerName: string) {
    const command = `docker ps -aqf "name=${containerName}"`;
    const response = await runLocalCMD(command);
    return response;
}

export async function copyLocalIoFile(ioFilePath: string) {
    const command = isWindows() ? `copy "${ioFilePath}" "${APP_CWD}\\dockerMeta"` : `cp ${ioFilePath} ${APP_CWD}/dockerMeta`;
    const response = await runLocalCMD(command);
    return response;
}




export async function isPortUsed(port:any) {
    const command = isWindows() ? `netstat -ano | findStr "${port}" `  : `lsof -Pi :${port} -sTCP:LISTEN -t`;
    const response:any = await runLocalCMD(command);
    return response['exit'] ? false : true;
}



export async function genaratePortNumber() {
    const port = getRandomArbitrary(5000, 6000)
    const isPortUsedFlag = await isPortUsed(port)

    if(isPortUsedFlag) {
        return genaratePortNumber();
    } else {
        return port;
    }
}

export async function removeUserSessionFolder(userSessionFolderPath:any) {
    const cmd = `rm -rf ${userSessionFolderPath}`;
    await runLocalCMD(cmd);
    return;
}