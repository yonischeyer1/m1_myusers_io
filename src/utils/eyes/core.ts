// const { distance } = require('fastest-levenshtein')
// const imghash = require("imghash")
// const sharp = require('sharp');
// const { createCanvas, loadImage} = require('canvas')
// const { getVideoFramesAndTime } = require('./frameStream')
// const HASH_BITS = 256;
// const IMAGE_SIZE = 227;

// const framesHashsCache = {}

// export async function getHashesDistance(hash1:any, hash2:any) {
//     return distance(hash1, hash2)
// }

// export async function tagMostSimillarFrameInVideo (snapshotPath:any, framesTime:any) {
//     const snapshotHashToFind = await imageToHash(snapshotPath)
//     const {frames, time } = framesTime
//     const fps = Math.floor(frames.length / Math.floor(time))
//     const sampleInterval = fps/2
//     return await getTagByInterval(frames, sampleInterval, snapshotHashToFind)      
// }

// export async function getTagByInterval(frames:any ,sampleInterval:any, snapshotHashToFind:any) {
//     const middleFramesOfSeconds:any = []
//     frames.map((frame:any, index:any) => {
//         if(index%sampleInterval === 0) {
//             middleFramesOfSeconds.push({frame, index});
//         }
//    })
//    const fillwithDitances = await Promise.all(middleFramesOfSeconds.map(async (frameObj:any) => {
//        const { frame , index} = frameObj
//        let frameHash;
//        if(!framesHashsCache[index]) {
//            const frameItem = await frameToHash(frame) 
//            frameHash = frameItem.frameHash
//            framesHashsCache[index] = frameItem
//        } else {
//            frameHash = framesHashsCache[index].frameHash;
//        }
//        const dist = distance(snapshotHashToFind, frameHash)
//        return {dist, index}
//    }))
//    const minmumDistnace = Math.min(...fillwithDitances.map( item => item.dist))
//    const minmumDistnaceFrame = fillwithDitances.filter( item => item.dist === minmumDistnace)
//    //concat seconds to one array 
//    let minimumFrames = [] 
//    for(const mfd of minmumDistnaceFrame) {
//        const halfASecondBeforeIndex = (mfd.index - (sampleInterval * 2)) < 0 ? 0 : (mfd.index - (sampleInterval * 2)); // 4 = 2 seconds
//        const op1 = mfd.index + (sampleInterval* 2)
//        const op2 = mfd.index + sampleInterval
//        const halfASecondAfterIndex = op1 <= frames.length ? op1 : op2 ;
//        const exactSecondFrames = frames.slice(halfASecondBeforeIndex, halfASecondAfterIndex).map((frame, idx) => {return {frame, idx:halfASecondBeforeIndex + idx}})
//        minimumFrames = minimumFrames.concat(exactSecondFrames)
//    }
//    const exactSecondDistanceFrames = await Promise.all(minimumFrames.map(async (frameItem, index) => {
//       const { frame , idx} = frameItem
//       let frameHash;
//       let frameURI;
//       if(!framesHashsCache[idx]) {
//           const frameObj = await frameToHash(frame) 
//           frameHash = frameObj.frameHash
//           frameURI = frameObj.frameURI
//           framesHashsCache[idx] = frameObj
//       } else {
//         frameHash = framesHashsCache[idx].frameHash;
//         frameURI = framesHashsCache[idx].frameURI;
//       }
//       const dist = distance(snapshotHashToFind, frameHash)
//       return {dist, idx, frameHash, frameURI}
//    }))
//    const finalMinmumDistnace = Math.min(...exactSecondDistanceFrames.map( item => item.dist))
//    const finalminmumDistnaceFrame = exactSecondDistanceFrames.find( item => item.dist === finalMinmumDistnace)
//    return finalminmumDistnaceFrame;
// }


// export async function imageToHash(imagePath:any) {
//     const frameResizedBuffer = await resizeImageNODEJS(imagePath)
//     const frameURI = frameAsBase64String(frameResizedBuffer)
//     const frameCanvas = await convertURIToImageDataNodeJS(frameURI);
//     const frameHash = imghash.hashRaw(frameCanvas.getContext('2d').getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE), HASH_BITS);
//     return frameHash;
// }

// export async function imageToHashAndURI(imagePath:any) {
//     const frameResizedBuffer = await resizeImageNODEJS(imagePath)
//     const frameURI = frameAsBase64String(frameResizedBuffer)
//     const frameCanvas = await convertURIToImageDataNodeJS(frameURI);
//     const frameHash = imghash.hashRaw(frameCanvas.getContext('2d').getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE), HASH_BITS);
//     return {frameHash, frameURI};
// }

// export async function frameToHash(frame:any) {
//     const frameResizedBuffer = await resizeImageNODEJS(frame)
//     const frameURI = frameAsBase64String(frameResizedBuffer)
//     const frameCanvas = await convertURIToImageDataNodeJS(frameURI);
//     const frameHash = imghash.hashRaw(frameCanvas.getContext('2d').getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE), HASH_BITS);
//     return {frameHash, frameURI};
// }

// export function frameAsBase64String(frame:any) {
//     frame = Buffer.from(frame, 'binary').toString('base64')
//     frame = 'data:image/jpeg;base64,' + frame
//     return frame;
// }

// export async function resizeImageNODEJS(frame:any) {
//     return await sharp(frame).resize(IMAGE_SIZE, IMAGE_SIZE).toBuffer();
// }


// export function convertURIToImageDataNodeJS(URI:any) {
//     return new Promise((resolve, reject) => {
//         let canvas = createCanvas(IMAGE_SIZE, IMAGE_SIZE)
//         let context = canvas.getContext('2d')
//         loadImage(URI).then((image:any) => {
//             context.drawImage(image, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
//             resolve(canvas);
//         })
//     })
// }



