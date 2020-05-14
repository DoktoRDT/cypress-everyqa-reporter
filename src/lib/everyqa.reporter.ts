import {Runner} from 'mocha';
import {EveryqaInstance} from './everyqa.instance';
import {Utils} from './utils';
import * as path from 'path';
import {EveryqaReporterConfig} from './everyqa.reporter.config';
import Test = Mocha.Test;
import {StatusesEnum} from './statuses.enum';

interface ExtendedTest extends Test {
    everyqaCaseId: string;
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
        const tests: {
            [key: string]: {
                everyqaCaseId: string,
                attachmentIds: string[],
                status: string
            }
        } = {};

        runner.on('start', () => {
            this.specPath = path.resolve(runner.suite.file);
        });

        runner.on('test end', (test: ExtendedTest) => {
            test.everyqaCaseId = Utils.getEveryqaId(test.title);
            if (!test.everyqaCaseId) {
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

            tests[test.everyqaCaseId] = {
                everyqaCaseId: test.everyqaCaseId,
                attachmentIds: [],
                status
            };
        });

        runner.on('end', () => {
            const actualPath = this.specPath.replace(this.config.integrationFolder, this.config.screenshotsFolder);
            const diffPath = actualPath.replace('/actual', '/diff');
            const actualScreenshotsObject = Utils.getScreenshotsPaths(actualPath);
            const diffScreenshotsObject = Utils.getScreenshotsPaths(diffPath);
            everyqaInstance.sendScreenshots([...actualScreenshotsObject, ...diffScreenshotsObject])
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
