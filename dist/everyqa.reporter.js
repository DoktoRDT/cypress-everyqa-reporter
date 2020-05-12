"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var everyqa_instance_1 = require("./everyqa.instance");
var utils_1 = require("./utils");
var path = require("path");
var everyqa_reporter_config_1 = require("./everyqa.reporter.config");
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
            test.everyqaCaseId = utils_1.Utils.getEveryqaId(test.title);
            if (!test.everyqaCaseId) {
                return;
            }
            var status;
            switch (test.state) {
                case 'failed':
                    status = 'failed';
                    break;
                case 'passed':
                    status = 'passed';
                    break;
                default:
                    return;
            }
            tests[test.everyqaCaseId] = {
                everyqaCaseId: test.everyqaCaseId,
                result: {
                    status: status,
                    notes: 'None',
                    assignedTo: 'None',
                    attachmentIds: [],
                    jiraKey: ''
                },
                screenshots: [],
                state: test.state
            };
        });
        runner.on('end', function () {
            var _a, _b;
            var actualPath = _this.specPath.replace(_this.config.integrationFolder, _this.config.screenshotsFolder);
            var diffPath = actualPath.replace('/actual', '/diff');
            var actualScreenshotsObject = utils_1.Utils.getScreenshotsObjectFromFolder(actualPath);
            var diffScreenshotsObject = utils_1.Utils.getScreenshotsObjectFromFolder(diffPath);
            for (var _i = 0, _c = Object.keys(tests); _i < _c.length; _i++) {
                var id = _c[_i];
                if (tests[id].state !== 'failed') {
                    continue;
                }
                if (actualScreenshotsObject[id]) {
                    (_a = tests[id].screenshots).push.apply(_a, actualScreenshotsObject[id]);
                }
                if (diffScreenshotsObject[id]) {
                    (_b = tests[id].screenshots).push.apply(_b, diffScreenshotsObject[id]);
                }
            }
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