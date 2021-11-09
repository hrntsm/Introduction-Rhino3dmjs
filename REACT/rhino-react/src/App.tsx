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

  return <div className="App">{sphere && <p>{`sphere diameter is: ${sphere.diameter}`}</p>}</div>;
}
