"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
var fs = require("fs");
var path = require("path");
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.getEveryqaId = function (title) {
        var matchedId = title.match(/(?:^|\s)\[EQ-[0-9a-f]{24}\](?:$|\s)/g);
        if (!matchedId) {
            return;
        }
        return matchedId[0].trim().slice(4, -1);
    };
    Utils.getScreenshotsPaths = function (folderPath) {
        var _this = this;
        if (!fs.existsSync(folderPath)) {
            return [];
        }
        return fs.readdirSync(folderPath)
            .reduce(function (acc, screenshotName) {
            if (_this.getEveryqaId(screenshotName)) {
                acc.push(path.join(folderPath, screenshotName));
            }
            return acc;
        }, []);
    };
    return Utils;
}());
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map