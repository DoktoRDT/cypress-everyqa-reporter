"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var deasync = require("deasync");
function request(options) {
    return axios_1.default(options)
        .then(function (res) { return res.data; })
        .catch(function (e) {
        console.error(e);
        throw e;
    });
}
var everyqaApiUrl = 'https://everyqa.io/api/';
var EveryqaInstance = /** @class */ (function () {
    function EveryqaInstance(_a) {
        var _this = this;
        var email = _a.email, password = _a.password;
        if (!EveryqaInstance.instance) {
            this.login({ email: email, password: password });
            deasync.loopWhile(function () { return !_this.token; });
            EveryqaInstance.instance = this;
        }
        else {
            return EveryqaInstance.instance;
        }
    }
    EveryqaInstance.prototype.createTestRun = function (_a) {
        var _this = this;
        var projectId = _a.projectId, sprintId = _a.sprintId;
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
                projectId: projectId
            }
        })
            .then(function (res) {
            _this.runId = res._id;
        });
    };
    EveryqaInstance.prototype.publish = function (body) {
        var _this = this;
        if (!Object.keys(body.tests).length) {
            return;
        }
        if (!this.runId) {
            this.createTestRun({
                projectId: body.projectId,
                sprintId: body.sprintId,
            });
        }
        deasync.loopWhile(function () { return !_this.runId; });
        body.runId = this.runId;
        return request({
            url: everyqaApiUrl + 'runs/fill',
            data: body,
            method: 'POST',
            headers: {
                Authorization: this.token,
            }
        });
    };
    EveryqaInstance.prototype.login = function (_a) {
        var _this = this;
        var email = _a.email, password = _a.password;
        return request({
            url: everyqaApiUrl + 'auth/signin',
            method: 'post',
            data: {
                email: email,
                password: password
            },
        })
            .then(function (res) {
            _this.user = res;
            _this.token = 'jwt ' + _this.user.token.accessToken;
        });
    };
    return EveryqaInstance;
}());
exports.EveryqaInstance = EveryqaInstance;
//# sourceMappingURL=everyqa.instance.js.map