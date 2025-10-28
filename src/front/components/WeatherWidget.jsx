import { useState } from 'react';
import { ThermometerSun, CloudRain, Wind, Droplets, X } from 'lucide-react';
import { NAVBAR_ICON_SIZE, WEATHER_ICON_SIZE, WEATHER_WIDGET_WIDTH } from '../utils/constants';

const WeatherWidget = ({ weather, city, loading, onChangeCity, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [searchMode, setSearchMode] = useState(!city);
  const [query, setQuery] = useState(city || '');

  const current = weather?.current;
  const forecast3 = weather?.forecast?.slice(0, 3) || [];

  // --- Handlers ---
  const handleToggle = () => setOpen((prev) => !prev);

  const handleSubmitCity = (e) => {
    e.preventDefault();
    const trimmed = query.trim().charAt(0).toUpperCase() + query.trim().slice(1).toLowerCase();
    if (!trimmed) return;
    if (onChangeCity) onChangeCity(trimmed);
    else localStorage.setItem('home.city', trimmed);
    setSearchMode(false);
  };

  // --- Render helpers ---
  const renderCollapsedButton = () => (
    <button
      type="button"
      className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm border weather-btn"
      onClick={handleToggle}
      aria-label="Open weather"
    >
      <ThermometerSun size={NAVBAR_ICON_SIZE} />
    </button>
  );

  const renderHeader = () => (
    <div className="d-flex align-items-start justify-content-between">
      <div>
        <div className="small text-muted">{weather?.country || ''}</div>
        <div className="fw-semibold">{weather?.city || city}</div>
      </div>
      <button
        type="button"
        className="btn btn-sm btn-body border rounded-circle p-1"
        onClick={handleToggle}
        aria-label="Close weather"
      >
        <X size={NAVBAR_ICON_SIZE} />
      </button>
    </div>
  );

  const renderSearchForm = () => (
    <form className="mt-2 d-flex align-items-center gap-2" onSubmit={handleSubmitCity}>
      <div className="position-relative flex-grow-1">
        <input
          className="form-control"
          placeholder="Enter city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button type="submit" className="btn bg-orange">Go</button>
    </form>
  );
  const renderWeatherInfo = () => {
    if (loading) {
      return (
        <div className="d-flex align-items-center text-muted">
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Loading…
        </div>
      );
    }

    if (current) {
      return (
        <>
          <span className="display-6 fw-bold">{Math.round(current.temperature)}°</span>
          <span className="text-muted">{current.description}</span>
        </>
      );
    }

    return <span className="text-danger">No data</span>;
  };


  const renderCurrentStats = () => (
    <div className="mt-2 d-flex flex-wrap gap-3 small text-muted">
      <span className="d-inline-flex align-items-center gap-1">
        <Droplets size={WEATHER_ICON_SIZE} />{current.humidity}%
      </span>
      <span className="d-inline-flex align-items-center gap-1">
        <Wind size={WEATHER_ICON_SIZE} />{current.wind_speed} m/s
      </span>
    </div>
  );

  const renderForecast = () => (
    <div className="mt-3 row g-2 row-cols-3">
      {forecast3.map((d) => (
        <div key={d.date} className="col">
          <div className="bg-body-tertiary rounded-3 p-2 text-center h-100">
            <div className="small fw-semibold text-truncate">
              {d.day_name.slice(0, 3).toUpperCase()}
            </div>
            <div className="small">
              {Math.round(d.temp_min)}° / {Math.round(d.temp_max)}°
            </div>
            <div className="small d-inline-flex align-items-center gap-1">
              <CloudRain size={WEATHER_ICON_SIZE} />{d.pop}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // --- Main render ---
  if (!open) return renderCollapsedButton();

  return (
    <div className="card shadow-sm border rounded-4" style={{ width: WEATHER_WIDGET_WIDTH }}>
      <div className="card-body p-3">
        {renderHeader()}

        {searchMode ? (
          renderSearchForm()
        ) : (
          <div className="d-flex align-items-baseline gap-2 mt-2">
            {renderWeatherInfo()}
          </div>
        )}

        {!searchMode && current && renderCurrentStats()}
        {!searchMode && forecast3.length > 0 && renderForecast()}
      </div>
    </div>
  );
};

export default WeatherWidget;
