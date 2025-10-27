import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestConnection from "./pages/TestConnection";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test-connection" element={<TestConnection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
