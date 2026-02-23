import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardLayout from "./layout/DashboardLayout";
import Home from "./pages/Home";
import Patients from "./pages/Patients";
import Consultations from "./pages/Consultations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="patients" element={<Patients />} />
          <Route path="consultations" element={<Consultations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;