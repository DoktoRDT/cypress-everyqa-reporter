import {default as axios} from 'axios';
import * as deasync from 'deasync';

function request(options) {
    return axios(options)
        .then((res) => res.data)
        .catch((e) => {
            console.error(e);
            throw e;
        });
}

const everyqaApiUrl = 'https://everyqa.io/api/';

export class EveryqaInstance {
    user;
    runId;
    token;
    static instance: EveryqaInstance;

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

    publish(body) {
        if (!Object.keys(body.tests).length) {
            return ;
        }
        if (!this.runId) {
            this.createTestRun({
                projectId: body.projectId,
                sprintId: body.sprintId,
            });
        }
        deasync.loopWhile(() => !this.runId);
        body.runId = this.runId;
        return request(
            {
                url: everyqaApiUrl + 'runs/fill',
                data: body,
                method: 'POST',
                headers: {
                    Authorization: this.token,
                }
            });

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
