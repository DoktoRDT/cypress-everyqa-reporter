import {default as axios} from 'axios';
import * as deasync from 'deasync';
import {loopWhile} from 'deasync';
import * as FormData from 'form-data';
import {createReadStream} from 'fs';
import {TestsObject} from "./everyqa.reporter";

export interface PublishRequest {
    sprintId: string,
    projectId: string,
    tests: TestsObject,
}

export interface ScreenshotsResponse {
    _id: string;
    name: string;
    link: string;
    size: number;
    createdAt: Date;
    networkId: string;
    isDeleted: boolean;
}

function request(options) {
    return axios(options)
        .then((res) => res.data)
        .catch((e) => {
            throw e;
        });
}

const everyqaApiUrl = 'https://everyqa.io/api/';

export class EveryqaInstance {
    user;
    runId;
    token;
    private static instance: EveryqaInstance;

    constructor({email, password}) {
        if (!EveryqaInstance.instance) {
            this.login({email, password});
            deasync.loopWhile(() => !this.token);
            EveryqaInstance.instance = this;
        } else {
            return EveryqaInstance.instance;
        }
    }

    private createTestRun({projectId, sprintId}) {
        return request({
            url: everyqaApiUrl + 'runs',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                Authorization: this.token
            },
            data: {
                name: 'Cypress test run ' + new Date().toISOString().slice(0, -8),
                releaseId: sprintId,
                userId: null,
                status: 'in progress',
                projectId
            }
        })
            .then(res => {
                this.runId = res._id;
            });
    }

    sendScreenshots(screenshotPaths: string[]) {
        let isRequestProcessing = true;
        let result: ScreenshotsResponse[];
        const form = new FormData();
        screenshotPaths.forEach(screenshotPath => {
            form.append('attachments[]', createReadStream(screenshotPath));
        });
        request({
            url: everyqaApiUrl + 'attachments',
            data: form,
            method: 'POST',
            headers: {
                ...form.getHeaders(),
                Authorization: this.token,
            }
        }).then(res => {
            result = res;
            isRequestProcessing = false
        });
        loopWhile(() => isRequestProcessing);
        return result;
    }

    publish(body: PublishRequest) {
        if (!body.tests || !Object.keys(body.tests).length) {
            return;
        }
        if (!this.runId) {
            this.createTestRun({
                projectId: body.projectId,
                sprintId: body.sprintId,
            });
        }
        deasync.loopWhile(() => !this.runId);
        let isRunFilled = false;
        request(
            {
                url: everyqaApiUrl + 'runs/' + this.runId + '/fill',
                data: body,
                method: 'POST',
                headers: {
                    Authorization: this.token,
                }
            }).then(() => {
                isRunFilled = true
            });
        deasync.loopWhile(() => !isRunFilled);
    }

    private login({email, password}) {
        return request({
            url: everyqaApiUrl + 'auth/signin',
            method: 'post',
            data: {
                email,
                password
            },
        })
            .then(res => {
                this.user = res;
                this.token = 'jwt ' + this.user.token.accessToken;
            });
    }
}
