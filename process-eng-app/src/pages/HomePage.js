// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import VerticalMenu from '../components/VerticalMenu';
// import page components
import ItemTypesPage from './ItemTypesPage';
import ItemTypePage from './ItemTypePage';
import TestApplicationsPage from './TestApplicationsPage';
import TestApplicationPage from './TestApplicationPage';
import AboutPage from './AboutPage';

function HomePage({ selectedMenu, setSelectedMenu }) {
  //const [leftPanelSelected, setLeftPanelSelected] = useState(null);
  const [rightPanelContent, setRightPanelContent] = useState(null);
  const [selectedTestApp, setSelectedTestApp] = useState(null); 
  const [selectedItemType, setSelectedItemType] = useState(null); 
    let content;

  // Whenever selectedMenu changed (clear the right panel)
  useEffect(() => {
    console.log("HomePage detected menu change, clearing right panel");
    setRightPanelContent(null);
  }, [selectedMenu]);

  console.log("HomePage render, selectedMenu:", selectedMenu);
  if (selectedMenu === 'item-types-page') content = 
                                                      <ItemTypesPage 
                                                      onCreateNewItemType={() => setRightPanelContent(<ItemTypePage key={Date.now()} action="create"/>)}
                                                      onEditItemType={(itemType) => {setSelectedItemType(itemType); setRightPanelContent(<ItemTypePage key={Date.now()} action="view" itemTypeData={itemType}/>);}}//TODO julia: edit item type
                                                      onSelectItemType={(itemType) => { setSelectedTestApp(itemType); setRightPanelContent(<ItemTypePage key={Date.now()} action="view" itemTypeData={itemType}/>); }}
                                                      />;
  else if (selectedMenu === 'test-applications-page') content = 
                                                      <TestApplicationsPage 
                                                      onCreateNewTestApplication={() => setRightPanelContent(<TestApplicationPage key={Date.now()} action="create"/>)}
                                                      onEditTestApplication={(testApp) => {setSelectedTestApp(testApp); setRightPanelContent(<TestApplicationPage key={Date.now()} action="view" testAppData={testApp}/>);}} //TODO julia: edit test application
                                                      onSelectTestApp={(testApp) => { setSelectedTestApp(testApp); setRightPanelContent(<TestApplicationPage key={Date.now()} action="view" testAppData={testApp}/>); }}
                                                      />;
                                                      
  else if (selectedMenu === 'items-dashboard') content = <div style={{ padding: 20 }}><h2>Items Dashboard</h2><p>This is the items dashboard.</p></div>;
  else if (selectedMenu === 'runs-dashboard') content = <div style={{ padding: 20 }}><h2>Runs dashboard</h2><p>This is the runs dashboard.</p></div>;
  else if (selectedMenu === 'settings-page') content = <div style={{ padding: 20 }}><h2>Settings</h2><p>This is the Settings section.</p></div>;
  else if (selectedMenu === 'about-page') content = <AboutPage/>;

  return (
    <div className="container-fluid" style={{ display: 'flex', height: '100vh' }}>
      {/* Left: Vertical Menu */}
      <VerticalMenu selected={selectedMenu} onSelect={setSelectedMenu} />

      {/* Middle: Main Content */}
      <div style={{ flex: 2, padding: 20, borderRight: '1px solid #eee' }}>
        {content}
      </div>

      {/* Right: (Optional) */}
      <div style={{ flex: 1, padding: 20 }}>
        {rightPanelContent}
      </div>
    </div>
  );
}

export default HomePage;