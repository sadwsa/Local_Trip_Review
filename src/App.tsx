import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { RootLayout } from "./layouts/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { CheckIn } from "./pages/CheckIn";
import { Profile } from "./pages/Profile";
import { DestinationDetail } from "./pages/DestinationDetail";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Saved } from "./pages/Saved";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="login" element={<Login />} />
              <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="check-in" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="destination/:id" element={<ProtectedRoute><DestinationDetail /></ProtectedRoute>} />
              <Route path="saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
            </Route>
            <Route path="admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
