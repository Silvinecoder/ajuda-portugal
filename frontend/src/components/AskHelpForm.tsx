import { useState, useEffect, useRef } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { createRequest } from "../api";
import type { HelpRequest, Urgency, Category } from "../types";
import { URGENCY_LABELS, CATEGORY_LABELS } from "../types";

const URGENCIES: Urgency[] = ["Critico", "urgent", "standard", "recovery"];
const CATEGORIES: Category[] = [
  "food",
  "shelter",
  "reconstruction",
  "cleanup",
  "tools",
  "volunteers",
];

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function searchLocation(query: string): Promise<GeocodeResult[]> {
  if (!query.trim() || query.trim().length < 3) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=pt`,
    {
      headers: {
        "Accept-Language": "pt",
        "User-Agent": "AjudaPortugal/1.0 (help-platform)",
      },
    },
  );
  const data = await res.json();
  return data;
}

interface AskHelpFormProps {
  onClose: () => void;
  onSuccess: (req: HelpRequest) => void;
  onLocationChange?: (center: [number, number]) => void;
}

export default function AskHelpForm({
  onClose,
  onSuccess,
  onLocationChange,
}: AskHelpFormProps) {
  const [urgency, setUrgency] = useState<Urgency>("standard");
  const [category, setCategory] = useState<Category>("food");
  const [description, setDescription] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    GeocodeResult[]
  >([]);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (useMyLocation || selectedCoords || locationInput.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(() => {
      setLoadingSuggestions(true);
      searchLocation(locationInput)
        .then((results) => {
          setLocationSuggestions(results);
          setShowSuggestions(results.length > 0);
        })
        .catch(() => setLocationSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [locationInput, useMyLocation, selectedCoords]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (result: GeocodeResult) => {
    setLocationInput(result.display_name);
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedCoords({ lat, lng });
    setLocationSuggestions([]);
    setShowSuggestions(false);
    onLocationChange?.([lat, lng]);
  };

  const handleLocationInputChange = (value: string) => {
    setLocationInput(value);
    setSelectedCoords(null);
    setUseMyLocation(false);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada");
      return;
    }
    setUseMyLocation(true);
    setSelectedCoords(null);
    setLocationSuggestions([]);
    setShowSuggestions(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationChange?.([latitude, longitude]);
        setLocationInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      () => setError("Não foi possível obter a localização"),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    let lat: number, lng: number;

    if (selectedCoords) {
      lat = selectedCoords.lat;
      lng = selectedCoords.lng;
    } else if (useMyLocation && locationInput) {
      const [la, ln] = locationInput
        .split(",")
        .map((s) => parseFloat(s.trim()));
      if (isNaN(la) || isNaN(ln)) {
        setError("Localização inválida");
        return;
      }
      lat = la;
      lng = ln;
    } else if (locationInput) {
      const parts = locationInput.split(",").map((s) => parseFloat(s.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        lat = parts[0];
        lng = parts[1];
      } else {
        setError(
          'Escreva uma localização e escolha da lista, ou use "Mostrar minha localização"',
        );
        return;
      }
    } else {
      setError('Indique a localização ou use "Mostrar minha localização"');
      return;
    }

    if (!phoneValue || phoneValue.trim().length < 8) {
      setError("Indique um número de WhatsApp válido com código do país");
      return;
    }

    setLoading(true);
    try {
      const req = await createRequest({
        urgency,
        category,
        description: description.trim() || undefined,
        lat,
        lng,
        contact: phoneValue,
        name: name.trim() || undefined,
      });
      onSuccess(req);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao publicar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-slide" onClick={(e) => e.stopPropagation()}>
        <button className="form-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
        <h2>Pedir ajuda</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Urgência
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
            >
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {URGENCY_LABELS[u]}
                </option>
              ))}
            </select>
          </label>

          <label>
            Categoria
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>

          <label>
            O que precisa?
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: 5kg arroz, enlatados..."
            />
          </label>

          <label>
            Localização *
            <div className="location-autocomplete" ref={locationRef}>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() =>
                  locationSuggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder="Ex: Lisboa, Porto, Faro..."
                autoComplete="off"
              />
              {loadingSuggestions && (
                <span className="location-loading" aria-hidden>
                  ...
                </span>
              )}
              {showSuggestions && locationSuggestions.length > 0 && (
                <ul className="location-dropdown">
                  {locationSuggestions.map((result) => (
                    <li
                      key={`${result.lat}-${result.lon}`}
                      onClick={() => handleSelectSuggestion(result)}
                    >
                      {result.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <span className="location-or">ou</span>
            <button
              type="button"
              className="location-btn"
              onClick={handleUseLocation}
            >
              Mostrar minha localização
            </button>
          </label>

          <p className="form-tip">
            <strong>Dica de segurança *</strong>
            <br />
            Use uma área aproximada, não a morada exata, por segurança.
          </p>

          <label>
            WhatsApp *
            <span className="form-hint">
              Seus dados são protegidos e seu número nunca é visível para outros
              usuários. Um voluntário entrará em contato com você via WhatsApp,
              um canal seguro com criptografia de ponta a ponta.
            </span>
          </label>
          <PhoneInput
            placeholder="Enter phone number"
            value={phoneValue}
            onChange={setPhoneValue}
          />

          <label>
            Nome (opcional)
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "A publicar..." : "Publicar pedido de ajuda"}
          </button>
        </form>
      </div>
    </div>
  );
}
