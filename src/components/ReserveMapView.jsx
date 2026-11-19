import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CONDITION_COLORS = {
  Good: '#16A34A',
  Satisfactory: '#0D9488',
  Marginal: '#D97706',
  Poor: '#DC2626',
  Critical: '#7C3AED',
  'Under Construction': '#0071E3'
};

const SETBACK_BY_CLASS = {
  'Class M': '40 m each side (80 m reserve)',
  'Class A': '30 m each side (60 m reserve)',
  'Class B': '25 m each side (50 m reserve)',
  'Class C': '15 m each side (30 m reserve)'
};

export default function ReserveMapView({ data }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  const [assetLayer, setAssetLayer] = useState('all');
  const [regionFilter, setRegionFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [surfaceFilter, setSurfaceFilter] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const filteredBridges = useMemo(() => {
    if (assetLayer === 'culverts') return [];
    return data.bridges.filter((b) => {
      if (regionFilter !== 'All' && b.region !== regionFilter) return false;
      if (conditionFilter !== 'All' && b.condition_band !== conditionFilter) return false;
      if (surfaceFilter !== 'All' && (b.surface_type || '').toLowerCase() !== surfaceFilter.toLowerCase()) return false;
      return true;
    });
  }, [data.bridges, assetLayer, regionFilter, conditionFilter, surfaceFilter]);

  const filteredCulverts = useMemo(() => {
    if (assetLayer === 'bridges') return [];
    return data.major_culverts.filter((c) => {
      if (regionFilter !== 'All' && c.region !== regionFilter) return false;
      if (conditionFilter !== 'All' && c.condition_band !== conditionFilter) return false;
      if (surfaceFilter !== 'All' && (c.surface_type || '').toLowerCase() !== surfaceFilter.toLowerCase()) return false;
      return true;
    });
  }, [data.major_culverts, assetLayer, regionFilter, conditionFilter, surfaceFilter]);

  // Initialize Leaflet map with Esri World Imagery + Hybrid Labels
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

    const esriTransportation = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri Transportation',
        maxZoom: 18
      }
    );

    const esriLabels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri Hybrid Labels',
        maxZoom: 18
      }
    );

    esriImagery.addTo(map);
    esriTransportation.addTo(map);
    esriLabels.addTo(map);

    const group = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = group;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update markers on filter changes
  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    filteredBridges.forEach((b) => {
      const color = CONDITION_COLORS[b.condition_band] || '#0071E3';
      const marker = L.circleMarker([b.lat, b.lng], {
        radius: 5.5,
        color: '#FFFFFF',
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.92
      });
      marker.bindPopup(
        `<div style="font-family:Arial,sans-serif;min-width:210px;color:#0F172A;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Bridge: ${b.name || b.id}</div>
          <div style="font-size:12px;color:#475569;margin-bottom:6px;">${b.road_name || 'National Road'} (${b.road_class || 'Class A'})</div>
          <div style="font-size:12px;"><strong>Condition:</strong> ${b.condition_band}</div>
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
        fillOpacity: 0.85
      });
      marker.bindPopup(
        `<div style="font-family:Arial,sans-serif;min-width:210px;color:#0F172A;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Major Culvert: ${c.name || c.id}</div>
          <div style="font-size:12px;color:#475569;margin-bottom:6px;">${c.road_name || 'National Road'} (${c.road_class || 'Class C'})</div>
          <div style="font-size:12px;"><strong>Condition:</strong> ${c.condition_band}</div>
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
            Esri World Imagery + Hybrid Labels basemap displaying Uganda&apos;s National Road Reserve corridor structures (552 Bridges &amp; 452 Major Culverts across 21,284.02 km).
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
          <option value="all">All Structures (552 Bridges &amp; 452 Major Culverts)</option>
          <option value="bridges">Bridges Only (552)</option>
          <option value="culverts">Major Culverts Only (452)</option>
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
          <option value="All">All Condition Bands</option>
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
          Basemap: Esri World Imagery + Hybrid Labels
        </span>
      </div>

      {/* Map + Legend */}
      <div className="map-wrapper">
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Map Legend Card */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <strong style={{ fontSize: '0.92rem' }}>Map Legend &amp; Authoritative Totals</strong>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              National Road Network: 21,284.02 km (Paved: 6,406.69 km | Unpaved: 14,877.33 km) &bull; Bridges: 552 &bull; Major Culverts: 452
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {Object.entries(CONDITION_COLORS).map(([label, hex]) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
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
                    <td>{SETBACK_BY_CLASS[selectedAsset.road_class] || '15 m to 30 m each side'}</td>
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
