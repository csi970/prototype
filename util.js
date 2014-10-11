//Handles cases when single values are not arrays
//Standardizes handling of xml-to-json values
var asArray = function(jsonObj) {
    return Array.isArray(jsonObj) ? jsonObj : new Array(jsonObj);
};

module.exports.asArray = asArray;
