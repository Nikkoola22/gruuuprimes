import React, { useState, useEffect, useRef } from "react";
import { Plane, Car, Coffee, BedDouble, AlertCircle, Plus, Trash2, Printer, MapPin, Info } from "lucide-react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for leaflet markers
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface FraisAnnexe {
  id: string;
  motif: string;
  montant: number;
}

interface AddressFeature {
  label: string;
  lon: number;
  lat: number;
  city?: string;
}

const MapUpdater = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
};

export const TravelExpensesCalculator: React.FC = () => {
  // Distance / Routing
  const [departQuery, setDepartQuery] = useState("");
  const [arriveeQuery, setArriveeQuery] = useState("");
  const [departResults, setDepartResults] = useState<AddressFeature[]>([]);
  const [arriveeResults, setArriveeResults] = useState<AddressFeature[]>([]);
  const [depart, setDepart] = useState<AddressFeature | null>(null);
  const [arrivee, setArrivee] = useState<AddressFeature | null>(null);
  
  const [distance, setDistance] = useState<number | "">("");
  const [dureeTrajet, setDureeTrajet] = useState<string>("");
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  const [trajetsCount, setTrajetsCount] = useState<number>(2);
  const [puissance, setPuissance] = useState<number>(5);
  const [bareme, setBareme] = useState<string>("base");
  const [majorationTemporaire] = useState<boolean>(true); // For 2026

  // Repas & Nuitées
  const [, setCommuneHebergement] = useState("");
  const [repas, setRepas] = useState<number>(0);
  const [nuitees, setNuitees] = useState<number>(0);
  const [zoneNuitee, setZoneNuitee] = useState<"province" | "grandes-villes" | "paris">("province");
  
  const [isRestaurantSubventionne, setIsRestaurantSubventionne] = useState(false);
  const [isTravailleurHandicape, setIsTravailleurHandicape] = useState(false);

  const [fraisAnnexes, setFraisAnnexes] = useState<FraisAnnexe[]>([]);

  // Taux repas
  const TAUX_REPAS_BASE = 20.00;
  const TAUX_REPAS = isRestaurantSubventionne ? TAUX_REPAS_BASE / 2 : TAUX_REPAS_BASE;

  // Taux nuitées
  const TAUX_NUIT_BASE = {
    "province": 90.00,
    "grandes-villes": 120.00,
    "paris": 140.00
  };
  const TAUX_NUIT = isTravailleurHandicape ? 150.00 : TAUX_NUIT_BASE[zoneNuitee];

  // API Call debounce timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchAddress = async (query: string, setter: (results: AddressFeature[]) => void) => {
    if (!query || query.trim().length < 3) {
      setter([]);
      return;
    }
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      const features = (data.features || []).map((f: { properties: { label: string; city?: string }; geometry: { coordinates: [number, number] } }) => ({
        label: f.properties.label,
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        city: f.properties.city
      }));
      setter(features);
    } catch {
      setter([]);
    }
  };

  const onDepartQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartQuery(e.target.value);
    setDepart(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => searchAddress(e.target.value, setDepartResults), 300);
  };

  const onArriveeQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArriveeQuery(e.target.value);
    setArrivee(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => searchAddress(e.target.value, setArriveeResults), 300);
  };

  const fetchRoute = async (start: AddressFeature, end: AddressFeature) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setDistance(Math.round(route.distance / 1000));
        const hours = Math.floor(route.duration / 3600);
        const minutes = Math.floor((route.duration % 3600) / 60);
        setDureeTrajet(`${hours > 0 ? hours + "h " : ""}${minutes}min`);
        const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]); // Leaflet uses [lat, lng]
        setRouteCoords(coords);
      }
    } catch (e) {
      console.error("OSRM Error", e);
    }
  };

  useEffect(() => {
    if (depart && arrivee) {
      fetchRoute(depart, arrivee);
    }
  }, [depart, arrivee]);

  const addFrais = () => {
    setFraisAnnexes([...fraisAnnexes, { id: Math.random().toString(), motif: "", montant: 0 }]);
  };

  const updateFrais = (id: string, field: "motif" | "montant", value: string | number) => {
    setFraisAnnexes(fraisAnnexes.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const removeFrais = (id: string) => {
    setFraisAnnexes(fraisAnnexes.filter(f => f.id !== id));
  };

  const calculateTravel = () => {
    let ik = 0;
    const dist = Number(distance) || 0;
    const totalDist = dist * trajetsCount;

    if (totalDist > 0) {
      let baseRate = 0;
      if (puissance <= 5) baseRate = 0.34;
      else if (puissance === 6 || puissance === 7) baseRate = 0.43;
      else if (puissance >= 8) baseRate = 0.47;

      if (majorationTemporaire) {
        baseRate = baseRate * 1.032; // +3.2%
      }
      ik = totalDist * baseRate;
    }

    const totalRepas = repas * TAUX_REPAS;
    const totalNuitees = nuitees * TAUX_NUIT;
    const totalAnnexes = fraisAnnexes.reduce((acc, curr) => acc + (Number(curr.montant) || 0), 0);

    const total = ik + totalRepas + totalNuitees + totalAnnexes;

    return {
      ik,
      totalRepas,
      totalNuitees,
      totalAnnexes,
      total,
      totalDist
    };
  };

  const resultat = calculateTravel();
  const showResult = resultat.total > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calculateur de frais de déplacement</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Indemnités kilométriques, repas, nuitées et frais annexes</p>
          </div>
        </div>

        <div className="mb-8 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p><strong>Base légale :</strong> Décret n°2006-781 du 3 juillet 2006 · Arrêté du 3 juillet 2006 · Décret n°2001-654 du 19 juillet 2001 (extension à la FPT)</p>
        </div>

        {majorationTemporaire && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
            <div className="text-sm text-indigo-800 dark:text-indigo-300">
              <strong>Majoration temporaire disponible.</strong> L'arrêté du 29 mai 2026 relève les taux kilométriques de 3,2 % pour les déplacements effectués entre le 1er juin et le 31 décembre 2026. Cette majoration est appliquée dans ce calcul.
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Indemnités Kilométriques */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <Car className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 uppercase tracking-wide">Indemnité Kilométrique</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Adresse de départ</label>
                  <input
                    type="text"
                    value={departQuery}
                    onChange={onDepartQueryChange}
                    placeholder="Saisissez une adresse..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white"
                  />
                  {departResults.length > 0 && !depart && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                      {departResults.map((r, i) => (
                        <div key={i} onClick={() => { setDepart(r); setDepartQuery(r.label); setDepartResults([]); }} className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 border-b last:border-0 border-slate-100 dark:border-slate-700">
                          {r.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Adresse d'arrivée</label>
                  <input
                    type="text"
                    value={arriveeQuery}
                    onChange={onArriveeQueryChange}
                    placeholder="Saisissez une adresse..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white"
                  />
                  {arriveeResults.length > 0 && !arrivee && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                      {arriveeResults.map((r, i) => (
                        <div key={i} onClick={() => { setArrivee(r); setArriveeQuery(r.label); setArriveeResults([]); if(r.city) setCommuneHebergement(r.city); }} className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 border-b last:border-0 border-slate-100 dark:border-slate-700">
                          {r.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Distance d'un trajet (km)</label>
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Nombre de trajets</label>
                    <select
                      value={trajetsCount}
                      onChange={(e) => setTrajetsCount(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value={1}>Aller simple = 1</option>
                      <option value={2}>Aller-retour = 2</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Puissance fiscale</label>
                    <select
                      value={puissance}
                      onChange={(e) => setPuissance(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value={5}>5 CV et moins</option>
                      <option value={6}>6 et 7 CV</option>
                      <option value={8}>8 CV et plus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Barème retenu</label>
                    <select
                      value={bareme}
                      onChange={(e) => setBareme(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="base">Barème de base</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="h-[300px] bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 relative">
                {(depart && arrivee) ? (
                  <MapContainer center={[46.603354, 1.888334]} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[depart.lat, depart.lon]} />
                    <Marker position={[arrivee.lat, arrivee.lon]} />
                    {routeCoords.length > 0 && (
                      <Polyline positions={routeCoords} color="blue" weight={4} opacity={0.7} />
                    )}
                    <MapUpdater positions={[[depart.lat, depart.lon], [arrivee.lat, arrivee.lon]]} />
                  </MapContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400 p-6 text-center">
                    <MapPin className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">La carte et le trajet calculé s'afficheront ici une fois les deux adresses renseignées.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-xs text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
              <div className="space-y-1">
                <p><strong>À savoir avant de s'appuyer sur ce calcul :</strong></p>
                <p>La distance est indicative : elle correspond à l'itinéraire routier le plus direct, qui n'est pas nécessairement celui retenu par la collectivité.</p>
                <p>Le remboursement kilométrique suppose une autorisation préalable d'utiliser le véhicule personnel pour les besoins du service.</p>
              </div>
            </div>
          </div>

          {/* Forfait Hébergement */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <BedDouble className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 uppercase tracking-wide">Forfait d'hébergement & Repas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Nombre de nuitées</label>
                  <input
                    type="number"
                    min="0"
                    value={nuitees || ""}
                    onChange={(e) => setNuitees(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Zone géographique</label>
                  <select
                    value={zoneNuitee}
                    onChange={(e) => setZoneNuitee(e.target.value as "province" | "grandes-villes" | "paris")}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="province">Commune hors liste majorée</option>
                    <option value="grandes-villes">Grandes villes (+200k hab)</option>
                    <option value="paris">Paris / Grand Paris</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Nombre de repas</label>
                  <input
                    type="number"
                    min="0"
                    value={repas || ""}
                    onChange={(e) => setRepas(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div className="pt-2 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isRestaurantSubventionne} onChange={(e) => setIsRestaurantSubventionne(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>Agent pouvant se restaurer dans un restaurant administratif ou subventionné (-50%)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isTravailleurHandicape} onChange={(e) => setIsTravailleurHandicape(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>Agent reconnu travailleur handicapé (taux de nuitée plafond)</span>
                  </label>
                </div>
              </div>

              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex flex-col justify-center">
                <div className="mb-4">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Taux de nuitée applicable</div>
                  <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{TAUX_NUIT.toFixed(2).replace('.', ',')} € / nuit</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Taux de repas applicable</div>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{TAUX_REPAS.toFixed(2).replace('.', ',')} € / repas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Frais Annexes */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 uppercase tracking-wide">Frais annexes</h3>
              </div>
              <button onClick={addFrais} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </button>
            </div>
            
            <div className="space-y-3">
              {fraisAnnexes.length === 0 && (
                <div className="text-sm text-slate-500 italic">Aucun frais annexe (péage, parking, train, etc.).</div>
              )}
              {fraisAnnexes.map((frais) => (
                <div key={frais.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input type="text" value={frais.motif} onChange={(e) => updateFrais(frais.id, "motif", e.target.value)} placeholder="Motif (ex: Péage, Parking...)" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white" />
                  </div>
                  <div className="w-32 relative">
                    <input type="number" value={frais.montant || ""} onChange={(e) => updateFrais(frais.id, "montant", Number(e.target.value))} placeholder="0" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-4 pr-8 py-2 text-sm text-slate-900 dark:text-white" />
                    <span className="absolute right-3 top-2 text-slate-400">€</span>
                  </div>
                  <button onClick={() => removeFrais(frais.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résultat */}
        <div className={`mt-8 transition-all duration-500 ${showResult ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4 pointer-events-none hidden'}`}>
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg">
            
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 text-center relative">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Total du déplacement</h3>
              <div className="text-5xl font-black tracking-tight">{resultat.total.toFixed(2).replace('.', ',')} €</div>
              
              <button onClick={() => window.print()} className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors border border-white/20">
                <Printer className="w-3.5 h-3.5" /> Imprimer
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Indemnité kilométrique</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{resultat.ik.toFixed(2).replace('.', ',')} €</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Forfait d'hébergement</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{resultat.totalNuitees.toFixed(2).replace('.', ',')} €</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Repas</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{resultat.totalRepas.toFixed(2).replace('.', ',')} €</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Frais annexes</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{resultat.totalAnnexes.toFixed(2).replace('.', ',')} €</div>
              </div>
            </div>

            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Distance totale parcourue</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{resultat.totalDist > 0 ? resultat.totalDist + " km" : "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Barème appliqué</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">Barème de base {majorationTemporaire ? "(+3.2%)" : ""}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Durée estimée d'un trajet</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{dureeTrajet || "—"}</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};
