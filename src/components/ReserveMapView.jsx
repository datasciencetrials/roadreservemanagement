import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CONDITION_COLORS = {
  Good: '#16A34A',
  Satisfactory: '#0071E3',
  Marginal: '#D97706',
  Poor: '#DC2626',
  Critical: '#7F1D1D',
  'Under Construction': '#7C3AED'
};

const ROAD_CLASS_STYLES = {
  M: { label: 'Class M (Expressway)', color: '#7C3AED', weight: 4.0, km: '144.56 km' },
  A: { label: 'Class A (International Trunk Road)', color: '#DC2626', weight: 3.5, km: '2,604.65 km' },
  B: { label: 'Class B (National Trunk Road)', color: '#0071E3', weight: 3.0, km: '2,845.27 km' },
  C: { label: 'Class C (Primary Road)', color: '#D97706', weight: 2.4, km: '15,689.54 km' }
};

const getSetbackByClass = (roadClass = '') => {
  if (roadClass.startsWith('Class M')) return '40 m each side (80 m reserve)';
  if (roadClass.startsWith('Class A')) return '30 m each side (60 m reserve)';
  if (roadClass.startsWith('Class B')) return '25 m each side (50 m reserve)';
  if (roadClass.startsWith('Class C')) return '15 m each side (30 m reserve)';
  return '15 m to 40 m each side';
};

