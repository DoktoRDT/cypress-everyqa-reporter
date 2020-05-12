"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schema = {
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
function validateOptions(options) {
    if (!options || !Object.keys(options).length) {
        throw new Error("Missing reporterOptions.");
    }
    for (var name_1 in schema) {
        if (!schema[name_1]) {
            delete options[name_1];
            return;
        }
        if (schema[name_1].isRequired) {
            if (!options[name_1]) {
                throw new Error("Missing option \"" + name_1 + "\" in your reporterOptions.");
            }
        }
        if (schema[name_1].pattern && options[name_1] && !options[name_1].match(schema[name_1].pattern)) {
            throw new Error("Option \"" + name_1 + "\" value should be a " + schema[name_1].patternDescription + " but \"" + options[name_1] + "\" is given. Please check your reporterOptions");
        }
    }
}
var EveryqaReporterConfig = /** @class */ (function () {
    function EveryqaReporterConfig(options) {
        delete options.id;
        validateOptions(options);
        for (var name_2 in schema) {
            this[name_2] = schema[name_2].default && !options[name_2] ? schema[name_2].default : options[name_2];
        }
    }
    return EveryqaReporterConfig;
}());
exports.EveryqaReporterConfig = EveryqaReporterConfig;
//# sourceMappingURL=everyqa.reporter.config.js.map