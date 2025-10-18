import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Explore from "./pages/Explore";
import Trending from "./pages/Trending";
import Popular from "./pages/Popular";
import Profile from "./pages/Profile";
import CreateRoute from "./pages/CreateRoute";
import SearchBar from "./pages/Search";

// WRAPPERS
import AuthenticatedRoute from "./components/Routes/AuthenticatedRoute";
import GuestRoute from "./components/Routes/GuestRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* AUTHENTICATED ROUTES */}
      <Route element={<AuthenticatedRoute />}>
        <Route index element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-route" element={<CreateRoute />} />
      </Route>

      {/* GUEST ROUTES */}
      <Route element={<GuestRoute />}>
        <Route path="/search" element={<SearchBar />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
    </Route>
  )
);