const express = require('express');
const router = express.Router();

const { EyesController } = require('./eyes.controller');
const fs = require('fs')


const _eyesController = new EyesController();

let playRecorderAction = false;

router.get('/isCorrectImage', async (req, res) => {
    req.setTimeout(0)
    const { actionId } = req.query
    if(playRecorderAction) {
        await _eyesController.fillTagHashAndURI(res)
    } else {
        await _eyesController.isDistValid(res, actionId);
    }
});

router.post('/playAction', async (req, res) => {
        req.setTimeout(0)
        const action = req.body;
        _eyesController.setCurrentAction(action)
        _eyesController.playAction(res)
});

router.post('/playRecorderAction', async (req, res) => {
    req.setTimeout(0)
    const action = req.body;
    _eyesController.setCurrentAction(action)
    playRecorderAction = true;
    await _eyesController.playRecorderAction(res)
});



module.exports = router




