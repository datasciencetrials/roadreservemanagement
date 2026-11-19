import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const TIMELINE_YEARS = [2016, 2021, 2026, 2030, 2035, 2040];

const COLORS = {
  blue: '#0071E3',
  green: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
  purple: '#7C3AED',
  teal: '#0D9488',
  slate: '#64748B'
};

export default function OverviewView({ data, onNavigate }) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const { summary, functional_classes } = data;

  // Vision 2040 projection model anchored on authoritative 2026 baseline (21,284.02 km)
  const projection = useMemo(() => {
    const t = (selectedYear - 2016) / (2040 - 2016); // 0.0 in 2016, 0.4167 in 2026, 1.0 in 2040
    // Anchors: 2016 ~ 4,150 km paved; 2026 = 6,406.69 km paved; 2040 Vision 2040 target = 12,800.00 km paved
    let pavedKm = 6406.69;
    let goodPct = 59.20;
    let fairPct = 36.82;
    let poorPct = 3.98;
    let reserveProtectedPct = 74.5;

    if (selectedYear < 2026) {
      const f = (selectedYear - 2016) / 10;
      pavedKm = 4150.00 + f * (6406.69 - 4150.00);
      goodPct = 49.0 + f * (59.20 - 49.0);
      poorPct = 8.5 - f * (8.5 - 3.98);
      fairPct = 100 - goodPct - poorPct;
      reserveProtectedPct = 58.0 + f * (74.5 - 58.0);
    } else if (selectedYear > 2026) {
      const f = (selectedYear - 2026) / 14;
      pavedKm = 6406.69 + f * (12800.00 - 6406.69);
      goodPct = 59.20 + f * (82.00 - 59.20);
      poorPct = 3.98 - f * (3.98 - 1.20);
      fairPct = 100 - goodPct - poorPct;
      reserveProtectedPct = 74.5 + f * (96.0 - 74.5);
    }

    const unpavedKm = Math.max(0, summary.total_network_km - pavedKm);
    const pavedPct = (pavedKm / summary.total_network_km) * 100;
    const unpavedPct = 100 - pavedPct;

    return {
      year: selectedYear,
      label: selectedYear === 2026 ? 'Current Baseline (2026)' : selectedYear < 2026 ? `Historic (${selectedYear})` : `Vision 2040 Projection (${selectedYear})`,
      pavedKm: Number(pavedKm.toFixed(2)),
      unpavedKm: Number(unpavedKm.toFixed(2)),
      pavedPct: Number(pavedPct.toFixed(2)),
      unpavedPct: Number(unpavedPct.toFixed(2)),
      goodPct: Number(goodPct.toFixed(2)),
      fairPct: Number(fairPct.toFixed(2)),
      poorPct: Number(poorPct.toFixed(2)),
      reserveProtectedPct: Number(reserveProtectedPct.toFixed(1)),
      trafficIndex: Number((1 + t * 1.45).toFixed(2))
    };
  }, [selectedYear, summary.total_network_km]);

  const trajectoryData = useMemo(() => {
    return TIMELINE_YEARS.map((yr) => {
      if (yr === 2026) {
        return { year: String(yr), Paved: 6406.69, Unpaved: 14877.33, ProtectedPct: 74.5 };
      }
      if (yr < 2026) {
        const f = (yr - 2016) / 10;
        const p = Number((4150 + f * (6406.69 - 4150)).toFixed(2));
        return { year: String(yr), Paved: p, Unpaved: Number((21284.02 - p).toFixed(2)), ProtectedPct: Number((58 + f * 16.5).toFixed(1)) };
      }
      const f = (yr - 2026) / 14;
      const p = Number((6406.69 + f * (12800 - 6406.69)).toFixed(2));
      return { year: String(yr), Paved: p, Unpaved: Number((21284.02 - p).toFixed(2)), ProtectedPct: Number((74.5 + f * 21.5).toFixed(1)) };
    });
  }, []);

  const conditionPieData = [
    { name: 'Good', value: projection.goodPct, color: COLORS.green },
    { name: 'Fair', value: projection.fairPct, color: COLORS.amber },
    { name: 'Poor', value: projection.poorPct, color: COLORS.red }
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">National Road Reserve Overview &amp; Vision 2040</h2>
          <p className="section-desc">
            Authoritative view-only intelligence for Uganda&apos;s National Road Network, corridor setbacks, and structural assets. Last refreshed: {summary.last_refreshed}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary" onClick={() => onNavigate('map')}>
            Open Satellite Map
          </button>
          <button type="button" className="btn-primary" onClick={() => onNavigate('mindmap')}>
            Explore Mind Map
          </button>
        </div>
      </div>

      {/* Vision 2040 Interactive Timeline Slider */}
      <div className="timeline-card">
        <div className="timeline-controls">
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent-blue)' }}>
              Vision 2040 Horizon Selector
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {projection.label}
            </div>
          </div>
          <div className="year-pills">
            {TIMELINE_YEARS.map((yr) => (
              <button
                key={yr}
                type="button"
                className={`year-pill ${selectedYear === yr ? 'active' : ''}`}
                onClick={() => setSelectedYear(yr)}
              >
                {yr === 2026 ? '2026 (Live)' : yr}
              </button>
            ))}
          </div>
        </div>
        <input
          type="range"
          min={2016}
          max={2040}
          step={1}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="range-slider"
          aria-label="Vision 2040 timeline year"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
          <span>2016 Historic Baseline</span>
          <span>2026 Current Register (23/09/2026)</span>
          <span>2040 Vision 2040 Target</span>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">National Road Network</span>
          <span className="kpi-value" style={{ color: COLORS.blue }}>21,284.02 km</span>
          <span className="kpi-meta">6 Maintenance Regions, 23 Stations</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Paved Extent ({selectedYear})</span>
          <span className="kpi-value" style={{ color: COLORS.green }}>{projection.pavedKm.toLocaleString('en-GB', { minimumFractionDigits: 2 })} km</span>
          <span className="kpi-meta">{projection.pavedPct.toFixed(2)}% of National Network</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Unpaved Extent ({selectedYear})</span>
          <span className="kpi-value" style={{ color: COLORS.amber }}>{projection.unpavedKm.toLocaleString('en-GB', { minimumFractionDigits: 2 })} km</span>
          <span className="kpi-meta">{projection.unpavedPct.toFixed(2)}% of National Network</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Bridges &amp; Major Culverts</span>
          <span className="kpi-value" style={{ color: COLORS.purple }}>552 / 452</span>
          <span className="kpi-meta">552 Bridges, 452 Major Culverts (01/10/2026)</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Reserve Demarcation Coverage</span>
          <span className="kpi-value" style={{ color: COLORS.teal }}>{projection.reserveProtectedPct}%</span>
          <span className="kpi-meta">Traffic Multiplier: {projection.trafficIndex}x vs 2016</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Functional Class Extent &amp; Reserve Width</h3>
          <p className="card-subtitle">Authoritative network length (km) by functional class (23/09/2026)</p>
          <div style={{ width: '100%', height: 290 }}>
            <ResponsiveContainer>
              <BarChart data={functional_classes} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="code" tick={{ fill: '#0F172A', fontSize: 12 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#0F172A' }}
                  formatter={(value) => [`${Number(value).toLocaleString('en-GB')} km`, 'Length']}
                />
                <Bar dataKey="paved_km" name="Paved (km)" stackId="a" fill={COLORS.blue} radius={[0, 0, 0, 0]} />
                <Bar dataKey="unpaved_km" name="Unpaved (km)" stackId="a" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Network Surface Condition ({selectedYear})</h3>
          <p className="card-subtitle">Assessed via MOBICAP(Road condition assesment tool) and ROMDAS(Roughness and rutting machine based testing)</p>
          <div style={{ width: '100%', height: 290 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={conditionPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={105}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {conditionPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#0F172A' }}
                  formatter={(val) => [`${val}%`, 'Share']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vision 2040 Trajectory */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Vision 2040 Network Upgrade &amp; Reserve Protection Trajectory</h3>
        <p className="card-subtitle">Projected paved versus unpaved extent (km) from 2016 baseline to 2040 target</p>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={trajectoryData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="year" tick={{ fill: '#0F172A', fontSize: 12 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#0F172A' }} />
              <Legend />
              <Line type="monotone" dataKey="Paved" name="Paved Extent (km)" stroke={COLORS.green} strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Unpaved" name="Unpaved Extent (km)" stroke={COLORS.amber} strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Functional Class & Reserve Setback Summary Table */}
      <div className="card">
        <h3 className="card-title">Statutory Road Reserve Widths by Functional Class</h3>
        <p className="card-subtitle">All lengths strictly reported in kilometres (km) and percentage shares (%)</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Functional Class</th>
                <th>Total Length (km)</th>
                <th>Network Share (%)</th>
                <th>Paved (km)</th>
                <th>Unpaved (km)</th>
                <th>Reserve Width (m)</th>
                <th>Centreline Setback (m)</th>
              </tr>
            </thead>
            <tbody>
              {functional_classes.map((fc, idx) => (
                <tr key={fc.code}>
                  <td>{idx + 1}</td>
                  <td><strong>{fc.name}</strong></td>
                  <td>{fc.length_km.toLocaleString('en-GB', { minimumFractionDigits: 2 })} km</td>
                  <td>{fc.share_pct.toFixed(2)}%</td>
                  <td>{fc.paved_km.toLocaleString('en-GB', { minimumFractionDigits: 2 })} km</td>
                  <td>{fc.unpaved_km.toLocaleString('en-GB', { minimumFractionDigits: 2 })} km</td>
                  <td>{fc.reserve_width_m} m</td>
                  <td>{fc.setback_m} m each side</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
