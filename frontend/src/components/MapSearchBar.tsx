import { useState, useEffect, useRef } from 'react';

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function searchLocation(query: string): Promise<GeocodeResult[]> {
  if (!query.trim() || query.trim().length < 2) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=pt`,
    {
      headers: {
        'Accept-Language': 'pt',
        'User-Agent': 'AjudaPortugal/1.0 (help-platform)',
      },
    }
  );
  const data = await res.json();
  return data;
}

interface MapSearchBarProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapSearchBar({ onLocationSelect }: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      searchLocation(query)
        .then((results) => {
          setSuggestions(results);
          setShowDropdown(results.length > 0);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: GeocodeResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onLocationSelect(lat, lng);
    setQuery(result.display_name);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="map-search-bar" ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Procurar localização..."
        autoComplete="off"
      />
      {loading && <span className="map-search-loading" aria-hidden>...</span>}
      {showDropdown && suggestions.length > 0 && (
        <ul className="map-search-dropdown">
          {suggestions.map((result) => (
            <li
              key={`${result.lat}-${result.lon}`}
              onClick={() => handleSelect(result)}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
