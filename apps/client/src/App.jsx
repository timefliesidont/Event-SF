import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { AuthProvider } from "./contexts/AuthContext";
import UserPage from "./pages/UserPage";
import {EventProvider} from "./contexts/EventContext.jsx"
import ProtectedRoute from "./components/ProtectedRoute";
import EventCreator from "./pages/CreateEvent.jsx"
import EventPage from "./pages/EventPage.jsx";
import "./App.css"; 

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <EventProvider>
        <div className="bg-gray-100 min-h-screen flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Home (currently accessible to all, we'll protect it later) */}
            <Route path="/home" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
            <Route path="/user" element={<ProtectedRoute> <UserPage /> </ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute> < EventCreator/> </ProtectedRoute>} />
            <Route path="/events/:eventId" element={<ProtectedRoute> <EventPage /> </ProtectedRoute>} />
      </Routes>
      </div>
    </EventProvider>
  </AuthProvider>
</Router>
  );
};

export default App;
