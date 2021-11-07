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
  let model = new rhino.File3dm();
  model.objects().add(brep, null);
  saveByteArray("sphere.3dm", model.toByteArray());
});

function saveByteArray(fileName, byte) {
  let blob = new Blob([byte], { type: "application/octect-stream" });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}
```

### 既存のファイルを読み取る



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
