import { Box, Slide, Typography } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";
import React from "react";
import { Transform } from "stream";
import crypto from 'crypto';


let appPath = process.env.NODE_ENV === 'production' ? process.resourcesPath : `${process.cwd()}/src`
if(appPath.indexOf("app.asar") > -1) {
    appPath = isWindows() ? appPath.replace("resources\\app.asar","app") : appPath.replace("Resources/app.asar","app")
}

export const APP_CWD = isWindows() ? `${appPath}\\` : `${appPath}/` ;
export const APP_DOCKER_META_PATH =  isWindows() ? `${APP_CWD}dockerMeta\\` : `${APP_CWD}dockerMeta/`
 
export function isWindows( ) {
    return process.platform.indexOf("win32") > -1;
}

export const sleep = (timeInMs:number) => {
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve(null)
    }, timeInMs)
  })
}


export function getRandomArbitrary(min:number, max:number) {
  return Math.ceil(Math.random() * (max - min) + min);
}

export function toDataURL(url:any, callback:any) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

export class ExtractFrames extends Transform {
  delimiter: any;
  buffer: any;
  constructor(delimiter:any) {
    super({ readableObjectMode: true })
    this.delimiter = Buffer.from(delimiter, "hex")
    this.buffer = Buffer.alloc(0)
  }

  _transform(data:any, enc:any, cb:any) {
    // Add new data to buffer
    this.buffer = Buffer.concat([this.buffer, data])
    while (true) {
      const start = this.buffer.indexOf(this.delimiter)
      if (start < 0) break // there's no frame data at all
      const end = this.buffer.indexOf(
        this.delimiter,
        start + this.delimiter.length,
      )
      if (end < 0) break // we haven't got the whole frame yet
      this.push(this.buffer.slice(start, end)) // emit a frame
      this.buffer = this.buffer.slice(end) // remove frame data from buffer
      if (start > 0) console.error(`Discarded ${start} bytes of invalid data`)
    }
    cb()
  }
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


export function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


export const Transition = React.forwardRef(function Transition(
props: TransitionProps & { children?: React.ReactElement },
ref: React.Ref<unknown>,
) {
return <Slide direction="up" ref={ref} {...props} />;
});


export const getRandomId = () => {
  return crypto.randomBytes(20).toString('hex');
}

export const setStatePromisifed = (setState:any, newState:any) => {
  return new Promise((resolve)=>{
    setTimeout(()=>{
      setState(newState)
      resolve(null);
    },0)
  })
}
