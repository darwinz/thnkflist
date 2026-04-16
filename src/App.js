import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import List from "./pages/List/List";
import Login from "./pages/Login/Login";
import Stats from "./pages/Stats/Stats";
import { useUser } from "./hooks";
import "./output.css";

function App() {
  const [{ user, isLoading }, dispatch] = useUser();

  if (isLoading) return null;

  const requireAuth = (element) =>
    user ? element : <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/lists" replace /> : <Login dispatch={dispatch} />
          }
        />
        <Route
          path="/lists"
          element={requireAuth(<List user={user} dispatch={dispatch} />)}
        />
        <Route
          path="/lists/:listId"
          element={requireAuth(<List user={user} dispatch={dispatch} />)}
        />
        <Route path="/stats" element={requireAuth(<Stats user={user} />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
