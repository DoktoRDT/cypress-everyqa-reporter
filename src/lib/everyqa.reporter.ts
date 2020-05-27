import {Runner} from 'mocha';
import {EveryqaInstance} from './everyqa.instance';
import {Utils} from './utils';
import * as path from 'path';
import {EveryqaReporterConfig} from './everyqa.reporter.config';
import {StatusesEnum} from './statuses.enum';
import Test = Mocha.Test;

export interface TestsObject {
    [key: string]: {
        everyqaCaseId: string,
        attachmentIds: string[],
        status: string
    }
}

export class EveryqaReporter {
    private specPath: string;
    private readonly config: EveryqaReporterConfig;

    constructor(runner: Runner, options: any) {
        this.config = new EveryqaReporterConfig(options.reporterOptions);
        const everyqaInstance = new EveryqaInstance({
            email: this.config.email,
            password: this.config.password,
        });

        if (this.config.runId) {
            everyqaInstance.runId = this.config.runId;
        }
        const tests: TestsObject = {};

        runner.on('start', () => {
            this.specPath = path.resolve(runner.suite.file);
        });

        runner.on('test end', (test: Test) => {
            const everyqaCaseId = Utils.getEveryqaId(test.title);
            if (!everyqaCaseId) {
                return;
            }
            let status;
            switch (test.state) {
                case 'failed':
                    status = StatusesEnum.Failed;
                    break;
                case 'passed':
                    status = StatusesEnum.Passed;
                    break;
                default:
                    return;
            }

            tests[everyqaCaseId] = {
                everyqaCaseId,
                status,
                attachmentIds: [],
            };
        });

        runner.on('end', () => {
            const actualPath = this.specPath.replace(this.config.integrationFolder, this.config.screenshotsFolder);
            const diffPath = actualPath.replace('/actual', '/diff');
            const actualScreenshotsPaths = Utils.getScreenshotsPaths(actualPath);
            const diffScreenshotsPaths = Utils.getScreenshotsPaths(diffPath);
            const screenshotsForUpload = [...actualScreenshotsPaths, ...diffScreenshotsPaths]
                .filter(screenshot => tests[Utils.getEveryqaId(path.basename(screenshot))].status === StatusesEnum.Failed);

            everyqaInstance.sendScreenshots(screenshotsForUpload)
                .forEach(screenshot => {
                    const caseId = Utils.getEveryqaId(screenshot.name);
                    tests[caseId].attachmentIds.push(screenshot._id);
                });

            everyqaInstance.publish({
                sprintId: this.config.sprintId,
                projectId: this.config.projectId,
                tests
            });
        });

    }
}
