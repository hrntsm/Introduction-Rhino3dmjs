# Introduction to Rhino with React

Rhino に関する処理をコードでする際には一般的に C# や Python でやる場合が多いと思いますが、
JS を使っても処理することができる場合があるので、試してみましょう。

JS を使ってやる利点としてはブラウザで動くので使用者側に特に環境構築が必要ないということがあります。

## Rhino3dm を使う

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

## React

単純に上記のように HTML を使って書くことができますが、
より拡張しやすく開発するために React を使ってこれまでのものを書いていきます。

```bash
npx create-react-app rhino-react --template typescript
```
