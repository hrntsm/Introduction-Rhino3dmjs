import { useState, SyntheticEvent, MouseEvent, Fragment } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { File3dm, RhinoModule, Sphere } from 'rhino3dm';

export function CreateSphere() {
  const [sphere, setSphere] = useState<Sphere>();
  const [open, setOpen] = useState<boolean>(false);

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
        setOpen(true);
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

  const handleClose = (
    event: SyntheticEvent | MouseEvent,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
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
      <h3>Create Sphere</h3>
      <p>{sphere ? '生成された Sphere の直径は ' + sphere.diameter + ' です。' : 'Sphere はまだ作成されていません'}</p>
      <Box width={300}>
        <Slider defaultValue={16} valueLabelDisplay="auto" onChange={onChange} />
      </Box>
      <Button variant="outlined" onClick={onClick}>Download</Button>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Note archived"
        action={action}
      />
    </div>
  );
}
