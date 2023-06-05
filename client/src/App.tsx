import React, { FC } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Layout } from "./views/Layout";
import { EditMd } from "views/EditMd";
import { QRCode } from "views/QRCode";

const App: FC = () => (
  <div className="App">
    <Router>
      <Routes>
        <Route path={"/edit-md"} element={<EditMd />} />
        <Route path={"/edit-md/:blogID"} element={<EditMd />} />
        <Route path={"/qr-code"} element={<QRCode />} />
        <Route path={"/qr-code/:type"} element={<QRCode />} />
      </Routes>

      <Layout />
    </Router>
  </div>
);

export default App;
