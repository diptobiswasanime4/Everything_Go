import Sign from "./Components/Sign";
import Todos from "./Components/Todos";
import Verify from "./Components/Verify";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Sign />}></Route>
        <Route path="/register" element={<Sign />}></Route>
        <Route path="/verify" element={<Verify />}></Route>
        <Route path="/forgot-password" element={<Verify />}></Route>
        <Route path="/todos" element={<Todos />}></Route>
      </Routes>
    </>
  );
}

export default App;
