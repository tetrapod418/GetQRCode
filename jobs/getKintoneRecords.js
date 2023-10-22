const {KintoneRestAPIClient} = require('@kintone/rest-api-client');

function getQRCodeUrl(url) {
  return `http://api.qrserver.com/v1/create-qr-code/?data=${url}&size=100x100`;
}

// 更新対象データの有無チェック
function isExistUpdateData(rows) {
  const items = rows.records.map(
    (record) => {
      // 取得データ→JSON→オブジェクト
      const srcData = JSON.stringify(record);
      const jrec = JSON.parse(srcData);
      if(jrec.ステータス.value === 'accepted') {
        console.log(`jrec.ステータス.value = ${jrec.ステータス.value}`);
        return true;
      }

  }); 
  return false;
}

(async () => {
    try {
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
      const query_string = 'ステータス="accepted" or ステータス="published" order by $id';
      const params = {
        app: APP_ID,
        fields:['$id', 'ステータス', 'title', 'URL', 'descriptions'],
        query: query_string
      };
      
      // レコードの取得
      const resp = await client.record.getRecords(params);
      console.log(resp.records);

      // 新しい対象データの有無
      if(isExistUpdateData(resp) === false){
        return;
      }

      const LIST_PATH = './src/url_list.js';

      // リスト追加先のファイル準備
      const fs = require('fs');
      fs.open(LIST_PATH, 'w+', err => {
        if( err ){
          console.log(err.message);
          return;
        }
      });
      fs.writeFile(LIST_PATH, "export function UrlList() { \n\t return ( <ul>\n", err => {
        if( err ){
          console.log(err.message);
        } else {
          console.log(`appendFile function start`);
        }
      }); 

      resp.records.map(
          (record, index) => {
            // 取得データ→JSON→オブジェクト
            const srcData = JSON.stringify(record);
            const jrec = JSON.parse(srcData);
            const urllist = `\t\t<li><div>${jrec.title.value}<div><img src=\"${getQRCodeUrl(jrec.URL.value)}\" alt=\"${jrec.URL.value}\" title=\"${jrec.title.value}\" /><div>${jrec.descriptions.value}</div></div></div></li>\n`;
            // 取得データを表示対象リストに追加する
            fs.appendFile(LIST_PATH, urllist + '\n', err => {
              if( err ){
                console.log(err.message);
              } else {
                console.log(`appendFile id=${jrec.$id.value}`);
                if(index === resp.records.length-1){
                  // 取得データを表示用のオブジェクトとして整える
                  fs.appendFile(LIST_PATH, "</ul>\n);\n}", err => {
                    if( err ){
                      console.log(err.message);
                    } else {
                      console.log(`appendFile closetag`);
                    }
                  }); 
                }
              }
            }); 

            // 取得レコードのステータス更新
            if(record.ステータス === "accepted"){
              client.record.updateRecordStatus( {action:'公開する', app:APP_ID, id:jrec.$id.value})
            }
          });
 
    } catch (err) {
      console.log(err);
    }
  })();