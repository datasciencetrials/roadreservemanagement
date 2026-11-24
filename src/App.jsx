import React, { useState } from 'react';
import networkData from './data/networkData.json';
import OverviewView from './components/OverviewView';
import ReserveMapView from './components/ReserveMapView';
import AnalyticsView from './components/AnalyticsView';
import MindMapView from './components/MindMapView';
import DocumentationView from './components/DocumentationView';
import mowtLogo from './assets/mowt_logo.png';

const TABS = [
  { id: 'overview', label: 'Overview & Vision 2040' },
  { id: 'map', label: 'Geospatial Map' },
  { id: 'analytics', label: 'Corridor Analytics' },
  { id: 'mindmap', label: 'Mind Map' },
  { id: 'docs', label: 'Documentation' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="header-inner">
          <div className="brand-block">
            <img src={mowtLogo} alt="NATIONAL TRANSPORT GIS ENTERPRISE" className="brand-logo" />
            <div>
              <h1 className="brand-title">Road Reserve Management</h1>
              <p className="brand-subtitle">
                NATIONAL TRANSPORT GIS ENTERPRISE &bull; NATIONAL ROAD NETWORK ADMINISTRATION &bull; 21,284.02 km
              </p>
            </div>
          </div>

          <nav className="nav-tabs" aria-label="Primary navigation">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="header-badge-group">
            <span className="badge-pill blue">Vision 2040</span>
            <span className="badge-pill green">View-Only</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'overview' && <OverviewView data={networkData} onNavigate={setActiveTab} />}
        {activeTab === 'map' && <ReserveMapView data={networkData} />}
        {activeTab === 'analytics' && <AnalyticsView data={networkData} />}
        {activeTab === 'mindmap' && <MindMapView />}
        {activeTab === 'docs' && <DocumentationView data={networkData} />}
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <span>
            NATIONAL TRANSPORT GIS ENTERPRISE (National Road Network) &bull; NATIONAL ROAD NETWORK ADMINISTRATION &bull; NETWORK ENGINEERING AND PLANNING DIVISION
          </span>
          <span>
            Authoritative Register: 21,284.02 km | 552 Bridges | 452 Major Culverts | Updated: {networkData.summary.last_refreshed}
          </span>
        </div>
      </footer>
    </div>
  );
}
