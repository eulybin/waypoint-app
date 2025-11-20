import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Explore from "./pages/Explore";
import Trending from "./pages/Trending";
import Profile from "./pages/Profile";
import CreateRoute from "./pages/CreateRoute";
import SearchBar from "./pages/Search";
import NotFound from "./pages/NotFound";
import RouteDetail from "./pages/RouteDetail";
import Presentation from "./pages/Presentation";

// WRAPPERS
import AuthenticatedRoute from "./components/Routes/AuthenticatedRoute";
import GuestRoute from "./components/Routes/GuestRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>

      {/* AUTHENTICATED ROUTES */}
      <Route element={<AuthenticatedRoute />}>
        <Route path="home" element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="trending" element={<Trending />} />
        <Route path="profile" element={<Profile />} />
        <Route path="create-route" element={<CreateRoute />} />
        <Route path="route/:id" element={<RouteDetail />} />
        <Route path="presentation" element={<Navigate to="/home" replace />} />
      </Route>

      {/* GUEST ROUTES */}
      <Route element={<GuestRoute />}>
        <Route index element={<Presentation />} />
        {/* <Route path="search" element={<SearchBar />} /> */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* 404 PAGE NOT FOUND */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);
