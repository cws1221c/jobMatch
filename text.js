const qs = require('querystring');

let string = "This is 한글 쿼리";

let encodedStr = qs.escape(string);

console.log(encodedStr);