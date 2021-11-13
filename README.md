# Introduction to Rhino with React

Rhino に関する処理をコードでする際には一般的に C# や Python でやる場合が多いと思いますが、
JS を使っても処理することができる場合があるので、試してみましょう。

JS を使ってやる利点としてはブラウザで動くので使用者側に特に環境構築が必要ないということがあります。

ハンズオンで最終的に作成するもののは以下のページを想定しています。

- [Rhino3dm.js Intro Page](https://hiron.dev/Introduction-Rhino3dmjs/)

## html の中で Rhino3dm を使う

rhino3dm は Rhino のデータを操作することが主な目的のものになっています。
ですので、高級な関数（例えば NURBS サーフェスをメッシュ化する）を使うことはできません。
簡単な処理に使ってみましょう。

### 新しく作成する

注意点ですが、JS の Rhino3dm の処理は wasm を使っているため、
動作は非同期になるように、await や then() などを使って処理する必要があります。

```html
<!DOCTYPE html>
<html>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/rhino3dm@0.13.0/rhino3dm.min.js"></script>
    <script>
      rhino3dm().then((rhino) => {
        // ここにコードを入れていく
      }
    </script>
  </body>
</html>
```

以下のコードでは球を作ることができます。

```js
let center = [0, 0, 0];
let radius = 10;
let sphere = new rhino.Sphere(center, radius);
```

以下のようにすることがバウンディングボックスを取得することもできます。

```js
let brep = sphere.toBrep();
let bbox = brep.getBoundingBox();
console.log("Min Pt(" + bbox.min + ") Max Pt(" + bbox.max + ")");
```

文字列を追加することもできます。
以下の例では作成した sphere の Brep に対して key: Test, value: Hello Rhino! の文字列を追加しており、
Hello Rhino! が出力されます。

```js
brep.setUserString("Test", "Hello Rhino!");
alert(brep.getUserString("Test"));
```

作成したデータは 3dm ファイルとしてダウンロードして取得することができます。

```js
rhino3dm().then((rhino) => {
  let sphere = new rhino.Sphere([1, 2, 3], 12);
  let doc = new rhino.File3dm();
  doc.objects().add(sphere, null);
  saveByteArray("sphere.3dm", doc.toByteArray());
});

function saveByteArray(fileName, byte) {
  let blob = new Blob([byte], { type: "application/octect-stream" });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}
```

なお、上で設定した UserString は、ジオメトリに結びついていて、
Rhino の UI で確認するのは手間なので、
以下のように objectAttribute として設定すると、Rhino 上でも確認することができます。

```js
rhino3dm().then((rhino) => {
  let sphere = new rhino.Sphere([1, 2, 3], 12);
  let doc = new rhino.File3dm();

  let attribute = new rhino.ObjectAttribute();
  attribute.setUserString("Test", "Hello Rhino Attribute!");

  doc.objects().add(sphere, attribute);
  saveByteArray("sphere.3dm", doc.toByteArray());
});
```

以下のような形でレイヤーの設定をすることもできます。

```js
rhino3dm().then((rhino) => {
  let doc = new rhino.File3dm();

  const layer = new rhino.Layer();
  layer.name = "CreatedLayer";
  layer.color = { r: 255, g: 0, b: 0, a: 255 };
  doc.layers().add(layer);

  let attribute = new rhino.ObjectAttribute();
  attribute.setUserString("Test", "Hello Rhino!");
  attribute.layerIndex = 0;

  let sphere = new rhino.Sphere([1, 2, 3], 12);
  doc.objects().add(sphere, attribute);

  saveByteArray("sphere.3dm", doc.toByteArray());
});
```

### 既存のファイルを読み取る

ファイルを読み取る際も同様に始めます。
ファイルを作成するサイトの違いは、読み取りたいファイルのパスは定数なので
はじめに設定しておきます。

```html
<!DOCTYPE html>
<html>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/rhino3dm@0.13.0/rhino3dm.min.js"></script>
    <script>
      // 読み取りたいファイルを指定しておく
      const file = "sphere.3dm";

      rhino3dm().then(async (rhino) => {
        // ここにコードを入れていく
      });
    </script>
  </body>
</html>
```

まずファイルを読み込みます。
ブラウザから直接ローカルファイルへアクセスすることはセキュリティにより制限されているため
以下のような手順を踏んで、ローカルの 3dm ファイルを取り込みます。

```js
rhino3dm().then(async rhino => {
  let res = await fetch(file);
  let buffer = await res.arrayBuffer();
  let arr = new Uint8Array(buffer);
  let doc = rhino.File3dm.fromByteArray(arr);
}
```

ファイル内の情報は、モデルを作成したときと逆のことをすれば確認できます。
例えばジオメトリへの情報の取得は以下です。
上で作成した sphere は objects の０番目に Add したので、
０番目にアクセスすることでそれに関する情報を取得することができます。

```js
let objects = doc.objects();
let obj = objects.get(0);
console.log(obj.geometry().getUserStrings());
console.log(obj.attributes().layerIndex);
console.log(obj.attributes().getUserString("Test"));
```

レイヤーも同様です。

```js
let layers = doc.layers();
let layer = layers.get(0);
console.log(layer.name);
console.log(layer.color);
```

### まとめ

詳細にどのようなことができるかは
[公式ドキュメント](https://mcneel.github.io/rhino3dm/javascript/api/index.html)
を確認してみてください。

このドキュメント少し不親切で、どの型がどの型を継承しているかが書かれていません。

- バウンディングボックスの取得は GeometryBase クラス
- 文字列の追加は CommonObject クラス

に書かれており、それらを Brep クラスは継承しているため使えます。
そういった敬称関係は
[RhinoCommon](https://developer.rhino3d.com/api/RhinoCommon/html/R_Project_RhinoCommon.htm)
の SDK を見ないとわからないためで注意が必要です。

できること概ねこのようなことで、例えば「複数のカーブを使って Sweep する」
のようなことできません。

Rhino で存在するタイプをそのまま作成、または既に作成されているもののデータを読み取ることしかできません。
利点として、rhino3dm は Rhino がインストールされていなくても動作するので、
例えば RhinoCompute などで生成したデータを保存したり中身をチェックするときに使えます。

## React で Rhino3dm を使う

単純に上記のように HTML を使って書くことができますが、
より拡張しやすく開発するために React を使ってこれまでのものを書いていきます。

### REACT を触ってみる

以下のように打ち込むと REACT のサンプルのデータが作成されます。
ここでは `--template typescript` として TypeScript として作成していますが、
template を指定しないと JavaScript で作成されます。

```bash
npx create-react-app rhino-react --template typescript
```

問題なくプロジェクトが作成されたら、以下を打ち込むとページがビルドされサンプルのページが表示されます。

```bash
npm start
```

これで簡単な REACT をつかったサイトが作成されました。

### 半径を表示する

HTML ファイルに直接書いていたときと同様に Rhino3dm を使って球を作成しましょう。

まず Index.tsx ファイルを以下のように書き換えます。
Rhino3dm の wasm を読み込む必要があるため、以下のように cdn を使って読み込んでいます。

```ts
import { StrictMode } from "react";
import ReactDOM from "react-dom";

import App from "./App";

const rootElement = document.getElementById("root");

const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/rhino3dm@0.12.0/rhino3dm.min.js";
script.addEventListener("load", () => {
  ReactDOM.render(
    <StrictMode>
      <App />
    </StrictMode>,
    rootElement
  );
});
document.body.appendChild(script);
```

次に App.ts を以下のように書き換えます。

```ts
import React, { useEffect, useState } from "react";
import { RhinoModule, Sphere } from "rhino3dm";
import "./App.css";

declare global {
  interface Window {
    rhino3dm: any;
  }
}

export default function App() {
  const [sphere, setSphere] = useState<Sphere>();
  useEffect(() => {
    window.rhino3dm().then((Module: RhinoModule) => {
      setSphere(new Module.Sphere([1, 2, 3], 16));
    });
  }, []);

  return (
    <div className="App">
      {sphere && <p>{`sphere diameter is: ${sphere.diameter}`}</p>}
    </div>
  );
}
```

これで `npm start` で動作を確認するとブラウザに球の直径が表示されます。

### UI を作成する

ブラウザにただ結果のテキストが表示されるだけでは
React を使っている利点があまり活かせていないのでがないので、簡単に UI を整えてみます。
ここでは mui を使って見た目を整えていきます。

公式サイト

- https://mui.com/

#### タイトルバーをつける

ページの上にタイトルバーをつけてみます。
タイトルバーには mui の [App Bar](https://mui.com/components/app-bar/) を使って作ります。

新しく AppBar.tsx というファイルを作成します。
作成したら基本的には公式サイトから取得できるサンプルのコードを使用します。
ここでは最初に出てくる Basic App Bar を使います。

```ts
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

export default function ButtonAppBar(prop: any) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {prop.title}
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
```

今回使わない部分もありますが、将来のために残しておきます。

公式のサンプルと異なる点は、prop を受け取って表示するタイトルを変更できるようにしています。

作成した AppBar を App.tsx に追加して表示されるようにしましょう。
それに加えて今後拡張しやすくするため、球を作成している部分を CreateSphere 関数として分割します。

```ts
function CreateSphere() {
  const [sphere, setSphere] = useState<Sphere>();
  useEffect(() => {
    window.rhino3dm().then((Module: RhinoModule) => {
      setSphere(new Module.Sphere([1, 2, 3], 16));
    });
  }, []);

  return (
    <div className="App">
      {sphere && <p>{`sphere diameter is: ${sphere.diameter}`}</p>}
    </div>
  );
}

export default function App() {
  return (
    <div>
      <ButtonAppBar title="Rhino3dm Test Project" />
      <CreateSphere />
    </div>
  );
}
```

#### スライダーをつける

事前に書いたコードの指定された通りの球が作成されては UI として十分ではないため、
スライダーをつけてブラウザから球の半径を変えられるようにします。

スライダーは mui の [Slider](https://mui.com/components/slider/) を使って作成します。

タイトルバーは別の tsx ファイルを作成しましたが、
こちらは球の作成に紐付いているので、CreateSphere 内に記入することにします。

これまでは useEffect を使ってページを開いたときに球を作成していましたが、
スライダーを動かしたときにモデルを作成したいので、useEffect を削除します。

そして、スライダーの値が変化したときのイベントを受け取って動く onChange を作成します。
表示される文字列は、最初は球が作成されていないのでエラーにならないよう、三項演算子を使って値を切り替えるようにしています。

```ts
function CreateSphere() {
  const [sphere, setSphere] = useState<Sphere>();

  const onChange = (e: any) => {
    window.rhino3dm().then((Module: RhinoModule) => {
      setSphere(new Module.Sphere([1, 2, 3], e.target.value));
      console.log(sphere);
    });
  };

  return (
    <div>
      <p>
        {sphere
          ? "生成された Sphere の直径は " + sphere.diameter + " です。"
          : "Sphere はまだ作成されていません"}
      </p>
      <Box width={300}>
        <Slider
          defaultValue={16}
          valueLabelDisplay="auto"
          onChange={onChange}
        />
      </Box>
    </div>
  );
}
```

#### 作ったファイルをダウンロードする

作成したモデルがちゃんと想定通りに作成されているか確認するために、モデルをダウンロードできるようにします。

ここでは mui の [Button](https://mui.com/components/buttons/) を使って作成します。ボタンをクリックした際に onClick が呼ばれるようにしています。

```ts
<Button variant="contained" onClick={onClick}>
  Download
</Button>
```

onClick は HTML で作成したときの内容とほぼ同じです。
TS で書くために型を追記したり、Hook を使うために sphere の値を使ったりしています。

```ts
const onClick = () => {
  window.rhino3dm().then((Module: RhinoModule) => {
    let doc: File3dm = new Module.File3dm();

    if (sphere) {
      let item = new Module.Sphere(
        sphere.center as number[],
        sphere.radius as number
      );
      // @ts-ignore
      doc.objects().addSphere(item, null);
      saveByteArray("sphere.3dm", doc.toByteArray());
    } else {
      alert("Sphere not created");
    }
  });
};

const saveByteArray = (fileName: string, byte: any) => {
  let blob = new Blob([byte], { type: "application/octect-stream" });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

return (
  <div>
    <p>
      {sphere
        ? "生成された Sphere の直径は " + sphere.diameter + " です。"
        : "Sphere はまだ作成されていません"}
    </p>
    <Box width={300}>
      <Slider defaultValue={16} valueLabelDisplay="auto" onChange={onChange} />
    </Box>
    <Button variant="contained" onClick={onClick}>
      Download
    </Button>
  </div>
);
```

これで Download ボタンを押すと 3dm ファイルがダウンロードされます。

### 既存のファイルを読み込む

HTML でやっていたときはファイルのパスを直接指定していましたが、
ここではボタンをつけてそこからファイルを選択できるようにします。

#### Input と Check ボタンを作る

まずファイルをアップロードしてそれを処理するための関数 CheckUploadedFile 関数を作成します。

```ts
function CheckUploadedFile() {
  const [file, setFile] = useState<File>();

  const onChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const onClick = () => {
    if (file) {
      window.rhino3dm().then(async (Module: RhinoModule) => {
        const buffer: ArrayBuffer = await file.arrayBuffer();
        const arr: Uint8Array = new Uint8Array(buffer);
        // @ts-ignore
        const doc: File3dm = Module.File3dm.fromByteArray(arr);
        console.log(doc);
      });
    }
  };

  return (
    <div>
      <h3>Check Uploaded File</h3>
      <input type="file" onChange={onChange} />
      <Button variant="outlined" onClick={onClick}>
        Check
      </Button>
    </div>
  );
}
```

インプットしたあとにファイルをチェックするボタンは mui の Button を使っています。
球を作ったときの Download ボタンと同じです。

作成したものが表示されるように App 関数 の return を以下のようにします。

```ts
export default function App() {
  return (
    <div>
      <ButtonAppBar title="Rhino3dm.js Intro Page!!" />
      <CreateSphere />
      <CheckUploadedFile />
    </div>
  );
}
```

#### UserString を表示する表を作成する

今の設定では、onClick で最後の console にファイルの中身を表示しているだけでは UI には出てこないので、
HTML の部分でやったように UserStrings を取得して表示できるようにします。UserString は複数の値が許容されている連想配列なので、表形式で表示します。

表には mui の [table](https://mui.com/components/tables/) を使用します。

UserString を table に書き込む UserStringTable.tsx を作成して以下のようにします。
基本的には公式のサンプルを使っていますが、UserString を持っていない場合などにエラーにならないための処理を追加しています。

表示するデータは prop.data で受け取るようにしているので、
使う際には data に UserStrings を渡す形式にしています。

```ts
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function BasicTable(prop: any) {
  return (
    <div>
      {prop.data
        ? prop.data.map((row: string[][], gIndex: number) => (
            <div>
              <p>{"Geometry Index:" + gIndex}</p>
              <TableContainer sx={{ width: 300 }} component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Index</TableCell>
                      <TableCell align="right">Key</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.map((item: string[], index: number) => (
                      <TableRow
                        key="geometry"
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {index}
                        </TableCell>
                        <TableCell align="right">{item[0]}</TableCell>
                        <TableCell align="right">{item[1]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ))
        : null}
    </div>
  );
}
```

#### 作ったものをまとめる

UserStringTable ができたのでそれを使って、読み込んだファイルの UserString が表示されるようにします。

追加した事項は以下です。

- 読み込んだ UserString を扱う Hooks を追加
- onClick で取得した doc を CreateUserStringList に渡す部分を追加
- doc から UserStrings を取得する CreateUserStringList を作成
- return 内に Table を表示するための BasicTable を追加

```ts
function CheckUploadedFile() {
  const [file, setFile] = useState<File>();
  const [userStrings, setUserStrings] = useState<string[]>();

  const onChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const onClick = () => {
    if (file) {
      window.rhino3dm().then(async (Module: RhinoModule) => {
        const buffer: ArrayBuffer = await file.arrayBuffer();
        const arr: Uint8Array = new Uint8Array(buffer);
        // @ts-ignore
        const doc: File3dm = Module.File3dm.fromByteArray(arr);
        console.log(doc);

        CreateUserStringList(doc);
      });
    }
  };

  const CreateUserStringList = (doc: File3dm) => {
    const list: string[] = [];

    if (doc) {
      // @ts-ignore
      const objects: File3dmObjectTable = doc.objects();

      for (let i = 0; i < objects.count; i++) {
        // @ts-ignore
        const obj = objects.get(i);
        // @ts-ignore
        list.push(obj.attributes().getUserStrings());
      }
    }

    setUserStrings(list);
  };

  return (
    <div>
      <h3>Check Uploaded File</h3>
      <input type="file" onChange={onChange} />
      <Button variant="outlined" onClick={onClick}>
        Check
      </Button>
      <BasicTable data={userStrings} />
    </div>
  );
}
```

### Build して Deploy する

完成したページをデプロイしましょう。
ここでは GitHub Pages を使います。手順は以下です。

1. package.json に `"homepage": "."` を追加
1. ターミナルで `npm run build` を実行する
1. ページが build フォルダに作成される
1. フォルダ名を docs に変えて、ルートディレクトリに移動する
1. GitHub にプッシュする
1. GitHub Pages の設定から Source を今プッシュしたブランチの docs にする
1. リポジトリのトップページの Environments を見ると作成したページのリンクがあるのでそこへ飛ぶ

問題なくビルドされていれば以下のようなページが公開されます。

- [Rhino3dm.js Intro Page](https://hiron.dev/Introduction-Rhino3dmjs/)

### まとめ

React と mui を使った簡単な UI を作って Rhino3dm を扱えるようにしました。
モデルの可視化などは Threejs を使うとできたりするので、興味がある方はやってみてください。
