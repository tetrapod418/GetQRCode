import {useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';

// csvから取得したデータをもとに表示用のタグ取得
function getList(csvdata){
  // csvファイルから取得したデータをもとにlist変換
  const colums = csvdata.split('\n');
  const lists = colums.filter((colum) => colum.length > 0).map(
    (colum) => {
      const cols = colum.split(',');
        console.log(`line=${colum}`);
        console.log(`col.id=${cols[0]}`);
        return <div ><div>{cols[1]}</div><div><img className='qrcode' src={getQRCodeUrl(cols[2])} alt={cols[1]} /></div><div>{cols[3]}</div></div>

        }
  
      );
      return lists;
}


// QRコード生成用URLの取得
function getQRCodeUrl(url) {
  return `http://api.qrserver.com/v1/create-qr-code/?data=${url}&size=100x100`;
}

const UrlList = () => { 
  const baseURL = './url_list.csv';
  const [post, setPost] = useState(null);
  useEffect(() => {
    axios.get(baseURL).then((response) => {
      setPost(getList(response.data));
    });
  }, []);

  if (!post) return <p>error!</p>;

  console.log(post);
  return (
    <div>{post}</div>
  );
}

function App() {
  return(
    <div>
      <h1>kintoneアプリから取得したURLのリスト</h1>
      <UrlList />
  </div>
  );
 };

export default App;
