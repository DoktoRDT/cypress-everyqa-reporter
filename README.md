# Everyqa Reporter for Cypress
[![version](https://img.shields.io/npm/v/everyqa-cypress-reporter.svg)](https://www.npmjs.com/package/everyqa-cypress-reporter)

Send results of [Cypress](https://www.cypress.io/) runs on Everyqa.

## Install

```shell
$ npm install --save-dev everyqa-cypress-reporter
```

## Usage

Add reporter to your `cypress.json`:

```json
...
"reporter": "everyqa-cypress-reporter",
"reporterOptions": {
  "email": "email",
  "password": "password",
  "projectId": "01234567-89ab-cdef-0123-456789abcdef",
  "sprintId": "0123456789abcdef01234567",
  "runId": "0123456789abcdef01234567",
  "screenshotsFolder": "cypress/screenshots",
  "integrationFolder": "cypress/integration"
}
...
```

Titles of your tests should contain an ID of your Everyqa test cases with "EQ-" prefix:

```Javascript
"EQ-0123456789abcdef01234567 my test title"
"My test EQ-0123456789abcdef01234567 title"
```
ID should not adjoin the title:
```Javascript
"EQ-0123456789abcdef01234567my test title"
"My testEQ-0123456789abcdef01234567title"
```

## Reporter Options

**Mandatory:**

**email**: _string_ Everyqa user email.

**password**: _string_ Everyqa user password.

**projectId**: _string_ project containing your cases.

**sprintId**: _string_ sprint in which the run is(will be) located.

**Optional:**

**runId**: _string_  test run for sending results.

**screenshotsFolder** and **integrationFolder** duplicates of main `cypress.json` properties of the same name
