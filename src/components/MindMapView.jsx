import React, { useState } from 'react';

const MINDMAP_BRANCHES = [
  {
    id: 'setbacks',
    title: 'Corridor Setback Standards',
    color: '#0071E3',
    textColor: '#005BBF',
    soft: '#EFF6FF',
    summary: 'Statutory road reserve widths and centreline setbacks protecting national corridors from encroachment.',
    metrics: [
      'Expressways (Class M): 144.56 km | 80 m reserve (40 m each side)',
      'International Trunk Roads (Class A): 2,604.65 km | 60 m reserve (30 m each side)',
      'National Trunk Roads (Class B): 2,845.27 km | 50 m reserve (25 m each side)',
      'Primary Roads (Class C): 15,689.54 km | 30 m reserve (15 m each side)'
    ],
    children: [
      { id: 'setbacks-m', label: 'Class M: 80 m Reserve', detail: '144.56 km (0.68% of network). High-speed controlled-access corridors with 40 m setback per side.' },
      { id: 'setbacks-a', label: 'Class A: 60 m Reserve', detail: '2,604.65 km (12.24% of network). International border and transit corridors with 30 m setback per side.' },
      { id: 'setbacks-b', label: 'Class B: 50 m Reserve', detail: '2,845.27 km (13.37% of network). Inter-regional trunk links with 25 m setback per side.' },
      { id: 'setbacks-c', label: 'Class C: 30 m Reserve', detail: '15,689.54 km (73.72% of network). Primary national connectors with 15 m setback per side.' }
    ]
  },
  {
    id: 'survey',
    title: 'Survey & Telemetry Tools',
    color: '#0D9488',
    textColor: '#0F766E',
    soft: '#CCFBF1',
    summary: 'Standardised condition monitoring across the 21,284.02 km National Road Network.',
    metrics: [
      'MOBICAP(Road condition assesment tool) for visual distress & reserve encroachment',
      'ROMDAS(Roughness and rutting machine based testing) for IRI & rut depth',
      'Network Condition: 59.20% Good (12,610.00 km), 36.82% Fair (7,844.00 km), 3.98% Poor (848.00 km)'
    ],
    children: [
      { id: 'survey-mobicap', label: 'MOBICAP(Road condition assesment tool)', detail: 'Captures surface distresses, drainage blockage, shoulder erosion, and road reserve boundary compliance.' },
      { id: 'survey-romdas', label: 'ROMDAS(Roughness and rutting machine based testing)', detail: 'Measures International Roughness Index (IRI in m/km), transverse rut depth (mm), and longitudinal profile.' },
      { id: 'survey-fwd', label: 'Structural Strength (SNeff)', detail: 'Falling Weight Deflectometer basin parameters (BLI, MLI, LLI, RoC) supporting residual life planning.' }
    ]
  },
  {
    id: 'structures',
    title: 'Structures & Drainage',
    color: '#7C3AED',
    textColor: '#5B21B6',
    soft: '#EDE9FE',
    summary: 'Separate statutory registers for Bridges (552) and Major Culverts (452) as at 01/10/2026.',
    metrics: [
      'Bridges: 552 total (Good 247, Satisfactory 71, Marginal 162, Poor 52, Critical 13, Under Construction 7)',
      'Major Culverts: 452 total (Good 403, Satisfactory 39, Marginal 4, Poor 1, Critical 4, Under Construction 1)'
    ],
    children: [
      { id: 'struct-bridges', label: '552 Bridges', detail: 'Monitored for abutment scour, bearing condition, waterway clearance, and deck structural integrity.' },
      { id: 'struct-culverts', label: '452 Major Culverts', detail: 'Monitored for hydraulic capacity, inlet/outlet siltation, and embankment protection within the reserve.' }
    ]
  },
  {
    id: 'governance',
    title: 'Wayleave & Reserve Protection',
    color: '#D97706',
    textColor: '#92400E',
    soft: '#FEF3C7',
    summary: 'View-only policy governance for utility corridors, signage setbacks, and access control.',
    metrics: [
      'Utility wayleave corridors positioned within outer 3 m to 5 m of reserve boundary',
      'Strict clearance zones at junctions, bridge approaches, and ferry landings',
      'Metric units (m, km, mm, T, km/h) and decimal degree coordinates enforced'
    ],
    children: [
      { id: 'gov-utilities', label: 'Utility Wayleaves', detail: 'Fibre optic, power, and water mains routed outside structural pavement prisms to prevent trenching damage.' },
      { id: 'gov-encroach', label: 'Encroachment Control', detail: 'Boundary beacons and satellite imagery monitoring protect future dualisation and Vision 2040 widening.' }
    ]
  },
  {
    id: 'regions',
    title: '6 Maintenance Regions',
    color: '#16A34A',
    textColor: '#166534',
    soft: '#DCFCE7',
    summary: 'Operational administration across 6 Maintenance Regions and 23 Maintenance Stations.',
    metrics: [
      'Central: 107 Bridges, 54 Major Culverts',
      'Eastern: 95 Bridges, 82 Major Culverts',
      'North Eastern: 49 Bridges, 69 Major Culverts',
      'Northern: 175 Bridges, 76 Major Culverts',
      'Southern: 80 Bridges, 75 Major Culverts',
      'Western: 46 Bridges, 96 Major Culverts'
    ],
    children: [
      { id: 'reg-stations', label: '23 Maintenance Stations', detail: 'Field-level corridor inspection, routine verge clearing, and reserve boundary beacon maintenance.' },
      { id: 'reg-surface', label: 'Surface Split (2026)', detail: '6,406.69 km Paved (30.10%) and 14,877.33 km Unpaved (69.90%) across all 6 regions.' }
    ]
  },
  {
    id: 'vision2040',
    title: 'Vision 2040 Strategic Targets',
    color: '#DC2626',
    textColor: '#991B1B',
    soft: '#FEE2E2',
    summary: 'Long-term corridor capacity, paving expansion, and reserve preservation through 2040.',
    metrics: [
      'Expand paved national network from 6,406.69 km (2026) toward 12,800.00 km by 2040',
      'Achieve 96.0% full statutory reserve demarcation and beacon protection',
      'Eliminate critical bridge and major culvert backlog via multi-year prioritisation'
    ],
    children: [
      { id: 'v2040-pave', label: 'Paved Network Growth', detail: 'Systematic upgrading of high-traffic Class B and Class C unpaved corridors to bitumen standards.' },
      { id: 'v2040-res', label: 'Corridor Preservation', detail: 'Securing 60 m to 80 m expressway and trunk reserves ahead of projected 2040 traffic demand.' }
    ]
  }
];

