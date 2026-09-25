import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Status from "./pages/Status";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
    
      <Routes>
        {/* =====================================
            AUTH
        ====================================== */}
<Route path="/profile" element={<Profile />} />
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =====================================
            CHAT
        ====================================== */}

        <Route
          path="/chat"
          element={<Chat />}
        />

        {/* =====================================
            STATUS
        ====================================== */}

        <Route
          path="/status"
          element={<Status />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;