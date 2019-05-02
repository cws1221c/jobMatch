const iconv = require('iconv-lite');  //인코딩 변환도구
const charset = require('charset');  //캐릭터셋 체크 도구
const request = require('request');
const cheerio = require('cheerio');

module.exports = function (date , callback) {
    date = date.split("-").join("");
    const options = {
        url: 'http://www.y-y.hs.kr/lunch.view?date=' + date,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) routerleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
        },
        encoding: null  //인코딩 값을 널로주어 별도의 인코딩을 하지 않게 한다.
    }
    request(options, function (err, response, body) {
        if (err != null) {
            console.log(err);
            return;
        }

        const enc = charset(response.headers, body); //사이트의 인코딩을 알아냄. 급식페이지는 euc-kr임
        const result = iconv.decode(body, enc);

        $ = cheerio.load(result);
        let menu = $(".menuName > span");

        callback(menu.text());
    });
}
