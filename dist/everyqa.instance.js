"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EveryqaInstance = void 0;
var axios_1 = require("axios");
var deasync = require("deasync");
var deasync_1 = require("deasync");
var FormData = require("form-data");
var fs_1 = require("fs");
function request(options) {
    return axios_1.default(options)
        .then(function (res) { return res.data; })
        .catch(function (e) {
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
    EveryqaInstance.prototype.sendScreenshots = function (screenshotPaths) {
        var isRequestProcessing = true;
        var result;
        var form = new FormData();
        screenshotPaths.forEach(function (screenshotPath) {
            form.append('attachments[]', fs_1.createReadStream(screenshotPath));
        });
        request({
            url: everyqaApiUrl + 'attachments',
            data: form,
            method: 'POST',
            headers: __assign(__assign({}, form.getHeaders()), { Authorization: this.token })
        }).then(function (res) {
            result = res;
            isRequestProcessing = false;
        });
        deasync_1.loopWhile(function () { return isRequestProcessing; });
        return result;
    };
    EveryqaInstance.prototype.publish = function (body) {
        var _this = this;
        if (!body.tests || !Object.keys(body.tests).length) {
            return;
        }
        if (!this.runId) {
            this.createTestRun({
                projectId: body.projectId,
                sprintId: body.sprintId,
            });
        }
        deasync.loopWhile(function () { return !_this.runId; });
        var isRunFilled = false;
        request({
            url: everyqaApiUrl + 'runs/' + this.runId + '/fill',
            data: body,
            method: 'POST',
            headers: {
                Authorization: this.token,
            }
        }).then(function () {
            isRunFilled = true;
        });
        deasync.loopWhile(function () { return !isRunFilled; });
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