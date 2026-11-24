import React from 'react';

export default function DocumentationView({ data }) {
  const { summary } = data;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Platform Documentation &amp; Technical Standards</h2>
          <p className="section-desc">
            Reference guide for the National Road Network Enterprise, Road Reserve Management Platform.
          </p>
        </div>
        <span className="badge-pill green">View-Only Public Intelligence</span>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">1. Statutory Mandate &amp; View-Only Scope</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 0 }}>
            This platform operates as a strictly view-only executive and engineering dashboard under the National Road Network Enterprise, Network Engineering and Planning Division. It presents historic road reserve baselines, current network condition registers, and Vision 2040 projections without user data-entry forms, login gates, or administrative overrides.
          </p>
          <ul style={{ paddingLeft: '18px', margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            <li>Authoritative National Road Network extent: <strong>21,284.02 km</strong> (23/09/2026 register).</li>
            <li>Surface split: <strong>6,406.69 km</strong> Paved (30.10%) and <strong>14,877.33 km</strong> Unpaved (69.90%).</li>
            <li>Structures register (01/10/2026): <strong>552 Bridges</strong> and <strong>452 Major Culverts</strong> reported in separate tables.</li>
            <li>Administrative coverage: <strong>6 Maintenance Regions</strong> (Central, Eastern, North Eastern, Northern, Southern, Western) and <strong>23 Maintenance Stations</strong>.</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title">2. Survey &amp; Condition Assessment Tools</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 0 }}>
            Pavement, drainage, and road reserve corridor conditions across Uganda&apos;s National Road Network are evaluated using two mandatory national survey systems:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-hairline)', borderRadius: '10px', padding: '12px' }}>
              <strong style={{ color: 'var(--accent-blue)' }}>MOBICAP(Road condition assesment tool)</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Captures visual surface distresses, shoulder integrity, drainage blockages, and road reserve encroachment indicators across paved and unpaved corridors.
              </p>
            </div>
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-hairline)', borderRadius: '10px', padding: '12px' }}>
              <strong style={{ color: 'var(--accent-teal)' }}>ROMDAS(Roughness and rutting machine based testing)</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Measures International Roughness Index (IRI in m/km), transverse rut depth (mm), and longitudinal profile for objective corridor prioritisation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Road Reserve Width Standards */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-title">3. Statutory Road Reserve Width &amp; Setback Standards</h3>
        <p className="card-subtitle">Corridor protection envelopes enforced across all functional road classes</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Functional Class</th>
                <th>Authoritative Length (km)</th>
                <th>Network Share (%)</th>
                <th>Total Reserve Width (m)</th>
                <th>Setback from Centreline (m)</th>
                <th>Primary Protection Objective</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><strong>Class M (Expressway)</strong></td>
                <td>144.56 km</td>
                <td>0.68%</td>
                <td>80 m</td>
                <td>40 m each side</td>
                <td>Full access control, grade separation, and future lane expansion</td>
              </tr>
              <tr>
                <td>2</td>
                <td><strong>Class A (International Trunk Road)</strong></td>
                <td>2,604.65 km</td>
                <td>12.24%</td>
                <td>60 m</td>
                <td>30 m each side</td>
                <td>Cross-border freight corridors, dualisation envelope, utility wayleaves</td>
              </tr>
              <tr>
                <td>3</td>
                <td><strong>Class B (National Trunk Road)</strong></td>
                <td>2,845.27 km</td>
                <td>13.37%</td>
                <td>50 m</td>
                <td>25 m each side</td>
                <td>Inter-regional trunk connectivity, drainage, and sight-distance protection</td>
              </tr>
              <tr>
                <td>4</td>
                <td><strong>Class C (Primary Road)</strong></td>
                <td>15,689.54 km</td>
                <td>73.72%</td>
                <td>30 m</td>
                <td>15 m each side</td>
                <td>District and rural market access, roadside drainage, and verge safety</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Governance & Abbreviations */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">4. Data Standards &amp; Vision 2040 Projections</h3>
          <div className="table-wrap">
            <table className="data-table">
              <tbody>
                <tr>
                  <th>Date Format</th>
                  <td>Strictly dd/mm/yyyy (e.g., {summary.last_refreshed})</td>
                </tr>
                <tr>
                  <th>Units &amp; Coordinates</th>
                  <td>Metric only (km, m, mm, T, km/h); coordinates in decimal degrees</td>
                </tr>
                <tr>
                  <th>Language Standard</th>
                  <td>UK English (optimising, programme, categorised, prioritisation, centre)</td>
                </tr>
                <tr>
                  <th>Geospatial Basemap</th>
                  <td>Esri World Imagery + Hybrid Reference Labels (World Boundaries and Places)</td>
                </tr>
                <tr>
                  <th>Vision 2040 Horizon</th>
                  <td>Projects paved network growth, traffic demand (AADT), and reserve protection from 2016 to 2040</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">5. Abbreviations</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Abbreviation</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td><strong>NRN</strong></td>
                  <td>National Road Network</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td><strong>ROW</strong></td>
                  <td>Right of Way (Road Reserve Corridor)</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td><strong>AADT</strong></td>
                  <td>Annual Average Daily Traffic</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td><strong>IRI</strong></td>
                  <td>International Roughness Index (m/km)</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td><strong>SNeff</strong></td>
                  <td>Effective Structural Number</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
