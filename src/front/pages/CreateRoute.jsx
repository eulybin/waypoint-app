

import { useState, useEffect, useRef, useCallback, useReducer } from "react";
// ============================================================================
// PÁGINA: CreateRoute - VERSIÓN PROFESIONAL 2025 ✨
// ============================================================================
// ✅ Al seleccionar país → Muestra TODAS las ciudades del país
// ✅ Al seleccionar ciudad → Muestra TODAS las localidades de la ciudad
// ✅ Al seleccionar categoría POI → Muestra TODOS los POIs disponibles
// ✅ Permite seleccionar MÚLTIPLES POIs para una ruta
// ============================================================================

import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Plus,
  X,
  Search,
  Loader,
  AlertCircle,
  Check,
} from "lucide-react";
import { createRoute } from "../services/routesService";
import { searchLocations, searchPointsOfInterest } from "../utils/apiConfig";
import { NAVBAR_WIDTH } from "../utils/constants";

// ============================================================================
// REDUCER: Estado complejo con múltiples campos y lógica
// ============================================================================
const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_COUNTRY":
      return {
        ...state,
        country: action.value,
        countryCode: action.countryCode,
        city: "",
        locality: "",
        coordinates: null,
        points_of_interest: [],
      };

    case "SET_CITY":
      return {
        ...state,
        city: action.value,
        locality: "",
        coordinates: action.coordinates,
        points_of_interest: [],
      };

    case "SET_LOCALITY":
      return {
        ...state,
        locality: action.value,
        coordinates: action.coordinates,
      };

    case "ADD_POI":
      // Evitar duplicados
      if (state.points_of_interest.some((p) => p.id === action.poi.id)) {
        return state;
      }
      return {
        ...state,
        points_of_interest: [...state.points_of_interest, action.poi],
      };

    case "REMOVE_POI":
      return {
        ...state,
        points_of_interest: state.points_of_interest.filter(
          (p) => p.id !== action.poiId
        ),
      };

    case "RESET":
      return action.initialState;

    default:
      return state;
  }
};

