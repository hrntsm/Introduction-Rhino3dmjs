import './App.css';
import ButtonAppBar from './AppBar';
import { CreateSphere } from './CreateSphere';
import { CheckUploadedFile } from './CheckUploadedFile';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    rhino3dm: any;
  }
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
