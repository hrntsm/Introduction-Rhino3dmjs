import { useState } from "react";

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';

import { File3dm, RhinoModule, Sphere } from "rhino3dm";
import "./App.css";
import ButtonAppBar from "./AppBar";

declare global {
  interface Window {
    rhino3dm: any;
  }
}

function CreateSphere() {
  const [sphere, setSphere] = useState<Sphere>();

  const onChange = (e: any) => {
    window.rhino3dm().then((Module: RhinoModule) => {
      setSphere(new Module.Sphere([1, 2, 3], e.target.value));
      console.log(sphere)
    });
  }

  const onClick = () => {
    window.rhino3dm().then((Module: RhinoModule) => {
      let doc: File3dm = new Module.File3dm();
      console.log(doc.objects());
      let aa:Sphere = new Module.Sphere([1, 2, 3], 10);
      doc.objects().addSphere(aa, null);
      saveByteArray("sphere.3dm", doc.toByteArray());
    });
  }

  const saveByteArray = (fileName: string, byte: any) => {
    let blob = new Blob([byte], { type: "application/octect-stream" });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  return (
    <div>
      <p>{sphere ? "生成された Sphere の直径は " + sphere.diameter + " です。" : "Sphere はまだ作成されていません"}</p>
      <Box width={300}>
        <Slider defaultValue={16} valueLabelDisplay="auto" onChange={onChange} />
      </Box>
      <Button variant="contained" onClick={onClick}>Download</Button>
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