const initialFormState = {
  country: "",
  countryCode: "",
  city: "",
  locality: "",
  coordinates: null,
  points_of_interest: [],
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const CreateRoute = () => {
  // ========== STATE CON useReducer (profesional) ==========
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // ========== ESTADOS AUXILIARES ==========
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [localitySuggestions, setLocalitySuggestions] = useState([]);
  const [poiSuggestions, setPoiSuggestions] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [loadingPOIs, setLoadingPOIs] = useState(false);

  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [localityQuery, setLocalityQuery] = useState("");
  const [poiQuery, setPoiQuery] = useState("");
  const [poiType, setPoiType] = useState("attraction");

  // Estados para controlar visibilidad de dropdowns
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const [showPoiDropdown, setShowPoiDropdown] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ========== REFS PARA DEBOUNCING ==========
  const countryDebounceRef = useRef(null);
  const cityDebounceRef = useRef(null);
  const localityDebounceRef = useRef(null);
  const poiDebounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  const navigate = useNavigate();

  // ============================================================================
  // FUNCIÓN: Buscar países con debouncing (solo para filtrar mientras escribe)
  // ============================================================================
  const handleSearchCountries = useCallback(async (query) => {
    if (query.length < 2) {
      setCountrySuggestions([]);
      return;
    }

    setLoadingCountries(true);

    try {
      const results = await searchLocations(query, { type: "country" });

      // Filtrar solo países
      const countries = results
        .filter(
          (r) => r.addresstype === "country" || r.type === "administrative"
        )
        .map((r) => ({
          name: r.display_name.split(",")[0],
          code: r.address?.country_code?.toUpperCase() || "",
          fullName: r.display_name,
        }));

      // Eliminar duplicados
      const uniqueCountries = countries.reduce((acc, country) => {
        if (!acc.find((c) => c.code === country.code)) {
          acc.push(country);
        }
        return acc;
      }, []);

      setCountrySuggestions(uniqueCountries);
    } catch (error) {
      console.error("Error searching countries:", error);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  // ============================================================================
  // FUNCIÓN: Al seleccionar país → Cargar TODAS las ciudades automáticamente
  // ============================================================================
  const loadAllCitiesForCountry = useCallback(
    async (countryCode, countryName) => {
      setLoadingCities(true);
      setCitySuggestions([]);

      try {
        // Estrategia: Buscar múltiples queries para obtener más ciudades
        const queries = [
          searchLocations("city", {
            countryCode: countryCode.toLowerCase(),
            limit: 50,
          }),
          searchLocations("town", {
            countryCode: countryCode.toLowerCase(),
            limit: 50,
          }),
          // Búsqueda genérica por país
          searchLocations(countryName, {
            countryCode: countryCode.toLowerCase(),
            limit: 50,
          }),
        ];

        // Ejecutar todas las búsquedas en paralelo
        const allResults = await Promise.all(queries);
        const combinedResults = allResults.flat();

        console.log(
          `[loadAllCitiesForCountry] Resultados para ${countryName}:`,
          combinedResults.length
        );

        // Filtrar y formatear ciudades
        const cities = combinedResults
          .filter(
            (r) =>
              r &&
              (["city", "town", "village", "municipality"].includes(r.type) ||
                r.addresstype === "city" ||
                r.class === "place")
          )
          .map((r) => ({
            name:
              r.name ||
              r.address?.city ||
              r.address?.town ||
              r.address?.village ||
              r.address?.municipality,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            displayName: r.display_name,
          }))
          .filter((city) => city.name) // Eliminar nulos
          .filter(
            (city, index, self) =>
              // Eliminar duplicados por nombre
              index === self.findIndex((c) => c.name === city.name)
          )
          .sort((a, b) => a.name.localeCompare(b.name)); // Ordenar alfabéticamente

        console.log(
          `[loadAllCitiesForCountry] Ciudades únicas: ${cities.length}`
        );
        setCitySuggestions(cities);

        if (cities.length === 0) {
          setError(
            `No se encontraron ciudades para ${countryName}. Intenta buscar manualmente.`
          );
        }
      } catch (error) {
        console.error("Error loading cities:", error);
        setError("Error al cargar las ciudades del país");
      } finally {
        setLoadingCities(false);
      }
    },
    []
  );

  // ============================================================================
  // FUNCIÓN: Filtrar ciudades mientras el usuario escribe
  // ============================================================================
  const handleSearchCities = useCallback((query, allCities) => {
    if (!query) {
      return allCities;
    }
    return allCities.filter((city) =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  // ============================================================================
  // FUNCIÓN: Al seleccionar ciudad → Cargar TODAS las localidades automáticamente
  // ============================================================================
  const loadAllLocalitiesForCity = useCallback(
    async (cityName, countryCode) => {
      setLoadingLocalities(true);
      setLocalitySuggestions([]);

      try {
        // Buscar localidades/barrios de la ciudad
        const results = await searchLocations(cityName, {
          countryCode: countryCode.toLowerCase(),
          limit: 100,
        });

        // Filtrar localidades/barrios
        const localities = results
          .filter(
            (r) =>
              [
                "suburb",
                "neighbourhood",
                "quarter",
                "hamlet",
                "village",
                "residential",
              ].includes(r.type) || r.class === "place"
          )
          .map((r) => ({
            name:
              r.name ||
              r.address?.suburb ||
              r.address?.neighbourhood ||
              r.address?.hamlet,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            displayName: r.display_name,
          }))
          .filter(
            (locality, index, self) =>
              // Eliminar duplicados y valores nulos
              locality.name &&
              index === self.findIndex((l) => l.name === locality.name)
          )
          .sort((a, b) => a.name.localeCompare(b.name));

        setLocalitySuggestions(localities);
      } catch (error) {
        console.error("Error loading localities:", error);
        setError("Error al cargar las localidades de la ciudad");
      } finally {
        setLoadingLocalities(false);
      }
    },
    []
  );

  // ============================================================================
  // FUNCIÓN: Filtrar localidades mientras el usuario escribe
  // ============================================================================
  const handleSearchLocalities = useCallback((query, allLocalities) => {
    if (!query) {
      return allLocalities;
    }
    return allLocalities.filter((locality) =>
      locality.name.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  // ============================================================================
  // FUNCIÓN: Al seleccionar categoría POI → Cargar TODOS los POIs automáticamente
  // ============================================================================
  const loadAllPOIsForCategory = useCallback(async (category, coordinates) => {
    if (!coordinates) return;

    setLoadingPOIs(true);
    setPoiSuggestions([]);

    try {
      // Buscar todos los POIs de la categoría en un radio de 10km
      const pois = await searchPointsOfInterest(
        coordinates.lat,
        coordinates.lon,
        category,
        10000 // 10km de radio
      );

      setPoiSuggestions(pois);
    } catch (error) {
      console.error("Error loading POIs:", error);
      setError("Error al cargar los puntos de interés");
    } finally {
      setLoadingPOIs(false);
    }
  }, []);

  // ============================================================================
  // FUNCIÓN: Filtrar POIs mientras el usuario escribe
  // ============================================================================
  const handleSearchPOIs = useCallback((query, allPOIs) => {
    if (!query) {
      return allPOIs;
    }
    return allPOIs.filter((poi) =>
      poi.name.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  // ============================================================================
  // EFFECT: Debouncing para búsqueda de países
  // ============================================================================
  useEffect(() => {
    if (countryDebounceRef.current) {
      clearTimeout(countryDebounceRef.current);
    }

    countryDebounceRef.current = setTimeout(() => {
      handleSearchCountries(countryQuery);
    }, 500);

    return () => clearTimeout(countryDebounceRef.current);
  }, [countryQuery, handleSearchCountries]);

  // ============================================================================
  // EFFECT: Al seleccionar país → Cargar ciudades automáticamente
  // ============================================================================
  useEffect(() => {
    if (formState.country && formState.countryCode) {
      loadAllCitiesForCountry(formState.countryCode, formState.country);
      setShowCityDropdown(true); // Abrir dropdown de ciudades al cargar
    } else {
      setCitySuggestions([]);
      setShowCityDropdown(false);
    }
  }, [formState.country, formState.countryCode, loadAllCitiesForCountry]);

  // ============================================================================
  // EFFECT: Búsqueda manual de ciudades si el usuario escribe
  // ============================================================================
  useEffect(() => {
    // Solo buscar si el usuario está escribiendo y hay un país seleccionado
    if (!cityQuery || !formState.countryCode || cityQuery.length < 2) {
      return;
    }

    // Si ya hay ciudades cargadas, no hacer búsqueda (filtrado local)
    if (citySuggestions.length > 0) {
      return;
    }

    // Debouncing para búsqueda manual
    if (cityDebounceRef.current) {
      clearTimeout(cityDebounceRef.current);
    }

    cityDebounceRef.current = setTimeout(async () => {
      setLoadingCities(true);
      try {
        const results = await searchLocations(cityQuery, {
          countryCode: formState.countryCode.toLowerCase(),
          limit: 20,
        });

        const cities = results
          .filter(
            (r) =>
              r &&
              (["city", "town", "village", "municipality"].includes(r.type) ||
                r.addresstype === "city")
          )
          .map((r) => ({
            name:
              r.name ||
              r.address?.city ||
              r.address?.town ||
              r.address?.village,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            displayName: r.display_name,
          }))
          .filter((city) => city.name);

        setCitySuggestions(cities);
      } catch (error) {
        console.error("Error searching cities manually:", error);
      } finally {
        setLoadingCities(false);
      }
    }, 500);

    return () => clearTimeout(cityDebounceRef.current);
  }, [cityQuery, formState.countryCode, citySuggestions.length]);

  // ============================================================================
  // EFFECT: Al seleccionar ciudad → Cargar localidades automáticamente
  // ============================================================================
  useEffect(() => {
    if (formState.city && formState.countryCode) {
      loadAllLocalitiesForCity(formState.city, formState.countryCode);
      setShowLocalityDropdown(true); // Abrir dropdown de localidades al cargar
    } else {
      setLocalitySuggestions([]);
      setShowLocalityDropdown(false);
    }
  }, [formState.city, formState.countryCode, loadAllLocalitiesForCity]);

  // ============================================================================
  // EFFECT: Al seleccionar categoría POI → Cargar POIs automáticamente
  // ============================================================================
  useEffect(() => {
    if (poiType && formState.coordinates) {
      loadAllPOIsForCategory(poiType, formState.coordinates);
      setShowPoiDropdown(true); // Abrir dropdown de POIs al cargar
    } else {
      setPoiSuggestions([]);
      setShowPoiDropdown(false);
    }
  }, [poiType, formState.coordinates, loadAllPOIsForCategory]);

  // ============================================================================
  // HANDLERS: Selección de sugerencias
  // ============================================================================
  const handleSelectCountry = (country) => {
    dispatch({
      type: "SET_COUNTRY",
      value: country.name,
      countryCode: country.code,
    });
    setCountryQuery(country.name);
    setCountrySuggestions([]);
    setShowCountryDropdown(false); // ✅ Cerrar dropdown
  };

  const handleSelectCity = (city) => {
    dispatch({
      type: "SET_CITY",
      value: city.name,
      coordinates: { lat: city.lat, lon: city.lon },
    });
    setCityQuery(city.name);
    setShowCityDropdown(false); // ✅ Cerrar dropdown
  };

  const handleSelectLocality = (locality) => {
    dispatch({
      type: "SET_LOCALITY",
      value: locality.name,
      coordinates: { lat: locality.lat, lon: locality.lon },
    });
    setLocalityQuery(locality.name);
    setShowLocalityDropdown(false); // ✅ Cerrar dropdown
  };

  const handleAddPOI = (poi) => {
    dispatch({
      type: "ADD_POI",
      poi: {
        id: poi.id,
        name: poi.name,
        type: poi.type,
        lat: poi.lat,
        lon: poi.lon,
      },
    });
    setPoiQuery("");
    setShowPoiDropdown(false); // ✅ Cerrar dropdown
    // No cerramos el dropdown de POIs para permitir agregar múltiples
  };

  const handleRemovePOI = (poiId) => {
    dispatch({ type: "REMOVE_POI", poiId });
  };

  // ============================================================================
  // HANDLER: Submit
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación
    if (formState.points_of_interest.length === 0) {
      setError("Debes agregar al menos un punto de interés");
      return;
    }

    if (!formState.country || !formState.city) {
      setError("Debes seleccionar un país y una ciudad");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSubmitting(true);
    setError("");

    try {
      await createRoute(formState, controller.signal);
      navigate("/profile");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error creating route:", error);
        setError(
          error.message ||
            "No se pudo crear la ruta. Por favor, intenta de nuevo."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="container-fluid p-4" style={{ marginLeft: NAVBAR_WIDTH }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="display-4 fw-bold mb-2">Crear Nueva Ruta</h1>
        <p className="text-muted">
          Usa el autocompletado para seleccionar ubicaciones y puntos de interés
        </p>
      </div>

      {/* Formulario */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* País con Autocompletado */}
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold">
                    País *{" "}
                    <span className="text-muted small">
                      (busca y selecciona)
                    </span>
                  </label>
                  <div className="position-relative">
                    <Search
                      className="position-absolute"
                      size={20}
                      style={{ left: 12, top: 12 }}
                    />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="Buscar país... Ej: España"
                      value={countryQuery}
                      onChange={(e) => setCountryQuery(e.target.value)}
                      onFocus={() => setShowCountryDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowCountryDropdown(false), 200)
                      }
                      required
                    />
                    {loadingCountries && (
                      <Loader
                        className="position-absolute animate-spin"
                        size={20}
                        style={{ right: 12, top: 12 }}
                      />
                    )}
                  </div>

                  {/* Sugerencias de países */}
                  {showCountryDropdown && countrySuggestions.length > 0 && (
                    <div
                      className="position-absolute w-100 mt-1 bg-body border rounded shadow-lg"
                      style={{
                        zIndex: 1000,
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {countrySuggestions.map((country, idx) => (
                        <div
                          key={idx}
                          className="p-3 border-bottom cursor-pointer hover-bg-light"
                          onClick={() => handleSelectCountry(country)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="fw-semibold">{country.name}</div>
                          <div className="small text-muted">
                            {country.fullName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formState.country && (
                    <div className="mt-2">
                      <span className="badge bg-success">
                        ✓ {formState.country}
                      </span>
                    </div>
                  )}
                </div>

                {/* Ciudad con Autocompletado */}
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold">
                    Ciudad *{" "}
                    {loadingCities && (
                      <span className="text-primary">
                        <Loader
                          className="d-inline-block animate-spin"
                          size={16}
                        />{" "}
                        Cargando ciudades...
                      </span>
                    )}
                    {!loadingCities &&
                      formState.country &&
                      citySuggestions.length > 0 && (
                        <span className="text-success small ms-2">
                          ({citySuggestions.length} ciudades disponibles)
                        </span>
                      )}
                  </label>
                  <div className="position-relative">
                    <Search
                      className="position-absolute"
                      size={20}
                      style={{ left: 12, top: 12 }}
                    />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder={
                        !formState.country
                          ? "Primero selecciona un país"
                          : loadingCities
                          ? "Cargando ciudades..."
                          : citySuggestions.length > 0
                          ? "Buscar o seleccionar ciudad..."
                          : "Escribe para buscar ciudades..."
                      }
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      disabled={!formState.country}
                      onFocus={() => setShowCityDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowCityDropdown(false), 200)
                      }
                    />
                  </div>

                  {/* Mensaje informativo si no hay ciudades cargadas */}
                  {formState.country &&
                    !loadingCities &&
                    citySuggestions.length === 0 &&
                    !formState.city && (
                      <div className="alert alert-info mt-2 mb-0 py-2 small">
                        💡 Escribe el nombre de una ciudad para buscar
                      </div>
                    )}

                  {/* Lista de ciudades (filtrada localmente) */}
                  {showCityDropdown &&
                    formState.country &&
                    citySuggestions.length > 0 && (
                      <div
                        className="position-absolute w-100 mt-1 bg-body border rounded shadow-lg"
                        style={{
                          zIndex: 1000,
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        {handleSearchCities(cityQuery, citySuggestions)
                          .slice(0, 50) // Limitar a 50 para performance
                          .map((city, idx) => (
                            <div
                              key={idx}
                              className="p-3 border-bottom cursor-pointer hover-bg-light d-flex justify-content-between align-items-center"
                              onClick={() => handleSelectCity(city)}
                              style={{ cursor: "pointer" }}
                            >
                              <div>
                                <div className="fw-semibold">{city.name}</div>
                                <div className="small text-muted">
                                  {city.displayName}
                                </div>
                              </div>
                              {formState.city === city.name && (
                                <Check className="text-success" size={20} />
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                  {formState.city && (
                    <div className="mt-2">
                      <span className="badge bg-success fs-6 py-2">
                        ✓ {formState.city}
                      </span>
                    </div>
                  )}
                </div>

                {/* Localidad/Barrio (Opcional) */}
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold">
                    Localidad/Barrio (opcional){" "}
                    {loadingLocalities && (
                      <Loader
                        className="d-inline-block animate-spin"
                        size={16}
                      />
                    )}
                    {formState.city && (
                      <span className="text-muted small ms-2">
                        ({localitySuggestions.length} localidades disponibles)
                      </span>
                    )}
                  </label>
                  <div className="position-relative">
                    <Search
                      className="position-absolute"
                      size={20}
                      style={{ left: 12, top: 12 }}
                    />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder={
                        formState.city
                          ? "Buscar o seleccionar localidad..."
                          : "Primero selecciona una ciudad"
                      }
                      value={localityQuery}
                      onChange={(e) => setLocalityQuery(e.target.value)}
                      disabled={!formState.city}
                      onFocus={() => setShowLocalityDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowLocalityDropdown(false), 200)
                      }
                    />
                  </div>

                  {/* Lista de localidades (filtrada localmente) */}
                  {showLocalityDropdown &&
                    formState.city &&
                    localitySuggestions.length > 0 && (
                      <div
                        className="position-absolute w-100 mt-1 bg-body border rounded shadow-lg"
                        style={{
                          zIndex: 1000,
                          maxHeight: "300px",
                          overflowY: "auto",
                        }}
                      >
                        {handleSearchLocalities(
                          localityQuery,
                          localitySuggestions
                        )
                          .slice(0, 50)
                          .map((locality, idx) => (
                            <div
                              key={idx}
                              className="p-3 border-bottom cursor-pointer hover-bg-light d-flex justify-content-between align-items-center"
                              onClick={() => handleSelectLocality(locality)}
                              style={{ cursor: "pointer" }}
                            >
                              <div>
                                <div className="fw-semibold">
                                  {locality.name}
                                </div>
                                <div className="small text-muted">
                                  {locality.displayName}
                                </div>
                              </div>
                              {formState.locality === locality.name && (
                                <Check className="text-success" size={20} />
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                  {formState.locality && (
                    <div className="mt-2">
                      <span className="badge bg-success fs-6 py-2">
                        ✓ {formState.locality}
                      </span>
                    </div>
                  )}
                </div>

                {/* Puntos de Interés - MÚLTIPLES SELECCIONES */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Puntos de Interés *{" "}
                    {loadingPOIs && (
                      <Loader
                        className="d-inline-block animate-spin"
                        size={16}
                      />
                    )}
                    {formState.city && (
                      <span className="text-muted small ms-2">
                        ({formState.points_of_interest.length} seleccionados,{" "}
                        {poiSuggestions.length} disponibles)
                      </span>
                    )}
                  </label>

                  {/* Selector de categoría de POI */}
                  <div className="mb-2">
                    <label className="form-label small">
                      Selecciona una categoría:
                    </label>
                    <select
                      className="form-select"
                      value={poiType}
                      onChange={(e) => setPoiType(e.target.value)}
                      disabled={!formState.city}
                    >
                      <option value="attraction">
                        🎯 Atracciones Turísticas
                      </option>
                      <option value="museum">🏛️ Museos</option>
                      <option value="restaurant">🍽️ Restaurantes</option>
                      <option value="cafe">☕ Cafés</option>
                      <option value="bar">🍺 Bares</option>
                      <option value="park">🌳 Parques</option>
                      <option value="monument">🗿 Monumentos</option>
                      <option value="church">⛪ Iglesias</option>
                      <option value="hotel">🏨 Hoteles</option>
                      <option value="viewpoint">🏞️ Miradores</option>
                    </select>
                  </div>

                  {/* POIs Seleccionados (Tags) */}
                  {formState.points_of_interest.length > 0 && (
                    <div className="mb-3 p-3 bg-light rounded">
                      <div className="small fw-semibold mb-2">
                        POIs en tu ruta:
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {formState.points_of_interest.map((poi) => (
                          <span
                            key={poi.id}
                            className="badge bg-primary fs-6 py-2 px-3 d-flex align-items-center gap-2"
                          >
                            <MapPin size={14} />
                            {poi.name}
                            <X
                              size={16}
                              className="cursor-pointer"
                              onClick={() => handleRemovePOI(poi.id)}
                              style={{ cursor: "pointer" }}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Buscador de POI */}
                  <div className="position-relative">
                    <div className="position-relative">
                      <Search
                        className="position-absolute"
                        size={20}
                        style={{ left: 12, top: 12 }}
                      />
                      <input
                        type="text"
                        className="form-control ps-5"
                        placeholder={
                          formState.city
                            ? "Buscar para agregar más POIs..."
                            : "Primero selecciona una ciudad"
                        }
                        value={poiQuery}
                        onChange={(e) => setPoiQuery(e.target.value)}
                        disabled={!formState.city}
                        onFocus={() => setShowPoiDropdown(true)}
                        onBlur={() =>
                          setTimeout(() => setShowPoiDropdown(false), 200)
                        }
                      />
                    </div>

                    {/* Lista de POIs (filtrada localmente) */}
                    {showPoiDropdown &&
                      formState.city &&
                      poiSuggestions.length > 0 && (
                        <div
                          className="position-absolute w-100 mt-1 bg-body border rounded shadow-lg"
                          style={{
                            zIndex: 1000,
                            maxHeight: "400px",
                            overflowY: "auto",
                          }}
                        >
                          {handleSearchPOIs(poiQuery, poiSuggestions).map(
                            (poi) => {
                              const isSelected =
                                formState.points_of_interest.some(
                                  (p) => p.id === poi.id
                                );
                              return (
                                <div
                                  key={poi.id}
                                  className={`p-3 border-bottom cursor-pointer hover-bg-light d-flex justify-content-between align-items-center ${
                                    isSelected ? "bg-success bg-opacity-10" : ""
                                  }`}
                                  onClick={() => handleAddPOI(poi)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div className="flex-grow-1">
                                    <div className="fw-semibold">
                                      {poi.name}
                                    </div>
                                    <div className="small text-muted">
                                      {poi.type}{" "}
                                      {poi.address && `· ${poi.address}`}
                                    </div>
                                  </div>
                                  {isSelected ? (
                                    <Check size={20} className="text-success" />
                                  ) : (
                                    <Plus size={20} className="text-primary" />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center gap-2"
                    role="alert"
                  >
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn bg-orange text-white px-4"
                    disabled={
                      isSubmitting ||
                      !formState.country ||
                      !formState.city ||
                      formState.points_of_interest.length === 0
                    }
                  >
                    {isSubmitting ? "Creando..." : "Crear Ruta"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoute;
