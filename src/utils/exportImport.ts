import ServiceStore from '../services /store.service'
import { APP_CWD } from './general';
import fs from 'fs';
const archiver = require('archiver');



const serviceStore = new ServiceStore();

export async function exportTestSuite(testSuite: any) {
    const newTestSuitePopulatedWithActions = await populateTestSuiteWithActions(testSuite);
    const sessionsFoldersToCompress = testSuite.suite.map((test: any) => { return { path: `${APP_CWD}sessions/${test.userId}`.trim(), name: test.userId } })
    await compress(testSuite.name, sessionsFoldersToCompress, newTestSuitePopulatedWithActions);
    return;
}


export function populateTestSuiteWithActions(testSuite: any) {
    const actions = serviceStore.readDocs('actions');
    const newTestSuitePopulatedWithActions = testSuite.suite.map((test: any) => {
        test.action = actions[test.actionId]
        return test;
    })
    return newTestSuitePopulatedWithActions;
}

export async function importTestSuite(pathToGzipTestSuite: string) {

}


export async function compress(testSuiteName: any, sessionsFoldersToCompress: any, newTestSuitePopulatedWithActions: any) {
    return new Promise((resolve, reject) => {
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        const output = fs.createWriteStream(`./${testSuiteName}.zip`);

        // 'close' event is fired only when a file descriptor is involved
        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve(null)
        });

        // This event is fired when the data source is drained no matter what was the data source.
        // It is not part of this library but rather from the NodeJS Stream API.
        // @see: https://nodejs.org/api/stream.html#stream_event_end
        output.on('end', function () {
            console.log('Data has been drained');
        });

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function (err:any) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });

        // good practice to catch this error explicitly
        archive.on('error', function (err:any) {
            throw err;
        });


        archive.pipe(output);
        const stringfiredJson = JSON.stringify(newTestSuitePopulatedWithActions)
        archive.append(Buffer.from(JSON.stringify(stringfiredJson)), { name: `${testSuiteName}.json` });
        for (const sessionFolderPath of sessionsFoldersToCompress) {
            archive.directory(sessionFolderPath.path, sessionFolderPath.name)
        }
        archive.finalize();
    })
}


export async function decompress() {

}


//fs.createReadStream(Buffer.from(JSON.stringify(newTestSuitePopulatedWithActions))
