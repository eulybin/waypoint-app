import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import WeatherWidget from "../components/WeatherWidget";
import { fetchWeather } from "../services/weatherService";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const initialKey = (isAuthenticated && user) ? `home.city.${user.id}` : 'home.city.guest';
  const [city, setCity] = useState(() => localStorage.getItem(initialKey) || "");
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const loadWeather = async (targetCity = city) => {
    setLoadingWeather(true);
    const data = await fetchWeather(targetCity);
    setWeather(data);
    setLoadingWeather(false);
  };

  useEffect(() => {
    // When auth user changes, re-hydrate city for that user (or guest)
    const key = (isAuthenticated && user) ? `home.city.${user.id}` : 'home.city.guest';
    const stored = localStorage.getItem(key);
    setCity(stored || "");
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!city) return; // prompt first; fetch only when city is set
    loadWeather(city);
  }, [city]);

  const handleChangeCity = (newCity) => {
    setCity(newCity);
    localStorage.setItem('home.city', newCity);
  };

  return (
    <div className="container-fluid p-4 position-relative">
      <div className="position-absolute top-0 end-0 p-2" style={{ zIndex: 1100 }}>
        <WeatherWidget
          city={city}
          weather={weather}
          loading={loadingWeather}
          onChangeCity={(c) => {
            const key = (isAuthenticated && user) ? `home.city.${user.id}` : 'home.city.guest';
            setCity(c);
            localStorage.setItem(key, c);
          }}
        />
      </div>
    </div>
  );
};

export default Home;