export default function ReserveMapView({ data }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const roadsLayerRef = useRef(null);
  const structuresLayerRef = useRef(null);

  const [roadsGeoJson, setRoadsGeoJson] = useState(null);
  const [assetLayer, setAssetLayer] = useState('all');
  const [classFilter, setClassFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [surfaceFilter, setSurfaceFilter] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Load National Road Network GeoJSON
  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}roads_network.geojson`)
      .then((res) => (res.ok ? res.json() : null))
      .then((geo) => {
        if (!cancelled && geo) setRoadsGeoJson(geo);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBridges = useMemo(() => {
    if (assetLayer === 'culverts' || assetLayer === 'roads') return [];
    return data.bridges.filter((b) => {
      if (classFilter !== 'All' && !(b.road_class || '').startsWith(`Class ${classFilter}`)) return false;
      if (regionFilter !== 'All' && b.region !== regionFilter) return false;
      if (conditionFilter !== 'All' && b.condition_band !== conditionFilter) return false;
      if (surfaceFilter !== 'All' && (b.surface_type || '').toLowerCase() !== surfaceFilter.toLowerCase()) return false;
      return true;
    });
  }, [data.bridges, assetLayer, classFilter, regionFilter, conditionFilter, surfaceFilter]);

  const filteredCulverts = useMemo(() => {
    if (assetLayer === 'bridges' || assetLayer === 'roads') return [];
    return data.major_culverts.filter((c) => {
      if (classFilter !== 'All' && !(c.road_class || '').startsWith(`Class ${classFilter}`)) return false;
      if (regionFilter !== 'All' && c.region !== regionFilter) return false;
      if (conditionFilter !== 'All' && c.condition_band !== conditionFilter) return false;
      if (surfaceFilter !== 'All' && (c.surface_type || '').toLowerCase() !== surfaceFilter.toLowerCase()) return false;
      return true;
    });
  }, [data.major_culverts, assetLayer, classFilter, regionFilter, conditionFilter, surfaceFilter]);

  // Initialize Leaflet map with Esri World Imagery + Hybrid Reference Labels
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [1.3733, 32.2903],
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: true
    });

    const esriImagery = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri World Imagery',
        maxZoom: 18
      }
    );

    const esriLabels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri Hybrid Reference Labels',
        maxZoom: 18
      }
    );

    esriImagery.addTo(map);
    esriLabels.addTo(map);

    const roadsGroup = L.layerGroup().addTo(map);
    const structuresGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    roadsLayerRef.current = roadsGroup;
    structuresLayerRef.current = structuresGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      roadsLayerRef.current = null;
      structuresLayerRef.current = null;
    };
  }, []);

  // Render National Road Network layer (solid paved, 0.58x dotted unpaved, coloured by functional class)
  useEffect(() => {
    const roadsGroup = roadsLayerRef.current;
    if (!roadsGroup || !roadsGeoJson) return;
    roadsGroup.clearLayers();

    if (assetLayer === 'bridges' || assetLayer === 'culverts') return;

    const filteredFeatures = roadsGeoJson.features.filter((f) => {
      const p = f.properties || {};
      if (classFilter !== 'All' && p.rc !== classFilter) return false;
      if (regionFilter !== 'All' && p.region !== regionFilter) return false;
      if (surfaceFilter !== 'All' && (p.surface_type || '').toLowerCase() !== surfaceFilter.toLowerCase()) return false;
      return true;
    });

    const geoLayer = L.geoJSON(
      { type: 'FeatureCollection', features: filteredFeatures },
      {
        style: (feature) => {
          const p = feature.properties || {};
          const cls = ROAD_CLASS_STYLES[p.rc] || ROAD_CLASS_STYLES.C;
          const isUnpaved = (p.surface_type || '').toLowerCase() === 'unpaved';
          return {
            color: cls.color,
            weight: isUnpaved ? Number((cls.weight * 0.58).toFixed(2)) : cls.weight,
            opacity: isUnpaved ? 0.9 : 0.95,
            dashArray: isUnpaved ? '2 6' : null
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          layer.bindPopup(
            `<div style="font-family:Arial,sans-serif;min-width:220px;color:#0F172A;">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${p.road_name || 'National Road'}</div>
              <div style="font-size:12px;color:#475569;margin-bottom:6px;">${p.road_class}</div>
              <div style="font-size:12px;"><strong>Surface:</strong> ${p.surface_type}</div>
              <div style="font-size:12px;"><strong>Length:</strong> ${Number(p.length_km || 0).toFixed(2)} km</div>
              <div style="font-size:12px;"><strong>Statutory Reserve:</strong> ${p.reserve_width_m} m (${p.setback_m} m each side)</div>
              <div style="font-size:12px;"><strong>Region / Station:</strong> ${p.region} / ${p.station}</div>
              <div style="font-size:12px;"><strong>2026 AADT / 2040 Est.:</strong> ${Number(p.aadt_2026 || 0).toLocaleString('en-GB')} / ${Number(p.aadt_2040 || 0).toLocaleString('en-GB')} veh/day</div>
            </div>`
          );
        }
      }
    );

    geoLayer.addTo(roadsGroup);
  }, [roadsGeoJson, assetLayer, classFilter, regionFilter, surfaceFilter]);

  // Render Bridges (552) and Major Culverts (452) markers
  useEffect(() => {
    const group = structuresLayerRef.current;
    if (!group) return;
    group.clearLayers();

    filteredBridges.forEach((b) => {
      const color = CONDITION_COLORS[b.condition_band] || '#0071E3';
      const marker = L.circleMarker([b.lat, b.lng], {
        radius: 5.5,
        color: '#FFFFFF',
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.95
      });
      marker.bindPopup(
        `<div style="font-family:Arial,sans-serif;min-width:210px;color:#0F172A;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Bridge: ${b.name || b.id}</div>
          <div style="font-size:12px;color:#475569;margin-bottom:6px;">${b.road_name || 'National Road'} (${b.road_class || 'Class A'})</div>
          <div style="font-size:12px;"><strong>Condition:</strong> ${b.condition_band}</div>
          <div style="font-size:12px;"><strong>Surface:</strong> ${b.surface_type}</div>
          <div style="font-size:12px;"><strong>Region / Station:</strong> ${b.region} / ${b.station}</div>
          <div style="font-size:12px;"><strong>Coordinates:</strong> ${b.lat.toFixed(5)}, ${b.lng.toFixed(5)}</div>
          <div style="font-size:12px;"><strong>Updated:</strong> ${b.updated_date}</div>
        </div>`
      );
      marker.on('click', () => {
        setSelectedAsset({ kind: 'Bridge', ...b });
      });
      marker.addTo(group);
    });

    filteredCulverts.forEach((c) => {
      const color = CONDITION_COLORS[c.condition_band] || '#0D9488';
      const marker = L.circleMarker([c.lat, c.lng], {
        radius: 4,
        color: '#FFFFFF',
        weight: 1,
        fillColor: color,
        fillOpacity: 0.88
      });
      marker.bindPopup(
        `<div style="font-family:Arial,sans-serif;min-width:210px;color:#0F172A;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Major Culvert: ${c.name || c.id}</div>
          <div style="font-size:12px;color:#475569;margin-bottom:6px;">${c.road_name || 'National Road'} (${c.road_class || 'Class C'})</div>
          <div style="font-size:12px;"><strong>Condition:</strong> ${c.condition_band}</div>
          <div style="font-size:12px;"><strong>Surface:</strong> ${c.surface_type}</div>
          <div style="font-size:12px;"><strong>Region / Station:</strong> ${c.region} / ${c.station}</div>
          <div style="font-size:12px;"><strong>Coordinates:</strong> ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}</div>
          <div style="font-size:12px;"><strong>Updated:</strong> ${c.updated_date}</div>
        </div>`
      );
      marker.on('click', () => {
        setSelectedAsset({ kind: 'Major Culvert', ...c });
      });
      marker.addTo(group);
    });
  }, [filteredBridges, filteredCulverts]);

  const handleResetFilters = () => {
    setAssetLayer('all');
    setClassFilter('All');
    setRegionFilter('All');
    setConditionFilter('All');
    setSurfaceFilter('All');
    setSelectedAsset(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([1.3733, 32.2903], 7);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Geospatial Road Reserve &amp; Structures Map</h2>
          <p className="section-desc">
            Esri World Imagery + Hybrid Reference Labels displaying Uganda&apos;s National Road Network (21,284.02 km), Bridges (552), and Major Culverts (452).
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={handleResetFilters}>
          Reset Map &amp; Filters
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          className="select-control"
          aria-label="Filter asset layer"
          value={assetLayer}
          onChange={(e) => setAssetLayer(e.target.value)}
        >
          <option value="all">All Layers (Road Network, Bridges &amp; Major Culverts)</option>
          <option value="roads">National Road Network Only (21,284.02 km)</option>
          <option value="bridges">Bridges Only (552)</option>
          <option value="culverts">Major Culverts Only (452)</option>
        </select>

        <select
          className="select-control"
          aria-label="Filter functional class"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="All">All Functional Classes</option>
          <option value="M">Class M (Expressway: 144.56 km)</option>
          <option value="A">Class A (International Trunk: 2,604.65 km)</option>
          <option value="B">Class B (National Trunk: 2,845.27 km)</option>
          <option value="C">Class C (Primary Road: 15,689.54 km)</option>
        </select>

        <select
          className="select-control"
          aria-label="Filter region"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <option value="All">All Maintenance Regions (6)</option>
          {data.regions.map((r) => (
            <option key={r.region_name} value={r.region_name}>{r.region_name}</option>
          ))}
        </select>

        <select
          className="select-control"
          aria-label="Filter condition"
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
        >
          <option value="All">All Structure Conditions</option>
          {Object.keys(CONDITION_COLORS).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="select-control"
          aria-label="Filter surface type"
          value={surfaceFilter}
          onChange={(e) => setSurfaceFilter(e.target.value)}
        >
          <option value="All">All Surface Types (21,284.02 km)</option>
          <option value="Paved">Paved (6,406.69 km)</option>
          <option value="Unpaved">Unpaved (14,877.33 km)</option>
        </select>

        <span className="badge-pill blue" style={{ marginLeft: 'auto' }}>
          Esri World Imagery + Hybrid Labels
        </span>
      </div>

      {/* Map */}
      <div className="map-wrapper">
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Separate Legends for Road Network, Bridges (552), and Major Culverts (452) */}
      <div className="grid-2" style={{ marginTop: '16px', marginBottom: 0 }}>
        <div className="card">
          <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>
            National Road Network Legend: 21,284.02 km
          </strong>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: '10px' }}>
            Paved: 6,406.69 km (solid full width) &bull; Unpaved: 14,877.33 km (0.58x width, dotted)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.entries(ROAD_CLASS_STYLES).map(([code, item]) => (
              <span key={code} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
                <span style={{ width: 18, height: 4, borderRadius: 2, backgroundColor: item.color, display: 'inline-block' }} />
                {item.label}: {item.km}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>
            Structures Condition Legends (Separate Registers)
          </strong>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: '10px' }}>
            <strong>Bridges: 552</strong> (large markers) &bull; <strong>Major Culverts: 452</strong> (compact markers)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {Object.entries(CONDITION_COLORS).map(([label, hex]) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: hex, display: 'inline-block', border: '1px solid #FFFFFF', boxShadow: '0 0 0 1px #CBD5E1' }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Structure Detail Modal */}
      {selectedAsset && (
        <div className="modal-backdrop" onClick={() => setSelectedAsset(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge-pill blue">{selectedAsset.kind}</span>
                <h3 style={{ margin: '8px 0 2px 0', fontSize: '1.25rem' }}>{selectedAsset.name || selectedAsset.id}</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {selectedAsset.road_name} &bull; {selectedAsset.road_class}
                </p>
              </div>
              <button type="button" className="btn-secondary" onClick={() => setSelectedAsset(null)}>
                Close
              </button>
            </div>

            <div className="table-wrap" style={{ marginTop: '12px' }}>
              <table className="data-table">
                <tbody>
                  <tr>
                    <th>Identifier</th>
                    <td>{selectedAsset.id}</td>
                  </tr>
                  <tr>
                    <th>Maintenance Region / Station</th>
                    <td>{selectedAsset.region} / {selectedAsset.station}</td>
                  </tr>
                  <tr>
                    <th>District</th>
                    <td>{selectedAsset.district || 'Not recorded'}</td>
                  </tr>
                  <tr>
                    <th>Surface Type</th>
                    <td>{selectedAsset.surface_type || 'Not recorded'}</td>
                  </tr>
                  <tr>
                    <th>Condition Band</th>
                    <td>
                      <span className="badge-pill" style={{ borderColor: CONDITION_COLORS[selectedAsset.condition_band] || '#CBD5E1', color: CONDITION_COLORS[selectedAsset.condition_band] || '#0F172A' }}>
                        {selectedAsset.condition_band}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Statutory Reserve Setback</th>
                    <td>{getSetbackByClass(selectedAsset.road_class)}</td>
                  </tr>
                  <tr>
                    <th>Coordinates (Decimal Degrees)</th>
                    <td>{selectedAsset.lat.toFixed(5)}, {selectedAsset.lng.toFixed(5)}</td>
                  </tr>
                  <tr>
                    <th>2026 AADT / Vision 2040 Est.</th>
                    <td>
                      {selectedAsset.aadt_2026 ? `${Number(selectedAsset.aadt_2026).toLocaleString('en-GB')} veh/day (2040 est: ${Math.round(selectedAsset.aadt_2026 * Math.pow(1.045, 14)).toLocaleString('en-GB')} veh/day)` : 'Not recorded'}
                    </td>
                  </tr>
                  <tr>
                    <th>Inspection Updated</th>
                    <td>{selectedAsset.updated_date}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
