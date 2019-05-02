const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const qs = require('querystring');
const iconv = require('iconv-lite');
const charset = require('charset');
const mysql = require('mysql');

let router = express.Router();

/* mysql 연결부분 */
const dbinfo = require('./dbinfo');
const Top20 = require('./mymodules/Top20');
const lunch = require('./mymodules/lunch');
const datalab = require('./mymodules/NaverData');
const conn = mysql.createConnection(dbinfo);

conn.query("USE yy_30217"); //yy_30222 데이터베이스 사용


/* mysql 연결종료 */

router.get('/', function (req, res) {
    res.render('main', { msg: 'Welcome To Express4' });
});

router.get('/top20', function (req, res) {

    Top20(function (list) {
        res.render('top', {
            msg: '네이버 실시간 급상승 검색어',
            list: list
        });
    });

});

router.get('/ganyum', function (req, res) {

    request("https://gall.dcinside.com/board/lists?id=comic_new1&exception_mode=recommend", function (err, response, body) {
        let list = [];
        $ = cheerio.load(body);

        let top20 = $(".ub-content");

        for (let i = 0; i < top20.length; i++) {
            let msg = $(top20[i]).text();
            list.push(msg);
        }

        res.render('dc', {
            msg: '만갤념글 목록',
            list: list
        });
    });
});

router.post('/recom', function (req, res) {
    let sql = "INSERT INTO sibal VALUES(?)";
    request("https://gall.dcinside.com/board/lists?id=comic_new1&exception_mode=recommend", function (err, response, body) {
        let list = [];
        $ = cheerio.load(body);
        let recommendcnt = $(".ub-content > .gall_recommend");

        for (let i = 0; i < recommendcnt.length; i++) {
            let msg = $(recommendcnt[i]).text();
            list.push(msg);
        }

        for (let i = 0; i < list.length; i++) {
            let com = list[i];
            conn.query(sql, [com], function (err, result) {

            });
        }

        res.render('main', {
            msg: 'Welcome To Express4'
        });
    });
});
router.post('/ganyum', function (req, res) {

    let word = req.body.word;
    word = qs.escape(word);
    let url = "https://gall.dcinside.com/board/lists?id=" + word + "&exception_mode=recommend";
    request(url, function (err, response, body) {
        let list = [];
        $ = cheerio.load(body);

        let top20 = $(".ub-content");

        for (let i = 0; i < top20.length; i++) {
            let msg = $(top20[i]).text();
            list.push(msg);
        }

        res.render('dc', {
            msg: '념글 목록',
            list: list
        });
    });
});

router.get('/search', function (req, res) {

    res.render('search', { list: list = undefined });

});

router.post('/search', function (req, res) {

    let word = req.body.word;
    let url = "https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=" + word;
    request(url, function (err, response, body) {
        let list = [];
        $ = cheerio.load(body);

        let result = $(".sp_website .type01 > li dt > a:first-child");

        for (let i = 0; i < result.length; i++) {
            let msg = $(result[i]).text();
            list.push(msg);
        }

        res.render('search', {
            msg: '검색 결과',
            list: list
        });
    });

});

router.get('/lunch', function (req, res) {

    res.render('lunch', {

    });
});

router.post('/lunch', function (req, res) {

    lunch(req.body.date, function (menu) {
        res.render('lunch', {
            menu: menu
        });
    });

});

router.get('/board', function (req, res) {

    let sql = "SELECT * FROM board WHERE title LIKE ? ORDER BY id DESC";

    let keyword = "%%";
    if (req.query.key != undefined) {
        keyword = "%" + req.query.key + "%";
    }
    conn.query(sql, [keyword], function (err, result) {

        res.render('board', {
            list: result
        });
    });

});

router.get('/board/write', function (req, res) {

    res.render('write', {

    });

});

router.post('/board/write', function (req, res) {

    let param = [req.body.title,
    req.body.content,
    req.body.writer]

    let sql = "INSERT INTO board (title, content, writer) VALUES(?, ?, ?)";

    conn.query(sql, param, function (err, result) {

        if (!err) {
            res.redirect('/board');
        }
    });

});

router.get('/datalab2', function (req, res) {

    let data = [
        {
            "groupName": "마우스",
            "keywords": [
                "로지텍",
                "Razor",
                "맥스틸",
                "Maxtill"
            ]
        },
        {
            "groupName": "걸그룹",
            "keywords": [
                "트와이스",
                "Twice",
                "아이즈원",
                "IzOne"
            ]
        }
    ];

    datalab("2019-02-01", "2019-04-30", "week", data, function (result) {
        let colors = ["rgb(255, 192, 192)", "rgb(75, 192, 255)", "rgb(75, 255, 128)"];

        let gData = {
            "labels": [

            ], "datasets": [

            ]
        };

        let r = result.results;

        for (let i = 0; i < r.length; i++) {

            let item = {
                "label": r[i].title,
                "borderColor": colors[i],
                "fill": false,
                "lineTension": 0.2,
                "data": []
            };

            for (let j = 0; j < r[i].data.length; j++) {
                item.data.push(r[i].data[j].ratio);
                if (i == 0) {
                    let date = r[i].data[j].period;
                    let arr = date.split("-");
                    gData.labels.push(arr[1] + arr[2]);
                }
                
            }

            gData.datasets.push(item);

        }

        res.render('datalab2', {
            g:gData
        });
    });

});
11
router.post('/datalab2', function (req, res) {
    
   
    let keyword = req.body.w_keyword.split(" ");   
    let keyword2 = req.body.w_keyword2.split(" ");   


    let data = [{
            "groupName": req.body.w_title,
            "keywords": keyword
        },
        {
            "groupName": req.body.w_title2,
            "keywords": keyword2
        }];

    datalab("2019-02-01", "2019-04-30", "week", data, function (result) {
        let colors = ["rgb(255, 192, 192)", "rgb(75, 192, 255)", "rgb(75, 255, 128)"];

        let gData = {
            "labels": [

            ], "datasets": [

            ]
        };

        let r = result.results;
        console.log(r);
        for (let i = 0; i < r.length; i++) {

            let item = {
                "label": r[i].title,
                "borderColor": colors[i],
                "fill": false,
                "lineTension": 0.2,
                "data": []
            };

            for (let j = 0; j < r[i].data.length; j++) {
                item.data.push(r[i].data[j].ratio);
                if (i == 0) {
                    let date = r[i].data[j].period;
                    let arr = date.split("-");
                    gData.labels.push(arr[1] + arr[2]);
                }
                
            }

            gData.datasets.push(item);

        }

        res.render('datalab2', {
            g:gData
        });
    });
});

module.exports = router;