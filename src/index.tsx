import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { buildDockerImage, isDockerImageBuilt } from './utils/IHost';
import { IMAGE_NAME } from './services /container.service';
import ServiceStore from './services /store.service'
(async ()=> {

    const fixPath = require('fix-path');
    fixPath();

    const isImageBuilt = await isDockerImageBuilt(IMAGE_NAME);

    console.log("isImageBuilt ?? ", isImageBuilt)
    console.log("!!isImageBuilt ?? ", !!isImageBuilt)
    
    if(!isImageBuilt){
      await buildDockerImage(IMAGE_NAME);
     }
     await (new ServiceStore().init())
     render(<App />, document.getElementById('root'));
})()
