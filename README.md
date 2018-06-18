# Einstein Vision サンプルアプリケーション 03 (API V2 && Object Detection 対応)

Einstein Vision を試用するために、GUIをNode.jsで実装したサンプルアプリです。Heroku Buttonでデプロイするだけで、デフォルトで用意されているモデルを使用した予測・解析を試してみることができます。

この 03 から Lightning Design System スタイルを適用させ、また Object Detection のモデル試行にも対応させました。

2018/6/18

## 必要要件

- Heroku アカウント (無償の範囲内で使えますが、Einstein Vision のアドオンを使用するため、クレジットカード情報の登録が必要です)

## 実装方法

- Heroku ボタンを使ってください。
- [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## 特徴

- スマートフォンのブラウザでこの Web アプリにアクセスすることで、カメラ起動→撮影→解析を試してみることが可能です。
- 画像リサイズ処理をクライアント側で行った上でサーバーに送信し、予測・解析を行うようにしましています。

## Heroku の設定変数による定義

- API_VERSION: 使用する API のバージョンを指定します。
- MODELS_IMAGECLASSIFICATION: Image Classification のモデルを選択するセレクトボックスに表示するモデルのリストを定義します。
- MODELS_OBJECTDETECTION: Object Detection のモデルを選択するセレクトボックスに表示するモデルのリストを定義します。
- IMAGESIZE_MAX: 画像ファイルの最大サイズを指定します。(指定したサイズより大きい画像は長編が指定したサイズになるようにリサイズされます)

## 免責事項

このサンプルコードは、あくまで機能利用の1例を示すためのものであり、コードの書き方や特定ライブラリの利用を推奨したり、機能提供を保証するものではありません。