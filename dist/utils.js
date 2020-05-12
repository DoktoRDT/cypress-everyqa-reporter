"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.getEveryqaId = function (title) {
        var matchedId = title.match(/(?:^|\s)EQ-[0-9a-f]{24}(?:$|\s)/g);
        if (!matchedId) {
            return;
        }
        return matchedId[0].trim().slice(3);
    };
    Utils.getScreenshotsObjectFromFolder = function (folderPath) {
        if (!fs.existsSync(folderPath)) {
            return {};
        }
        return fs.readdirSync(folderPath)
            .reduce(function (acc, screenshotName) {
            var everyqaId = Utils.getEveryqaId(screenshotName);
            if (!everyqaId) {
                return acc;
            }
            var screenshot = {
                fieldname: 'attachments',
                originalname: screenshotName,
            };
            screenshot.buffer = fs.readFileSync(folderPath + '/' + screenshotName);
            screenshot.mimetype = 'image/' + path.extname(screenshotName).slice(1);
            screenshot.size = screenshot.buffer.byteLength;
            if (!acc[everyqaId]) {
                acc[everyqaId] = [];
            }
            acc[everyqaId].push(screenshot);
            return acc;
        }, {});
    };
    return Utils;
}());
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map