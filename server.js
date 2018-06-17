'use strict'

const jwt = require('jsonwebtoken');
const request = require('request');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

app.use("/assets", express.static(__dirname + '/assets'));

app.set("view engine", "ejs");
app.get("/", (req, res, next) => {
  res.render("index", {
    "title": process.env.TITLE,
    "models_imageclassification": process.env.MODELS_IMAGECLASSIFICATION,
    "models_objectdetection": process.env.MODELS_OBJECTDETECTION,
    "imagesize_max": process.env.IMAGESIZE_MAX
  });
})

io.on('connection', (socket) => {
  socket.on('callVisionApi', (params, cb) => {

    //OAuthトークンを取得するための情報を組み立てていく
    let url = process.env.EINSTEIN_VISION_URL + process.env.API_VERSION + '/';
    let private_key = process.env.EINSTEIN_VISION_PRIVATE_KEY
    let account_id = process.env.EINSTEIN_VISION_ACCOUNT_ID
    let reqUrl = url + 'oauth2/token';

    // JWT payload
    let rsa_payload = {
      "sub": account_id,
      "aud": reqUrl
    }

    let rsa_options = {
      header: {
        "alg": "RS256",
        "typ": "JWT"
      },
      expiresIn: '1m'
    }

    // Sign the JWT payload
    let assertion = jwt.sign(
      rsa_payload,
      private_key,
      rsa_options
    );

    //リクエストの組み立て
    let options = {
      url: reqUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(assertion)}`
    }

    //組み立てたリクエスト文をPOSTで送信
    //レンスポンスが返ってきたらファンクション内を実行
    request.post(options, function (error, response, body) {

      //アクセストークンを含むJSONレスポンスをオブジェクトにパース
      let data = JSON.parse(body);
      //console.log(data["access_token"]);

      let reqUrl = url + 'vision/predict';
      if (params.func == 'IMAGECLASSIFICATION') {
        reqUrl = url + 'vision/predict';
      } else if (params.func == 'OBJECTDETECTION') {
        reqUrl = url + 'vision/detect';
      }
      //Multipart-Formで送るので渡されてきたモデルIDとbase64でエンコードされた画像データをFormデータ化準備
      let formData = {
        modelId: params.modelId,
        sampleBase64Content: params.base64img.slice(23)
      }

      //予測・解析を行うリクエスト文を組み立て
      let reqOptionsPrediction = {
        url: reqUrl,
        headers: {
          'Authorization': 'Bearer ' + data["access_token"],
          'Cache-Control': 'no-cache',
          'Content-Type': 'multipart/form-data'
        },
        formData: formData
      }

      //組み立てたリクエスト文を送信
      request.post(reqOptionsPrediction, function (error, response, body) {
        //引数として渡されてきたコールバック関数に、返り値のJSONを渡して呼び出し
        cb(body);
      });
    });
  });
});

http.listen(port, () => {
  console.log('Served port: ' + port);
});