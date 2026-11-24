import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CONDITION_COLORS = {
  Good: '#16A34A',
  Satisfactory: '#0071E3',
  Marginal: '#D97706',
  Poor: '#DC2626',
  Critical: '#7F1D1D',
  'Under Construction': '#7C3AED'
};

const COLORS = {
  blue: '#0071E3',
  green: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
  purple: '#7C3AED',
  teal: '#0D9488'
};

export default function AnalyticsView({ data }) {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [surfaceFilter, setSurfaceFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [showAllCorridors, setShowAllCorridors] = useState(false);

  const filteredCorridors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.corridors.filter((c) => {
      if (classFilter !== 'All' && !c.functional_class.includes(classFilter)) return false;
      if (surfaceFilter !== 'All' && c.surface_type.toLowerCase() !== surfaceFilter.toLowerCase()) return false;
      if (conditionFilter !== 'All' && c.condition_band.toLowerCase() !== conditionFilter.toLowerCase()) return false;
      if (q && !c.road_name.toLowerCase().includes(q) && !c.functional_class.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data.corridors, search, classFilter, surfaceFilter, conditionFilter]);

  const filteredKm = useMemo(() => {
    return filteredCorridors.reduce((acc, c) => acc + (Number(c.length_km) || 0), 0);
  }, [filteredCorridors]);

  const displayedCorridors = showAllCorridors ? filteredCorridors : filteredCorridors.slice(0, 40);

  const handleResetFilters = () => {
    setSearch('');
    setClassFilter('All');
    setSurfaceFilter('All');
    setConditionFilter('All');
    setShowAllCorridors(false);
  };

  const exportCsv = () => {
    const headers = [
      'Road Name', 'Functional Class', 'Surface Type', 'Length (km)',
      'Condition', 'IRI (m/km)', 'Rut Depth (mm)', 'SNeff',
      'AADT 2026', 'AADT 2040 Projection', 'Updated Date'
    ];
    const rows = filteredCorridors.map((c) => [
      `"${(c.road_name || '').replace(/"/g, '""')}"`,
      `"${(c.functional_class || '').replace(/"/g, '""')}"`,
      `"${c.surface_type}"`,
      c.length_km,
      `"${c.condition_band}"`,
      c.iri_m_per_km ?? '',
      c.rut_depth_mm ?? '',
      c.sneff ?? '',
      c.aadt_2026 ?? '',
      c.aadt_2040 ?? '',
      `"${c.updated_date}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'National Road Network Road Reserve Corridors 2026 to 2040.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Corridor &amp; Structures Analytics</h2>
          <p className="section-desc">
            Disaggregated pavement condition from MOBICAP(Road condition assesment tool) and ROMDAS(Roughness and rutting machine based testing), with Bridges (552) and Major Culverts (452) reported in separate tables and charts.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={exportCsv}>
          Download Corridor CSV
        </button>
      </div>

      {/* Bridges vs Major Culverts Separate Condition Charts & Tables */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Bridges Condition Profile (552 Total)</h3>
          <p className="card-subtitle">Authoritative bridge register as at 01/10/2026</p>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={data.bridge_conditions} margin={{ top: 10, right: 16, left: 0, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="condition" tick={{ fill: '#0F172A', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={44} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#0F172A' }} />
                <Bar dataKey="count" name="Bridges" radius={[6, 6, 0, 0]}>
                  {data.bridge_conditions.map((entry) => (
                    <Cell key={entry.condition} fill={CONDITION_COLORS[entry.condition] || COLORS.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrap" style={{ marginTop: '12px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Bridge Condition</th>
                  <th>Count</th>
                  <th>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.bridge_conditions.map((b, i) => (
                  <tr key={b.condition}>
                    <td>{i + 1}</td>
                    <td>{b.condition}</td>
                    <td>{b.count}</td>
                    <td>{b.pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Major Culverts Condition Profile (452 Total)</h3>
          <p className="card-subtitle">Authoritative major culvert register as at 01/10/2026</p>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={data.culvert_conditions} margin={{ top: 10, right: 16, left: 0, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="condition" tick={{ fill: '#0F172A', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={44} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#0F172A' }} />
                <Bar dataKey="count" name="Major Culverts" radius={[6, 6, 0, 0]}>
                  {data.culvert_conditions.map((entry) => (
                    <Cell key={entry.condition} fill={CONDITION_COLORS[entry.condition] || COLORS.teal} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrap" style={{ marginTop: '12px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Major Culvert Condition</th>
                  <th>Count</th>
                  <th>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.culvert_conditions.map((c, i) => (
                  <tr key={c.condition}>
                    <td>{i + 1}</td>
                    <td>{c.condition}</td>
                    <td>{c.count}</td>
                    <td>{c.pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Regional Distribution: Strictly Separate Charts for Bridges and Major Culverts */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Bridges by Maintenance Region (552 Total)</h3>
          <p className="card-subtitle">Distribution across the 6 National Road Network Maintenance Regions (01/10/2026)</p>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={data.regions} margin={{ top: 10, right: 16, left: 0, bottom: 14 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="region_name" tick={{ fill: '#0F172A', fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={40} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#0F172A' }} />
                <Bar dataKey="bridges_count" name="Bridges" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Major Culverts by Maintenance Region (452 Total)</h3>
          <p className="card-subtitle">Distribution across the 6 National Road Network Maintenance Regions (01/10/2026)</p>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={data.regions} margin={{ top: 10, right: 16, left: 0, bottom: 14 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="region_name" tick={{ fill: '#0F172A', fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={40} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#0F172A' }} />
                <Bar dataKey="major_culverts_count" name="Major Culverts" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Corridor Reserve Register */}
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 className="card-title">National Road Reserve Corridor Register</h3>
            <p className="card-subtitle" style={{ marginBottom: 0 }}>
              Filtered extent: <strong>{filteredKm.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km</strong> ({((filteredKm / 21284.02) * 100).toFixed(2)}% of 21,284.02 km National Road Network)
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>

        <div className="filter-bar" style={{ boxShadow: 'none', padding: '10px 12px', marginBottom: '16px', background: 'var(--bg-subtle)' }}>
          <input
            type="text"
            className="input-control"
            placeholder="Search corridor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: '220px', flex: 1 }}
            aria-label="Search corridor name"
          />
          <select className="select-control" aria-label="Filter class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="All">All Functional Classes</option>
            <option value="Class M">Class M (Expressway)</option>
            <option value="Class A">Class A (International Trunk)</option>
            <option value="Class B">Class B (National Trunk)</option>
            <option value="Class C">Class C (Primary Road)</option>
          </select>
          <select className="select-control" aria-label="Filter surface" value={surfaceFilter} onChange={(e) => setSurfaceFilter(e.target.value)}>
            <option value="All">All Surfaces</option>
            <option value="Paved">Paved</option>
            <option value="Unpaved">Unpaved</option>
          </select>
          <select className="select-control" aria-label="Filter condition" value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
            <option value="All">All Conditions</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Corridor Name</th>
                <th>Functional Class</th>
                <th>Surface</th>
                <th>Length (km)</th>
                <th>Condition</th>
                <th>IRI (m/km)</th>
                <th>Rut Depth (mm)</th>
                <th>SNeff</th>
                <th>2026 AADT</th>
                <th>2040 Projection</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {displayedCorridors.map((c, idx) => (
                <tr key={`${c.road_name}-${c.functional_class}-${idx}`}>
                  <td>{idx + 1}</td>
                  <td><strong>{c.road_name}</strong></td>
                  <td>{c.functional_class}</td>
                  <td>{c.surface_type}</td>
                  <td>{c.length_km.toLocaleString('en-GB', { minimumFractionDigits: 2 })} km</td>
                  <td>
                    <span className={`badge-pill ${c.condition_band === 'Good' ? 'green' : c.condition_band === 'Poor' ? 'red' : 'blue'}`}>
                      {c.condition_band}
                    </span>
                  </td>
                  <td>{c.iri_m_per_km !== null ? c.iri_m_per_km.toFixed(2) : 'Not recorded'}</td>
                  <td>{c.rut_depth_mm !== null ? c.rut_depth_mm.toFixed(1) : 'Not recorded'}</td>
                  <td>{c.sneff !== null ? c.sneff.toFixed(2) : 'Not recorded'}</td>
                  <td>{c.aadt_2026 ? c.aadt_2026.toLocaleString('en-GB') : 'Not recorded'}</td>
                  <td>{c.aadt_2040 ? c.aadt_2040.toLocaleString('en-GB') : 'Not recorded'}</td>
                  <td>{c.updated_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCorridors.length > 40 && (
          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowAllCorridors((v) => !v)}>
              {showAllCorridors ? 'Show Compact View' : 'Expand Full Corridor Register'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
