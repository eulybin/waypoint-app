import { useState, useEffect, useRef, useCallback, useReducer } from "react";

// ============================================================================
// PÁGINA: CreateRoute - VERSIÓN PROFESIONAL 2025 ✨
// ============================================================================
// ✅ Al seleccionar país → Muestra ciudades Y localidades (Carmona, Utrera, etc.)
// ✅ Al seleccionar ciudad/localidad → Muestra TODOS los POIs disponibles
// ✅ Permite seleccionar MÚLTIPLES POIs para una ruta
// ✅ Flujo simplificado: País → Ciudad/Localidad → POIs
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
  Compass,
  Building2,
  UtensilsCrossed,
  Coffee,
  Beer,
  Trees,
  Landmark,
  Church,
  Hotel,
  Mountain,
} from "lucide-react";
import { createRoute } from "../services/routesService";
import { searchLocations, searchPointsOfInterest } from "../utils/apiConfig";
import { NAVBAR_WIDTH } from "../utils/constants";
import { STANDARD_ICON_SIZE } from "../utils/constants";

// ============================================================================
// REDUCER: Estado simplificado sin campo "locality"
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
        coordinates: null,
        points_of_interest: [],
      };

    case "SET_CITY":
      return {
        ...state,
        city: action.value,
        coordinates: action.coordinates,
        points_of_interest: [],
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
  coordinates: null,
  points_of_interest: [],
};

