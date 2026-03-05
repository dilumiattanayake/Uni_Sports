import React from "react";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";

import { Route, Routes } from 'react-router-dom'

const App = () => {
  return  <div>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/auth/register" element={<Register/>}/>
        <Route path="/auth/login" element={<Login/>}/>
      </Routes>
    </div>
}

export default App
