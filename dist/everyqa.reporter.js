"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EveryqaReporter = void 0;
var everyqa_instance_1 = require("./everyqa.instance");
var utils_1 = require("./utils");
var path = require("path");
var everyqa_reporter_config_1 = require("./everyqa.reporter.config");
var statuses_enum_1 = require("./statuses.enum");
var EveryqaReporter = /** @class */ (function () {
    function EveryqaReporter(runner, options) {
        var _this = this;
        this.config = new everyqa_reporter_config_1.EveryqaReporterConfig(options.reporterOptions);
        var everyqaInstance = new everyqa_instance_1.EveryqaInstance({
            email: this.config.email,
            password: this.config.password,
        });
        if (this.config.runId) {
            everyqaInstance.runId = this.config.runId;
        }
        var tests = {};
        runner.on('start', function () {
            _this.specPath = path.resolve(runner.suite.file);
        });
        runner.on('test end', function (test) {
            var everyqaCaseId = utils_1.Utils.getEveryqaId(test.title);
            if (!everyqaCaseId) {
                return;
            }
            var status;
            switch (test.state) {
                case 'failed':
                    status = statuses_enum_1.StatusesEnum.Failed;
                    break;
                case 'passed':
                    status = statuses_enum_1.StatusesEnum.Passed;
                    break;
                default:
                    return;
            }
            tests[everyqaCaseId] = {
                everyqaCaseId: everyqaCaseId,
                status: status,
                attachmentIds: [],
            };
        });
        runner.on('end', function () {
            var actualPath = _this.specPath.replace(_this.config.integrationFolder, _this.config.screenshotsFolder);
            var diffPath = actualPath.replace('/actual', '/diff');
            var actualScreenshotsPaths = utils_1.Utils.getScreenshotsPaths(actualPath);
            var diffScreenshotsPaths = utils_1.Utils.getScreenshotsPaths(diffPath);
            var screenshotsForUpload = __spreadArrays(actualScreenshotsPaths, diffScreenshotsPaths).filter(function (screenshot) { return tests[utils_1.Utils.getEveryqaId(path.basename(screenshot))].status === statuses_enum_1.StatusesEnum.Failed; });
            everyqaInstance.sendScreenshots(screenshotsForUpload)
                .forEach(function (screenshot) {
                var caseId = utils_1.Utils.getEveryqaId(screenshot.name);
                tests[caseId].attachmentIds.push(screenshot._id);
            });
            everyqaInstance.publish({
                sprintId: _this.config.sprintId,
                projectId: _this.config.projectId,
                tests: tests
            });
        });
    }
    return EveryqaReporter;
}());
exports.EveryqaReporter = EveryqaReporter;
//# sourceMappingURL=everyqa.reporter.js.map