const loadingAll = {
  countries: false,
  cities: false,
  pois: false,
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const CreateRoute = () => {
  // ========== STATE CON useReducer (profesional) ==========
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // ========== ESTADOS AUXILIARES ==========
  const [loadingAll, setLoadingAll] = useState({
    countries: false,
    cities: false,
    pois: false,
  });

  const [showDropdownAll, setShowDropdownAll] = useState({
    countries: false,
    cities: false,
    pois: false,
  });

  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [poiSuggestions, setPoiSuggestions] = useState([]);

  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [poiQuery, setPoiQuery] = useState("");
  const [poiType, setPoiType] = useState("attraction");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ========== REFS PARA DEBOUNCING ==========
  const countryDebounceRef = useRef(null);
  const cityDebounceRef = useRef(null);
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

    setLoadingAll(true);

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
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // FUNCIÓN: Al seleccionar país → Cargar TODAS las ciudades automáticamente
  // ============================================================================
  // ============================================================================
  // FUNCIÓN: Cargar ciudades Y localidades de un país
  // ESTRATEGIA: Muestra sugerencias iniciales + permite búsqueda manual
  // ============================================================================
  const loadAllCitiesForCountry = useCallback(
    async (countryCode, countryName) => {
      setLoadingAll(true);
      setCitySuggestions([]);

      try {
        console.log(
          `[loadAllCitiesForCountry] 🔍 Cargando sugerencias para ${countryName}...`
        );

        // Estrategia mejorada: Más queries específicas para capturar MÁS pueblos
        const queries = [
          // Ciudades principales
          searchLocations("city", {
            countryCode: countryCode.toLowerCase(),
            limit: 50,
          }),
          // Pueblos grandes
          searchLocations("town", {
            countryCode: countryCode.toLowerCase(),
            limit: 50,
          }),
          // Pueblos pequeños
          searchLocations("village", {
            countryCode: countryCode.toLowerCase(),
            limit: 50,
          }),
          // Municipios
          searchLocations("municipality", {
            countryCode: countryCode.toLowerCase(),
            limit: 50,
          }),
          // Búsqueda por nombre del país (captura más resultados)
          searchLocations(countryName, {
            countryCode: countryCode.toLowerCase(),
            limit: 50,
          }),
        ];

        // Ejecutar todas las búsquedas en paralelo
        const allResults = await Promise.all(queries);
        const combinedResults = allResults.flat();

        console.log(
          `[loadAllCitiesForCountry] 📊 Total resultados: ${combinedResults.length}`
        );

        // Filtrar y formatear ciudades + localidades
        const citiesAndLocalities = combinedResults
          .filter(
            (r) =>
              r &&
              ([
                "city",
                "town",
                "village",
                "municipality",
                "locality",
                "hamlet",
              ].includes(r.type) ||
                r.addresstype === "city" ||
                r.addresstype === "town" ||
                r.addresstype === "village" ||
                r.addresstype === "municipality" ||
                r.class === "place")
          )
          .map((r) => ({
            name:
              r.name ||
              r.address?.city ||
              r.address?.town ||
              r.address?.village ||
              r.address?.municipality ||
              r.address?.locality ||
              r.display_name?.split(",")[0],
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            displayName: r.display_name,
            type: r.type || r.addresstype,
          }))
          .filter((city) => city.name && city.lat && city.lon) // Eliminar inválidos
          .filter(
            (city, index, self) =>
              // Eliminar duplicados por nombre
              index === self.findIndex((c) => c.name === city.name)
          )
          .sort((a, b) => a.name.localeCompare(b.name, "es"));

        console.log(
          `[loadAllCitiesForCountry] ✅ Lugares únicos: ${citiesAndLocalities.length}`
        );
        setCitySuggestions(citiesAndLocalities);

        // Mensaje informativo en lugar de error
        if (citiesAndLocalities.length === 0) {
          console.log(
            `[loadAllCitiesForCountry] ℹ️ No hay sugerencias automáticas, pero puedes buscar manualmente`
          );
        }
      } catch (error) {
        console.error("Error loading cities:", error);
        setError("Error al cargar sugerencias. Puedes buscar manualmente.");
      } finally {
        setLoadingAll(false);
      }
    },
    []
  );

  // ============================================================================
  // FUNCIÓN: Filtrar ciudades/localidades mientras el usuario escribe
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
  // FUNCIÓN: Al seleccionar categoría POI → Cargar TODOS los POIs automáticamente
  // ============================================================================
  const loadAllPOIsForCategory = useCallback(async (category, coordinates) => {
    if (!coordinates) return;

    setLoadingAll(true);
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
      setLoadingAll(false);
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
      setShowDropdownAll((prev) => ({ ...prev, cities: true })); // Abrir dropdown de ciudades al cargar
    } else {
      setCitySuggestions([]);
      setShowDropdownAll((prev) => ({ ...prev, cities: false }));
    }
  }, [formState.country, formState.countryCode, loadAllCitiesForCountry]);

  // ============================================================================
  // EFFECT: Búsqueda MANUAL en tiempo real (para encontrar CUALQUIER pueblo)
  // Si el usuario escribe, busca directamente sin depender de sugerencias
  // ============================================================================
  useEffect(() => {
    // Solo buscar si el usuario está escribiendo activamente
    if (!cityQuery || !formState.countryCode || cityQuery.length < 3) {
      return;
    }

    // Si ya hay resultados que coinciden, usar filtrado local
    const localMatches = handleSearchCities(cityQuery, citySuggestions);
    if (localMatches.length > 0) {
      return; // Ya hay resultados, no hacer nueva búsqueda
    }

    // Debouncing para búsqueda manual
    if (cityDebounceRef.current) {
      clearTimeout(cityDebounceRef.current);
    }

    cityDebounceRef.current = setTimeout(async () => {
      console.log(
        `[Búsqueda Manual] 🔎 Buscando: "${cityQuery}" en ${formState.countryCode}`
      );
      setLoadingAll(true);

      try {
        // BÚSQUEDA MÁS AMPLIA: Query directo con el nombre del pueblo
        const searchQuery = `${cityQuery}, ${formState.country}`;

        const results = await searchLocations(searchQuery, {
          countryCode: formState.countryCode.toLowerCase(),
          limit: 50, // Más resultados
        });

        console.log(
          `[Búsqueda Manual] 📊 Resultados encontrados: ${results.length}`
        );

        const cities = results
          .filter((r) => {
            if (!r) return false;

            // Aceptar MÁS tipos de lugares
            const validTypes = [
              "city",
              "town",
              "village",
              "municipality",
              "locality",
              "hamlet",
              "suburb",
              "neighbourhood",
            ];

            const isValidType =
              validTypes.includes(r.type) ||
              validTypes.includes(r.addresstype) ||
              r.class === "place";

            // Verificar que esté en el país correcto
            const isCorrectCountry =
              r.address?.country_code?.toUpperCase() ===
              formState.countryCode.toUpperCase();

            return isValidType && isCorrectCountry;
          })
          .map((r) => ({
            name:
              r.name ||
              r.address?.city ||
              r.address?.town ||
              r.address?.village ||
              r.address?.municipality ||
              r.address?.hamlet ||
              r.display_name?.split(",")[0],
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            displayName: r.display_name,
            type: r.type || r.addresstype,
          }))
          .filter((city) => city.name && city.lat && city.lon) // Solo válidos
          .filter(
            (city, index, self) =>
              index === self.findIndex((c) => c.name === city.name)
          );

        console.log(`[Búsqueda Manual] ✅ Lugares únicos: ${cities.length}`);

        if (cities.length > 0) {
          setCitySuggestions(cities);
          console.log(
            `[Búsqueda Manual] 📍 Ejemplos:`,
            cities.slice(0, 5).map((c) => c.name)
          );
        }
      } catch (error) {
        console.error("[Búsqueda Manual] ❌ Error:", error);
      } finally {
        setLoadingAll(false);
      }
    }, 500);

    return () => clearTimeout(cityDebounceRef.current);
  }, [
    cityQuery,
    formState.countryCode,
    formState.country,
    citySuggestions,
    handleSearchCities,
  ]);

  // ============================================================================
  // EFFECT: Al seleccionar categoría POI → Cargar POIs automáticamente
  // ============================================================================
  useEffect(() => {
    if (poiType && formState.coordinates) {
      loadAllPOIsForCategory(poiType, formState.coordinates);
      setShowDropdownAll((prev) => ({ ...prev, pois: true })); // Abrir dropdown de POIs al cargar
    } else {
      setPoiSuggestions([]);
      setShowDropdownAll((prev) => ({ ...prev, pois: false }));
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
    setShowDropdownAll((prev) => ({ ...prev, countries: false })); // ✅ Cerrar dropdown
  };

  const handleSelectCity = (city) => {
    dispatch({
      type: "SET_CITY",
      value: city.name,
      coordinates: { lat: city.lat, lon: city.lon },
    });
    setCityQuery(city.name);
    setShowDropdownAll((prev) => ({ ...prev, cities: false })); // ✅ Cerrar dropdown
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
    setShowDropdownAll((prev) => ({ ...prev, pois: false })); // ✅ Cerrar dropdown
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
                      onFocus={() =>
                        setShowDropdownAll((prev) => ({
                          ...prev,
                          countries: true,
                        }))
                      }
                      onBlur={() =>
                        setTimeout(
                          () =>
                            setShowDropdownAll((prev) => ({
                              ...prev,
                              countries: false,
                            })),
                          200
                        )
                      }
                      required
                    />
                    {loadingAll.countries && (
                      <Loader
                        className="position-absolute animate-spin"
                        size={20}
                        style={{ right: 12, top: 12 }}
                      />
                    )}
                  </div>

                  {/* Sugerencias de países */}
                  {showDropdownAll.countries &&
                    countrySuggestions.length > 0 && (
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

                {/* Ciudad/Localidad con Autocompletado */}
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold">
                    Ciudad/Localidad *{" "}
                    {loadingAll && (
                      <span className="text-primary">
                        <Loader
                          className="d-inline-block animate-spin"
                          size={16}
                        />{" "}
                        Cargando ciudades y localidades...
                      </span>
                    )}
                    {!loadingAll &&
                      formState.country &&
                      citySuggestions.length > 0 && (
                        <span className="text-success small ms-2">
                          ({citySuggestions.length} opciones disponibles)
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
                          : loadingAll
                          ? "Buscando..."
                          : citySuggestions.length > 0
                          ? "Escribe para buscar más lugares..."
                          : "Escribe el nombre del pueblo/ciudad (ej: Carmona)"
                      }
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      disabled={!formState.country}
                      onFocus={() =>
                        setShowDropdownAll((prev) => ({
                          ...prev,
                          cities: true,
                        }))
                      }
                      onBlur={() =>
                        setTimeout(
                          () =>
                            setShowDropdownAll((prev) => ({
                              ...prev,
                              cities: false,
                            })),
                          200
                        )
                      }
                    />
                  </div>

                  {/* Mensaje informativo mejorado */}
                  {formState.country &&
                    !loadingAll &&
                    citySuggestions.length === 0 &&
                    !formState.city &&
                    cityQuery.length === 0 && (
                      <div className="alert alert-info mt-2 mb-0 py-2 small">
                        💡 <strong>Escribe el nombre</strong> del pueblo o
                        ciudad que buscas
                        <br />
                        <span className="text-muted">
                          Ejemplos: Carmona, Dos Hermanas, Utrera...
                        </span>
                      </div>
                    )}

                  {/* Mensaje mientras busca */}
                  {formState.country && loadingAll && cityQuery.length >= 3 && (
                    <div className="alert alert-primary mt-2 mb-0 py-2 small">
                      🔍 Buscando "{cityQuery}" en {formState.country}...
                    </div>
                  )}

                  {/* Mensaje si no encuentra resultados */}
                  {formState.country &&
                    !loadingAll &&
                    citySuggestions.length === 0 &&
                    cityQuery.length >= 3 && (
                      <div className="alert alert-warning mt-2 mb-0 py-2 small">
                        ⚠️ No se encontró "{cityQuery}".
                        <br />
                        <span className="text-muted">
                          Intenta con otro nombre o verifica la ortografía.
                        </span>
                      </div>
                    )}

                  {/* Lista de ciudades y localidades (filtrada localmente) */}
                  {showDropdownAll.cities &&
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
                              className="p-3 border-bottom cursor-pointer hover-bg-light d-flex justify-content-between align-items-start"
                              onClick={() => handleSelectCity(city)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="flex-grow-1">
                                <div className="fw-semibold d-flex align-items-center gap-2">
                                  <MapPin size={16} className="text-primary" />
                                  {city.name}
                                  {city.type && (
                                    <span className="badge bg-secondary text-white small">
                                      {city.type === "city"
                                        ? "Ciudad"
                                        : city.type === "town"
                                        ? "Pueblo"
                                        : city.type === "village"
                                        ? "Aldea"
                                        : city.type === "municipality"
                                        ? "Municipio"
                                        : city.type}
                                    </span>
                                  )}
                                </div>
                                <div className="small text-muted mt-1">
                                  {city.displayName}
                                </div>
                                <div className="extra-small text-muted">
                                  📍 {city.lat.toFixed(4)},{" "}
                                  {city.lon.toFixed(4)}
                                </div>
                              </div>
                              {formState.city === city.name && (
                                <Check
                                  className="text-success flex-shrink-0"
                                  size={20}
                                />
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

                {/* Puntos de Interés - MÚLTIPLES SELECCIONES */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Puntos de Interés *{" "}
                    {loadingAll && (
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

                  {/* Selector de categoría de POI con Botones */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Selecciona una categoría:
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        {
                          value: "attraction",
                          icon: Compass,
                          label: "Atracciones",
                          color: "primary",
                        },
                        {
                          value: "museum",
                          icon: Building2,
                          label: "Museos",
                          color: "info",
                        },
                        {
                          value: "restaurant",
                          icon: UtensilsCrossed,
                          label: "Restaurantes",
                          color: "danger",
                        },
                        {
                          value: "cafe",
                          icon: Coffee,
                          label: "Cafés",
                          color: "warning",
                        },
                        {
                          value: "bar",
                          icon: Beer,
                          label: "Bares",
                          color: "success",
                        },
                        {
                          value: "park",
                          icon: Trees,
                          label: "Parques",
                          color: "success",
                        },
                        {
                          value: "monument",
                          icon: Landmark,
                          label: "Monumentos",
                          color: "secondary",
                        },
                        {
                          value: "church",
                          icon: Church,
                          label: "Iglesias",
                          color: "info",
                        },
                        {
                          value: "hotel",
                          icon: Hotel,
                          label: "Hoteles",
                          color: "primary",
                        },
                        {
                          value: "viewpoint",
                          icon: Mountain,
                          label: "Miradores",
                          color: "success",
                        },
                      ].map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <button
                            key={category.value}
                            type="button"
                            className={`btn ${
                              poiType === category.value
                                ? `btn-${category.color}`
                                : `btn-outline-${category.color}`
                            } btn-sm d-flex align-items-center gap-2`}
                            onClick={() => setPoiType(category.value)}
                            disabled={!formState.city}
                            style={{
                              cursor: formState.city
                                ? "pointer"
                                : "not-allowed",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <IconComponent size={16} />
                            {category.label}
                          </button>
                        );
                      })}
                    </div>
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
                        onFocus={() =>
                          setShowDropdownAll((prev) => ({
                            ...prev,
                            pois: true,
                          }))
                        }
                        onBlur={() =>
                          setTimeout(
                            () =>
                              setShowDropdownAll((prev) => ({
                                ...prev,
                                pois: false,
                              })),
                            200
                          )
                        }
                      />
                    </div>

                    {/* Lista de POIs (filtrada localmente) */}
                    {showDropdownAll.pois &&
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
