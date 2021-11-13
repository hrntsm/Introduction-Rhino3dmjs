# Introduction to Rhino with React

In general, you can use C# or Python to handle Rhino in your code.
JS can also be used in some cases, so let's give it a try.

One of the advantages of using JS is that it runs in a browser, so the user does not need to build any particular environment.

The following pages are expected to be created in the hands-on session.

- [Rhino3dm.js Intro Page](https://hiron.dev/Introduction-Rhino3dmjs/)

## Use Rhino3dm in html

The main purpose of rhino3dm is to handle Rhino data.
Therefore, you cannot use advanced geometry functions (e.g., meshing a NURBS surface).
Let's use it for simple operations.

### Create new geometry

It is important to note that Rhino3dm.js uses wasm, so it is necessary to use await, then(), etc. to make the operation asynchronous.

```html
<!DOCTYPE html>
<html>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/rhino3dm@0.13.0/rhino3dm.min.js"></script>
    <script>
      rhino3dm().then((rhino) => {
        // Add code
      }
    </script>
  </body>
</html>
```

The following code can be used to create a sphere.

```js
let center = [0, 0, 0];
let radius = 10;
let sphere = new rhino.Sphere(center, radius);
```

You can also get a bounding box by doing the following

```js
let brep = sphere.toBrep();
let bbox = brep.getBoundingBox();
console.log("Min Pt(" + bbox.min + ") Max Pt(" + bbox.max + ")");
```

You can also add strings.
In the following example, the key: Test, value: Hello Rhino! is added to the Brep of the sphere that we created, and The output is Hello Rhino!

```js
brep.setUserString("Test", "Hello Rhino!");
alert(brep.getUserString("Test"));
```

The created data can be downloaded and retrieved as a 3dm file.

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

Since the UserString set above is associated with the geometry and it is not easy to check it in the Rhino UI,
you can check it in Rhino by setting it as an objectAttribute as shown below.

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

You can also set up layers in the following way.

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

### Load & read local 3dm file

Start in the same way when reading a file.
The difference is that the site where the file is created has a constant path to the file to be read. Set it in the beginning.

```html
<!DOCTYPE html>
<html>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/rhino3dm@0.13.0/rhino3dm.min.js"></script>
    <script>
      // Set file path
      const file = "sphere.3dm";

      rhino3dm().then(async (rhino) => {
        // Add code
      });
    </script>
  </body>
</html>
```

First, load the file.
Accessing local files directly from the browser is restricted by security. The following steps are required to import a local 3dm file.

```js
rhino3dm().then(async rhino => {
  let res = await fetch(file);
  let buffer = await res.arrayBuffer();
  let arr = new Uint8Array(buffer);
  let doc = rhino.File3dm.fromByteArray(arr);
}
```

You can check the information in the file by doing the opposite of what you did when you created the model.
For example, here is how to get the information to the geometry
The sphere we created above was added to the 0th object, so we can access the You can get information about it by accessing the 0th object.

```js
let objects = doc.objects();
let obj = objects.get(0);
console.log(obj.geometry().getUserStrings());
console.log(obj.attributes().layerIndex);
console.log(obj.attributes().getUserString("Test"));
```

The same goes for layers.

```js
let layers = doc.layers();
let layer = layers.get(0);
console.log(layer.name);
console.log(layer.color);
```

### Summary

Check out
[the official documentation](https://mcneel.github.io/rhino3dm/javascript/api/index.html)
to see what you can do in detail.

The documentation is a bit unfriendly and does not say which types inherit from which types.

Note that you need to look at the SDK of
[RhinoCommon](https://developer.rhino3d.com/api/RhinoCommon/html/R_Project_RhinoCommon.htm)
to understand the inheritance relationship.

This is generally what you can do, and you can't, for example, use multiple curves for sweeping.

It can only create the type as it exists in Rhino, or read the data of what has already been created.
The advantage is that rhino3dm does not require Rhino to be installed.
It can be used to store and check the contents of data generated by RhinoCompute, for example.

## Use Rhino3dm in React

We can simply write it using HTML as shown above, but We will use React to write what we have so far for more extensible development.

### Try React sample

If you type the following, the data for the React sample will be created.
In this example, the data is created as TypeScript using `--template typescript`.
If you don't specify `template typescript`, the data will be created as JavaScript.

```bash
npx create-react-app rhino-react --template typescript
```

Once the project has been created without any problems, type the following to build the page and display the sample page.

```bash
npm start
```

This will create a simple site using React.

### Display sphere diameter

Let's use Rhino3dm to create the spheres as we did when we wrote them directly in the HTML file.

The first step is to rewrite the Index.tsx file as follows.
Since we need to load the Rhino3dm wasm, we use cdn to load it as follows.
This will create a simple site using REACT.

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

Next, rewrite App.ts as follows.

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

Now, when you check the operation with `npm start`, you will see the diameter of the sphere in your browser.

### Add GUI

Just displaying the result text in the browser is not enough. So, let's try to prepare the UI in a easy way.
In this section, we will use mui to adjust the appearance.

Official site

- https://mui.com/

#### Add title bar

Let's add a title bar to the top of the page.
The title bar will be created using mui's [App Bar](https://mui.com/components/app-bar/).

Create a new file called AppBar.tsx.
After creating the file, basically use the sample code that you can get from the official website.
In this example, we will use the Basic App Bar that comes up first.

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

There are some parts that will not be used this time, but I will leave them for the future.

The difference from the official sample is that we can change the title to be displayed by receiving the prop.

Let's add the AppBar we created to App.tsx so that it will be displayed.
In addition, to make it easier to expand in the future, we will split the part that creates the sphere as a CreateSphere function.

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

#### Add slider

Since it is not enough for the UI to create the sphere as specified in the pre-written code,
we added a slider to change the radius of the sphere from the browser.
Therefore, we will add a slider so that the radius of the sphere can be changed from the browser.

The slider will be created using mui's [Slider](https://mui.com/components/slider/).

For the title bar, I created a separate tsx file.
The title bar was created in a separate tsx file, but since it is tied to the creation of the sphere, we will fill it in in CreateSphere.

So far, we have used useEffect to create the sphere when the page is opened.
We want to create the model when the slider is moved, so we will remove useEffect.

Then, create an onChange that receives and acts on the event when the slider value changes.
As for the string to be displayed, we use the ternary operator to switch the value so that no error occurs since the sphere is not created at first.

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
          ? "Sphere diameter is " + sphere.diameter
          : "Sphere is not yet created"}
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

#### Download create 3dm file

In order to make sure that the model is created as expected, we will make the model available for download.

We will use mui's [Button](https://mui.com/components/buttons/) to do this.
We make sure that onClick is called when the button is clicked.

```ts
<Button variant="contained" onClick={onClick}>
  Download
</Button>
```

The onClick is almost the same as the HTML version.
I added the type to write it in TS, and used the sphere value to use the Hook.

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
        ? "Sphere diameter is " + sphere.diameter
        : "Sphere is not yet created"}
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

Now click the Download button to download the 3dm file.

### Load local file

When we used HTML, we had to specify the file path directly, 
but now we will add a button to select the file from there.

#### Add input & check button

First, create a function CheckUploadedFile that uploads a file and processes it.

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

The button to check the file after inputting it uses the mui Button.
It is the same as the Download button when we created the sphere.

To display what you have created, make the return of the App function as follows

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

#### Create UserString tables

In the current configuration, 
the contents of the file are displayed in the console at the end of onClick, but not in the UI.
Since UserStrings are maps that allow multiple values, we will display them in a tabular format.

Since UserString is a maps that allows multiple values, we will display it in tabular form, using mui's [table](https://mui.com/components/tables/) for the table.

Create a UserStringTable.tsx that writes the UserString to the table and do the following
Basically, I use the official sample, but I add some processing to avoid errors when I don't have a UserString.

The data to be displayed is received in prop.data, so The data to be displayed is received in prop.data,
so we pass UserStrings to data when using it.

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

#### Summarize created components

Now that we have a UserStringTable, we will use it to display the UserString of the loaded file.

The following is what we have added.

- Added Hooks for handling loaded UserString
- Add a section to pass the doc retrieved by onClick to CreateUserStringList
- Create CreateUserStringList to get UserStrings from doc
- Added BasicTable to display a table in return

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

### Build & Deploy

Let's deploy the completed page.
In this case, we will use GitHub Pages. The steps are as follows

1. Add `"homepage": "."" to package.json. to package.json
1. Run `npm run build` in a terminal.
1. The page will be created in the build folder.
1. Rename the folder to "docs" and move it to the root directory.
1. Push to GitHub
1. In the GitHub Pages settings, set Source to the docs of the branch you just pushed
1. On the top page of the repository, look at Environments and you will see a link to the page you just created.

If it builds without any problems, a page like the following will be published.

- [Rhino3dm.js Intro Page](https://hiron.dev/Introduction-Rhino3dmjs/)

### Summary

We created a simple UI using React and mui to handle Rhino3dm.
You can use Threejs to visualize the model, so if you are interested in that, please give it a try.
