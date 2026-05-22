import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary, APIProvider } from '@vis.gl/react-google-maps';

interface LocationInputProps {
  location: string;
  onChangeLocation: (address: string, lat?: number, lng?: number) => void;
}

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

function AutocompleteInput({ location, onChangeLocation }: LocationInputProps) {
  const [inputValue, setInputValue] = useState(location);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;
    
    const autocompleteInstance = new places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
    });
    
    setAutocomplete(autocompleteInstance);
  }, [places]);

  useEffect(() => {
    if (!autocomplete) return;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const address = place.formatted_address || place.name || inputValue;
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      setInputValue(address);
      onChangeLocation(address, lat, lng);
    });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autocomplete]);

  useEffect(() => {
    setInputValue(location);
  }, [location]);

  return (
    <input 
      ref={inputRef}
      type="text" 
      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
      value={inputValue} 
      onChange={e => {
        setInputValue(e.target.value);
        onChangeLocation(e.target.value);
      }} 
      placeholder="Search standard address on Google Maps..." 
    />
  );
}

export function LocationInput(props: LocationInputProps) {
  if (API_KEY) {
    return (
      <APIProvider apiKey={API_KEY} version="weekly">
        <AutocompleteInput {...props} />
      </APIProvider>
    );
  }

  // Fallback to regular input if no API key
  return (
    <input 
      type="text" 
      className="w-full border border-slate-200 rounded-lg px-3 py-2  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
      value={props.location} 
      onChange={e => props.onChangeLocation(e.target.value)} 
      placeholder="Location address" 
    />
  );
}
