const { IHands } = require('./ihands')

const { distance } = require('fastest-levenshtein')

const { takeScreenshotOfDesktop, removeScreenShot } = require('./frameStream')

const { frameToHash, imageToHash, imageToHashAndURI, 
    drawOnImageAndReturnHashNODEJS, imageURIToHash } = require('./eyes.core')

const FOREVER_WAIT_TIME_DELAY = 5000;

let instance = null
class EyesController {
    constructor(){
        if(instance) {
            return instance
        }
        this.delayAttempt = false
        this._action = null
        this._tagIdx = 0
        this._faildTestDataResp = null
        this.instance = this
        return this
    }

    async setCurrentAction (action) {
        this._action = action
    }

    async playAction(res) {
        const {ioActions, id} = this._action
        const ihands = new IHands()
        const testSuccess = await (await ihands.startPlayerKeyboardMouse(ioActions, id)).json()
        if(testSuccess) {
           res.status(200).send({success:true}) 
        } else {
           res.status(200).send(this._faildTestDataResp) 
       }
    }

    async playRecorderAction(res) {
        const {ioActions, id} = this._action
        const ihands = new IHands()
        await ihands.startPlayerKeyboardMouse(ioActions, id)
        await this.removeAllScreenShots()
        res.status(200).send(this._action) 
    }

    async isDistValid(res) {
        const currentTag = await this.getCurrentTag()
        const {frameHash, hashOfTag, frameURI} = await this.captureScreenAndConvertToHash(currentTag)
        const dynamicData = await this.isDynamic(currentTag, frameURI)
        const isMatching = await this.foundMatchingScreenshot(res, dynamicData, {frameHash, hashOfTag})
        if(!isMatching.matching) {
            if(currentTag.waitTime.label === "forever") {
                return this.retryMatching(res, currentTag)
            } else {
                const isFailedTest =  await this.failTest(res, isMatching.dist ,frameURI) 
                if(!isFailedTest) {
                    return this.retryMatching(res, currentTag)
                }
            }
        }
    }

    async fillTagHashAndURI (res) {
        const currentTag = await this.getCurrentTag()
        await takeScreenshotOfDesktop(this._tagIdx)
        const filePath = `${process.cwd()}/screenshot${this._tagIdx}.jpg`
        const {frameHash, frameURI} =  await imageToHashAndURI(filePath)
        currentTag.hash = frameHash
        currentTag.originalReferenceSnapshotURI = frameURI
        currentTag.distances = [0]
        this._tagIdx++
        res.status(200).send(true) 
    }

    async getCurrentTag () {
        const tags = this._action.tags
        return tags[this._tagIdx]
    }

    async captureScreenAndConvertToHash (currentTag) {
        const hashOfTag = currentTag.hash
        await takeScreenshotOfDesktop(this._tagIdx)
        const filePath = `${process.cwd()}/screenshot${this._tagIdx}.jpg`
        const {frameHash, frameURI} =  await imageToHashAndURI(filePath)
        return {hashOfTag, frameHash, frameURI}
    }

    async isDynamic(currentTag, frameURI) {
        if(currentTag.dynamic) {
            const drawnURI = await drawOnImageAndReturnHashNODEJS(frameURI,currentTag.dynamic.coords)
            const dynamicSnapHash = await imageURIToHash(drawnURI)
            const newCurrentTagURI = await drawOnImageAndReturnHashNODEJS(currentTag.originalReferenceSnapshotURI,currentTag.dynamic.coords)
            const newCurrentTagHash = await imageURIToHash(newCurrentTagURI)
            return {dynamicSnapHash, newCurrentTagHash}
        }
        return {dynamicSnapHash:null, newCurrentTagHash:null}
    }

    async foundMatchingScreenshot (res, dynamicData, tagData) {
        const currentTag = await this.getCurrentTag()
        const {frameHash, hashOfTag} = tagData
        const {dynamicSnapHash, newCurrentTagHash} = dynamicData
        const dist = dynamicSnapHash ? distance(newCurrentTagHash,dynamicSnapHash) : distance(hashOfTag, frameHash)
        const matchingDistances = currentTag.distances.filter(x => dist <= x) 
        if(matchingDistances.length > 0) {
            this._tagIdx++
            res.status(200).send(true) 
            return {matching:true, dist}
        }
        return {matching:false, dist}
    }

    async failTest(res, dist, frameURI) {
        if(this.delayAttempt) {
            this.delayAttempt = false;
            this._faildTestDataResp = {success:false, dist, uri:frameURI, currentTagIdx:this._tagIdx}
            res.status(200).send(false) 
            return true
        }
        return false
    }

    async retryMatching(res, currentTag) {
        await removeScreenShot(this._tagIdx)
        this.delayAttempt = true;
        if(currentTag.waitTime.label === "forever") {
            await this.delay(FOREVER_WAIT_TIME_DELAY)
        } else {
            await this.delay(currentTag.waitTime.value)
        }
        await this.isDistValid(res)
    }

    async delay (waitTime) {
        await (()=>{
            return new Promise((resolve,reject)=>{
                setTimeout(()=>{resolve()}, waitTime)
            })
        })()
        return
    }

    async removeAllScreenShots () {
        for (let index = 0 ; index < this.currentTagIdx ; index++) {
            await removeScreenShot(index)
        }
        this.currentTagIdx = 0
    }    
}


module.exports = {EyesController}