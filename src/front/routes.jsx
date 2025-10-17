import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Explore from "./pages/Explore";
import Trending from "./pages/Trending";
import Popular from "./pages/Popular";
import Profile from "./pages/Profile";
import CreateRoute from "./pages/CreateRoute";
import SearchBar from "./pages/Search";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/search" element={<SearchBar />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/trending" element={<Trending />} />
      <Route path="/popular" element={<Popular />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/create-route" element={<CreateRoute />} />
    </Route>
  )
);