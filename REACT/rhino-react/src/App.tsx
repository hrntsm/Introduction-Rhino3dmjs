/* eslint-disable no-unused-vars */
import { useState } from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';

import { File3dm, File3dmObjectTable, RhinoModule, Sphere } from 'rhino3dm';
import './App.css';
import ButtonAppBar from './AppBar';
import BasicTable from './UserStringTable';

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
      console.log(sphere);
    });
  };

  const onClick = () => {
    window.rhino3dm().then((Module: RhinoModule) => {
      const doc: File3dm = new Module.File3dm();

      if (sphere) {
        const item: Sphere = new Module.Sphere((sphere.center as number[]), (sphere.radius as number));
        // @ts-ignore
        doc.objects().addSphere(item, null);
        saveByteArray('sphere.3dm', doc.toByteArray());
      } else {
        alert('Sphere not created');
      }
    });
  };

  const saveByteArray = (fileName: string, byte: any) => {
    const blob: Blob = new Blob([byte], { type: 'application/octect-stream' });
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div>
      <p>{sphere ? '生成された Sphere の直径は ' + sphere.diameter + ' です。' : 'Sphere はまだ作成されていません'}</p>
      <Box width={300}>
        <Slider defaultValue={16} valueLabelDisplay="auto" onChange={onChange} />
      </Box>
      <Button variant="contained" onClick={onClick}>Download</Button>
    </div>
  );
}

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
    } else {
      alert('ファイルが選択されていません');
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
      <input type="file" onChange={onChange} />
      <Button variant="contained" onClick={onClick}>Check</Button>
      <BasicTable data={userStrings} />
    </div>
  );
}

export default function App() {
  return (
    <div>
      <ButtonAppBar title="Rhino3dm Test Project" />
      <CreateSphere />
      <CheckUploadedFile />
    </div>
  );
}
