const {KintoneRestAPIClient} = require('@kintone/rest-api-client');
const {appendFile} = require('fs');

// リスト表示用タグの取得
function getUrlList(id, title, url, descriptions) {
  return `- ${title}<div><img src=\"${getQRCodeUrl(url)}\" alt=\"${url}\" title=\"${title}\" /><div>${descriptions}</div>`;
}

// QRコード生成用URLの取得
function getQRCodeUrl(url) {
  return `http://api.qrserver.com/v1/create-qr-code/?data=${url}&size=100x100`;
}

(async () => {
    try {
      const LIST_PATH = '../public/url_list.md';

      // クライアントの作成
      const client = new KintoneRestAPIClient({
        // kintoneのデータ取得先を設定
        baseUrl: 'https://1lc011kswasj.cybozu.com',
        auth: {
          apiToken: process.env.KINTONE_API_TOKEN
        }
      });
  
      // リクエストパラメータの設定
      const APP_ID = 2;
      const query_string = 'ステータス="accepted" order by $id';
      const params = {
        app: APP_ID,
        fields:['$id', 'ステータス', 'title', 'URL', 'descriptions'],
        query: query_string
      };
      
      // レコードの取得
      const resp = await client.record.getRecords(params);
      const kintoneRows = resp.records.map(
        (record)=>{
          const jrec = JSON.parse(JSON.stringify(record));
          // リスト表示用タグの取得
          const urldata = getUrlList(jrec.$id.value,
                                         jrec.title.value,
                                         jrec.URL.value,
                                         jrec.descriptions.value);
          // 表示用リストファイル出力
          appendFile(LIST_PATH, urldata, err => {
            if( err ){
              console.log(err.message);
            } else {
              console.log(`appended data file`);
            }
          }); 
          // 承認済データのステータス更新
          client.record.updateRecordStatus( {action:'公開する', app:APP_ID, id:jrec.$id.value});
       });

    } catch (err) {
      console.log(err);
    }
  })();
