const { distance } = require('fastest-levenshtein')
const imghash = require("imghash")
const sharp = require('sharp');
const { createCanvas, loadImage} = require('canvas')
const { getVideoFramesAndTime } = require('./frameStream')
const HASH_BITS = 256;
const IMAGE_SIZE = 227;

const framesHashsCache = {}

async function getHashesDistance(hash1, hash2) {
    return distance(hash1, hash2)
}

async function tagMostSimillarFrameInVideo (snapshotPath, framesTime) {
    const snapshotHashToFind = await imageToHash(snapshotPath)
    const {frames, time } = framesTime
    const fps = Math.floor(frames.length / Math.floor(time))
    const sampleInterval = fps/2
    return await getTagByInterval(frames, sampleInterval, snapshotHashToFind)      
}

async function getTagByInterval(frames ,sampleInterval, snapshotHashToFind) {
    const middleFramesOfSeconds = []
    frames.map((frame, index) => {
        if(index%sampleInterval === 0) {
            middleFramesOfSeconds.push({frame, index});
        }
   })
   const fillwithDitances = await Promise.all(middleFramesOfSeconds.map(async (frameObj) => {
       const { frame , index} = frameObj
       let frameHash;
       if(!framesHashsCache[index]) {
           const frameItem = await frameToHash(frame) 
           frameHash = frameItem.frameHash
           framesHashsCache[index] = frameItem
       } else {
           frameHash = framesHashsCache[index].frameHash;
       }
       const dist = distance(snapshotHashToFind, frameHash)
       return {dist, index}
   }))
   const minmumDistnace = Math.min(...fillwithDitances.map( item => item.dist))
   const minmumDistnaceFrame = fillwithDitances.filter( item => item.dist === minmumDistnace)
   //concat seconds to one array 
   let minimumFrames = [] 
   for(const mfd of minmumDistnaceFrame) {
       const halfASecondBeforeIndex = (mfd.index - (sampleInterval * 2)) || 0; // 4 = 2 seconds
       const op1 = mfd.index + (sampleInterval* 2)
       const op2 = mfd.index + sampleInterval
       const halfASecondAfterIndex = op1 <= frames.length ? op1 : op2 ;
       const exactSecondFrames = frames.slice(halfASecondBeforeIndex, halfASecondAfterIndex).map((frame, idx) => {return {frame, idx:halfASecondBeforeIndex + idx}})
       minimumFrames = minimumFrames.concat(exactSecondFrames)
   }
   const exactSecondDistanceFrames = await Promise.all(minimumFrames.map(async (frameItem, index) => {
      const { frame , idx} = frameItem
      let frameHash;
      let frameURI;
      if(!framesHashsCache[idx]) {
          const frameObj = await frameToHash(frame) 
          frameHash = frameObj.frameHash
          frameURI = frameObj.frameURI
          framesHashsCache[idx] = frameObj
      } else {
        frameHash = framesHashsCache[idx].frameHash;
        frameURI = framesHashsCache[idx].frameURI;
      }
      const dist = distance(snapshotHashToFind, frameHash)
      return {dist, idx, frameHash, frameURI}
   }))
   const finalMinmumDistnace = Math.min(...exactSecondDistanceFrames.map( item => item.dist))
   const finalminmumDistnaceFrame = exactSecondDistanceFrames.find( item => item.dist === finalMinmumDistnace)
   return finalminmumDistnaceFrame;
}


async function imageToHash(imagePath) {
    const frameResizedBuffer = await resizeImageNODEJS(imagePath)
    const frameURI = frameAsBase64String(frameResizedBuffer)
    console.log("FrameURI", frameURI);
    const frameCanvas = await convertURIToImageDataNodeJS(frameURI);
    const frameHash = imghash.hashRaw(frameCanvas.getContext('2d').getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE), HASH_BITS);
    return frameHash;
}


async function imageToHashAndURI(imagePath) {
    const frameResizedBuffer = await resizeImageNODEJS(imagePath)
    const frameURI = frameAsBase64String(frameResizedBuffer)
    const frameCanvas = await convertURIToImageDataNodeJS(frameURI);
    const frameHash = imghash.hashRaw(frameCanvas.getContext('2d').getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE), HASH_BITS);
    return {frameURI, frameHash};
}

async function imageURIToHash(frameURI) {
    const frameCanvas = await convertURIToImageDataNodeJS(frameURI);
    const frameHash = imghash.hashRaw(frameCanvas.getContext('2d').getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE), HASH_BITS);
    return frameHash;
}

async function frameToHash(frame) {
    const frameResizedBuffer = await resizeImageNODEJS(frame)
    const frameURI = frameAsBase64String(frameResizedBuffer)
    const frameCanvas = await convertURIToImageDataNodeJS(frameURI);
    const frameHash = imghash.hashRaw(frameCanvas.getContext('2d').getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE), HASH_BITS);
    return {frameHash, frameURI};
}

function frameAsBase64String(frame) {
    frame = Buffer.from(frame, 'binary').toString('base64')
    frame = 'data:image/jpeg;base64,' + frame
    return frame;
}

async function resizeImageNODEJS(frame) {
    return await sharp(frame).greyscale().resize(IMAGE_SIZE, IMAGE_SIZE, {fit:'fill'}).toBuffer();
}


function convertURIToImageDataNodeJS(URI) {
    return new Promise((resolve, reject) => {
        let canvas = createCanvas(IMAGE_SIZE, IMAGE_SIZE)
        let context = canvas.getContext('2d')
        loadImage(URI).then((image) => {
            context.drawImage(image, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
            resolve(canvas);
        })
    })
}

async function drawOnImageAndReturnHashNODEJS(imageDataURI, coordinates) {
    const mycanvas = await convertURIToImageDataNodeJS(imageDataURI)
    const myctx = mycanvas.getContext("2d");
    myctx.lineWidth = 1;
    myctx.strokeStyle = "white";
    myctx.lineCap = "square";
    myctx.beginPath();
    for(const cord of coordinates) { 
     const x = cord.clientX - cord.left;
     const y = cord.clientY - cord.top;
     myctx.moveTo(x,y);
     myctx.fillStyle="red";
     myctx.strokeStyle = "red";
     myctx.fillRect(x-2,y-2, cord.brushSize,cord.brushSize);
     myctx.moveTo(x,y);
    }
    myctx.stroke();
    return mycanvas.toDataURL('image/jpeg')
 }

 //TODO: if tag is dynamic :
//TODO : should return the resulting data URI and calc the hash later 
//After the above todo run server locally and test 




module.exports = { tagMostSimillarFrameInVideo, getHashesDistance, frameToHash, imageToHash, imageToHashAndURI, drawOnImageAndReturnHashNODEJS, imageURIToHash }