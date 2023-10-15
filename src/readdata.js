import * as fs from "node:fs/promises";

function getQRCodeUrl(url) {
  return `http://api.qrserver.com/v1/create-qr-code/?data=${url}&size=100x100`;
}

// ファイルから表示用のデータを取得する
const readList = async () => {
  const LIST_PATH = './src/url_list.txt';
  fs.readFile(LIST_PATH, { encoding: "utf8" }).then( file => {
    const records = file.split('\n');
    // 取得データ→JSON→オブジェクト
    const jsonLists = records.map(
      record => JSON.parse(JSON.stringify(record)
    ))

    console.log(`records.length = ${records.length}`);
    const arrayOfLists = jsonLists.map(
      record => <div>record.title.value<div><img src={getQRCodeUrl(record.URL.value)} alt={record.URL.value} title={record.title.value} /> </div></div> 
    );
    return arrayOfLists;
  }).catch( err => {
      console.err(err);
    }); 
} 

