import { useState, SyntheticEvent, MouseEvent, Fragment } from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { File3dm, File3dmObjectTable, RhinoModule } from 'rhino3dm';
import BasicTable from './UserStringTable';

export function CheckUploadedFile() {
  const [file, setFile] = useState<File>();
  const [userStrings, setUserStrings] = useState<string[]>();
  const [openNoFile, setOpenNoFile] = useState({
    open: false,
    message: '',
  });

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
      setOpenNoFile({...openNoFile, open: true, message: "ファイルが選択されていません"});
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

  const handleClose = (
    event: SyntheticEvent | MouseEvent,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenNoFile({...openNoFile, open: false});
  };

  const action = (
    <Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  return (
    <div>
      <h3>Check Uploaded File</h3>
      <input type="file" onChange={onChange} />
      <Button variant="outlined" onClick={onClick}>Check</Button>
      <BasicTable data={userStrings} />
      <Snackbar
        open={openNoFile.open}
        autoHideDuration={3000}
        onClose={handleClose}
        message={openNoFile.message}
        action={action}
      />
    </div>
  );
}
