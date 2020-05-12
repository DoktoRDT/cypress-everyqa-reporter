import {Runner} from 'mocha';
import {EveryqaInstance} from './everyqa.instance';
import {Utils} from './utils';
import * as path from 'path';
import Test = Mocha.Test;
import {EveryqaReporterConfig} from './everyqa.reporter.config';

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
                result: {
                    status: string,
                    notes: string,
                    assignedTo: string,
                    attachmentIds: string[],
                    jiraKey: string
                },
                screenshots: any[],
                state: string
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
                    status,
                    notes: 'None',
                    assignedTo: 'None',
                    attachmentIds: [],
                    jiraKey: ''
                },
                screenshots: [],
                state: test.state
            };
        });

        runner.on('end', () => {
            const actualPath = this.specPath.replace(this.config.integrationFolder, this.config.screenshotsFolder);
            const diffPath = actualPath.replace('/actual', '/diff');
            const actualScreenshotsObject = Utils.getScreenshotsObjectFromFolder(actualPath);
            const diffScreenshotsObject = Utils.getScreenshotsObjectFromFolder(diffPath);
            for (const id of Object.keys(tests)) {
                if (tests[id].state !== 'failed') {
                    continue;
                }
                if (actualScreenshotsObject[id]) {
                    tests[id].screenshots.push(...actualScreenshotsObject[id]);
                }
                if (diffScreenshotsObject[id]) {
                    tests[id].screenshots.push(...diffScreenshotsObject[id]);
                }
            }
            everyqaInstance.publish({
                sprintId: this.config.sprintId,
                projectId: this.config.projectId,
                tests
            });
        });

    }
}
