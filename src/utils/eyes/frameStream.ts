// const { spawn }  = require("child_process")
// const { Transform } = require("stream");
// import moment from 'moment'

// export function getVideoFrameByFrame(videoFilePath:any , frameRcvCallback:any) {
//        const command = `ffmpeg -y -i ${videoFilePath} -vcodec mjpeg -f rawvideo -s 1024x768 pipe:1`
//        const someCMD = spawn(command, { shell: true})
//        someCMD.stdout.pipe(new ExtractFrames()).on("data", (frame:any) => {
//          frameRcvCallback(frame)
//        })
//        someCMD.stderr.on("data",(err:any) =>{
//          const errorMessage = err.toString()
//          console.error(errorMessage)
//        })
//        someCMD.on("exit",async () =>{
//            someCMD.kill()
//            console.log("exit")
//            frameRcvCallback(null);
//        })
//   }

// export function getAllFramesOfVideo(videoFilePath:any) {
// return new Promise((resolve, reject)=> {
//     const frames:any = []
//     getVideoFrameByFrame(videoFilePath, (frame:any)=>{ 
//         if(!frame) {
//             return resolve(frames)
//         }
//         frames.push(frame);
//     })
// })
// }

// export async function getVideoFramesAndTime(videoFilePath:any) {
//   const frames = await getAllFramesOfVideo(videoFilePath)
//   const time = await getTotalVideoTimeInSeconds(videoFilePath);
//   return {frames, time}
// }

//   class ExtractFrames extends Transform {
//     constructor(delimiter = "FFD8FF") {
//       super({ readableObjectMode: true })
//       this.delimiter = Buffer.from(delimiter, "hex")
//       this.buffer = Buffer.alloc(0)
//     }
//      _transform(data:any, enc:any, cb:any) {
//       // Add new data to buffer
//       this.buffer = Buffer.concat([this.buffer, data])
//       while (true) {
//         const start = this.buffer.indexOf(this.delimiter)
//         if (start < 0) break // there's no frame data at all
//         const end = this.buffer.indexOf(
//           this.delimiter,
//           start + this.delimiter.length,
//         )
//         if (end < 0) break // we haven't got the whole frame yet
//         this.push(this.buffer.slice(start, end)) // emit a frame
//         this.buffer = this.buffer.slice(end) // remove frame data from buffer
//         if (start > 0) console.error(`Discarded ${start} bytes of invalid data`)
//       }
//       cb()
//     }
//   }

// export function getTotalVideoTimeInSeconds (videoFilePath:any) {
//   return new Promise((resolve, reject)=>{
//     const command = `ffmpeg -i ${videoFilePath} 2>&1 | grep Duration | awk '{print $2}' | tr -d ,`; //time format 01:23:45
//     const someCMD = spawn(command, { shell: true})
//     someCMD.stdout.on("data", (data:any) => {
//       resolve(convertVideoTimeString(data.toString()))
//     })
//     someCMD.stderr.on("data",(err:any) =>{
//       const errorMessage = err.toString()
//       console.error(errorMessage)
//     })
//     someCMD.on("exit",async () =>{
//         someCMD.kill()
//         console.log("exit")
//     })
//   })
// }

// export function convertVideoTimeString(time:any) {
//     time = time.replace(/[^a-zA-Z0-9-:.]/g, '')
//     return moment.duration(time).asSeconds()
// }


