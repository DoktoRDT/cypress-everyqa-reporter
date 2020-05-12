const schema: {
    [key: string]: {
        isRequired: boolean,
        default?: string,
        pattern?: RegExp,
        patternDescription?: string,
    }
} = {
    email: {
        isRequired: true,
    },
    password: {
        isRequired: true,
    },
    projectId: {
        isRequired: true,
        pattern: /(?:^|\s)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:$|\s)/g,
        patternDescription: 'hexadecimal uuid in "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" format',
    },
    sprintId: {
        isRequired: true,
        pattern: /(?:^|\s)[0-9a-f]{24}(?:$|\s)/g,
        patternDescription: '24-digit hexadecimal number',
    },
    runId: {
        isRequired: false,
        pattern: /(?:^|\s)[0-9a-f]{24}(?:$|\s)/g,
        patternDescription: '24-digit hexadecimal number',
    },
    screenshotsFolder: {
        isRequired: false,
        default: 'cypress/screenshots',
    },
    integrationFolder: {
        isRequired: false,
        default: 'cypress/integration',
    },
};

function validateOptions(options: any) {
    if (!options || !Object.keys(options).length) {
        throw new Error(`Missing reporterOptions.`)
    }
    for (const name in schema) {
        if (!schema[name]) {
            delete options[name];
            return;
        }
        if (schema[name].isRequired) {
            if (!options[name]) {
                throw new Error(`Missing option "${name}" in your reporterOptions.`)
            }
        }
        if (schema[name].pattern && options[name] && !options[name].match(schema[name].pattern)) {
            throw new Error(`Option "${name}" value should be a ${schema[name].patternDescription} but "${options[name]}" is given. Please check your reporterOptions`)
        }
    }
}

export class EveryqaReporterConfig {

    readonly email: string;
    readonly password: string;
    readonly sprintId: string;
    readonly projectId: string;
    readonly runId: string;
    readonly integrationFolder: string;
    readonly screenshotsFolder: string;

    constructor(options: any) {
        delete options.id;
        validateOptions(options);
        for (const name in schema) {
            this[name] = schema[name].default && !options[name] ? schema[name].default : options[name];
        }
    }
}
