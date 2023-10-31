# React App x kintone REST API

React の初期アプリケーションをもとに、GitHub Actions で kintone のREST APIでデータを読み込んで表示するシステムの確認用アプリです。

## 実行の仕方

```
npm start
```

 [http://localhost:3000](http://localhost:3000) をブラウザ表示すると、url_list.jsの内容が表示されます。


## 参考資料

cybozu developer network の以下を参考にしました。

- 複数のレコードを取得する https://cybozu.dev/ja/kintone/docs/rest-api/records/get-records/
- kintone JavaScript Client https://cybozu.dev/ja/kintone/sdk/rest-api-client/kintone-javascript-client/
- kintone Webhook
https://cybozu.dev/ja/kintone/docs/overview/webhook/
- 外部からセキュアに kintone のデータを操作する https://cybozu.dev/ja/kintone/tips/best-practices/securely-operating-kintone-data/#precautions-for-data-registration

## 謝辞
[Cybozu Tech](https://tech.cybozu.io)の開発者である、@ehimemikan さんにソースコードのレビューとアドバイスをいただきました。
ありがとうございます。