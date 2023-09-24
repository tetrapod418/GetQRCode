import React, {useState} from "react";
import logo from './logo.svg';
import './App.css';

function App() {
  const [targetURL, setInputElement] = useState("");
  const [text, setText] = useState("ここに表示されます。");

  const getQRimage = () => {
    if(targetURL !== "") {
      // 入力されたURLをもとにAPI呼び出し文字列を生成する
      setText(`http://api.qrserver.com/v1/create-qr-code/?data=${targetURL}&size=100x100`);
      setInputElement("");
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <div className="url">
            <input value={targetURL} onChange={(e) => setInputElement(e.target.value)} type="text" placeholder="URLを入力してください" />
            <button onClick={getQRimage}>表示する</button>
          </div>
          <div className="print">
          <p>{text}</p>
          </div>
          <div className="QRCodeImage">
            <img src={text} alt="" title="" />
          </div>
        </p>
        
      </header>
    </div>
  );
}

export default App;
