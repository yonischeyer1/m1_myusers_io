export enum TEST_STATUS {
    IDLE = "IDLE",
    PLAYING = "PLAYING",
    FAIL = "FAIL",
    SUCCESS = "SUCCESS"
}

export interface TestModel {
    id:any
    schedule?:{}
    testName:string
    userId:string
    actionId:string
    status:TEST_STATUS
}

export interface Test {
    id?:string
    name:string
    suite:TestModel[]
    lastFailResult:any
}

export interface UserAction {
    userId:string
    actionId:string
}