export default function MindMapView() {
  const [selectedBranchId, setSelectedBranchId] = useState('setbacks');
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [expandedAll, setExpandedAll] = useState(true);

  const activeBranch = MINDMAP_BRANCHES.find((b) => b.id === selectedBranchId) || MINDMAP_BRANCHES[0];
  const activeChild = activeBranch.children.find((c) => c.id === selectedChildId) || null;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Interactive Road Reserve Architecture Mind Map</h2>
          <p className="section-desc">
            Click any domain node or sub-node to inspect statutory reserve standards, survey tools, and Vision 2040 targets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setExpandedAll((v) => !v)}
          >
            {expandedAll ? 'Collapse Sub-Nodes' : 'Expand All Sub-Nodes'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setSelectedBranchId('setbacks');
              setSelectedChildId(null);
              setExpandedAll(true);
            }}
          >
            Reset Selection
          </button>
        </div>
      </div>

      {/* Interactive Mind Map Grid + Central Hub */}
      <div className="mindmap-canvas" style={{ marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-block',
              background: '#0071E3',
              color: '#FFFFFF',
              padding: '14px 28px',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 113, 227, 0.22)',
              fontWeight: 700,
              fontSize: '1.05rem'
            }}
          >
            National Road Network Road Reserve Management Hub &bull; 21,284.02 km
            <div style={{ fontSize: '0.78rem', fontWeight: 500, opacity: 0.92, marginTop: '3px' }}>
              6,406.69 km Paved | 14,877.33 km Unpaved | 552 Bridges | 452 Major Culverts | Vision 2040
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {MINDMAP_BRANCHES.map((branch) => {
            const isSelected = branch.id === selectedBranchId;
            return (
              <div
                key={branch.id}
                className="mindmap-node"
                onClick={() => {
                  setSelectedBranchId(branch.id);
                  setSelectedChildId(null);
                }}
                style={{
                  background: isSelected ? branch.soft : '#FFFFFF',
                  border: `2px solid ${isSelected ? branch.color : '#E2E8F0'}`,
                  borderRadius: '14px',
                  padding: '16px',
                  boxShadow: isSelected ? '0 8px 20px rgba(15, 23, 42, 0.08)' : '0 1px 3px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: branch.color, display: 'inline-block' }} />
                  <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{branch.title}</strong>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.84rem', color: '#475569' }}>
                  {branch.summary}
                </p>

                {expandedAll && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {branch.children.map((child) => {
                      const childActive = selectedChildId === child.id;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBranchId(branch.id);
                            setSelectedChildId(child.id);
                          }}
                          style={{
                            appearance: 'none',
                            border: `1px solid ${childActive ? branch.color : '#CBD5E1'}`,
                            background: childActive ? branch.color : '#FFFFFF',
                            color: childActive ? '#FFFFFF' : '#0F172A',
                            borderRadius: '9999px',
                            padding: '5px 11px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Inspector Panel */}
      <div className="card" style={{ borderLeft: `4px solid ${activeBranch.color}` }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div>
            <span className="badge-pill" style={{ background: activeBranch.soft, color: activeBranch.textColor || activeBranch.color, borderColor: activeBranch.color }}>
              Selected Domain
            </span>
            <h3 style={{ margin: '8px 0 2px 0', fontSize: '1.2rem' }}>
              {activeBranch.title}{activeChild ? ` : ${activeChild.label}` : ''}
            </h3>
          </div>
        </div>

        {activeChild ? (
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-hairline)', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
            <strong style={{ fontSize: '0.92rem', color: activeBranch.textColor || activeBranch.color }}>{activeChild.label}</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeChild.detail}</p>
          </div>
        ) : (
          <p style={{ margin: '0 0 12px 0', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            {activeBranch.summary}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
          {activeBranch.metrics.map((m, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border-hairline)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
