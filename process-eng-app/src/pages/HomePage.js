// src/pages/HomePage.js
import React, { useState } from 'react';
import VerticalMenu from '../components/VerticalMenu';
// import page components
import ItemTypesPage from './ItemTypesPage';
import ItemTypePage from './ItemTypePage';
import TestApplicationsPage from './TestApplicationsPage';
import TestApplicationPage from './TestApplicationPage';

function HomePage({ selectedItem, setSelectedItem }) {
  //const [leftPanelSelected, setLeftPanelSelected] = useState(null);
  const [rightPanelContent, setRightPanelContent] = useState(null);
  const [selectedTestApp, setSelectedTestApp] = useState(null); 
  const [selectedItemType, setSelectedItemType] = useState(null); 
    let content;

  if (selectedItem === 'item-types-page') content = 
                                                      <ItemTypesPage 
                                                      onCreateNewItemType={() => setRightPanelContent(<ItemTypePage key={Date.now()} action="create"/>)}
                                                      onEditItemType={(itemType) => {setSelectedItemType(itemType); setRightPanelContent(<ItemTypePage key={Date.now()} action="view" itemTypeData={itemType}/>);}}//TODO julia: edit item type
                                                      onSelectItemType={(itemType) => { setSelectedTestApp(itemType); setRightPanelContent(<ItemTypePage key={Date.now()} action="view" itemTypeData={itemType}/>); }}
                                                      />;
  else if (selectedItem === 'test-applications-page') content = 
                                                      <TestApplicationsPage 
                                                      onCreateNewTestApplication={() => setRightPanelContent(<TestApplicationPage key={Date.now()} action="create"/>)}
                                                      onEditTestApplication={(testApp) => {setSelectedTestApp(testApp); setRightPanelContent(<TestApplicationPage key={Date.now()} action="view" testAppData={testApp}/>);}} //TODO julia: edit test application
                                                      onSelectTestApp={(testApp) => { setSelectedTestApp(testApp); setRightPanelContent(<TestApplicationPage key={Date.now()} action="view" testAppData={testApp}/>); }}
                                                      />;
                                                      
  else if (selectedItem === 'items-dashboard') content = <div style={{ padding: 20 }}><h2>Items Dashboard</h2><p>This is the items dashboard.</p></div>;
  else if (selectedItem === 'runs-dashboard') content = <div style={{ padding: 20 }}><h2>Runs dashboard</h2><p>This is the runs dashboard.</p></div>;
  else if (selectedItem === 'about-page') content = <div style={{ padding: 20 }}><h2>About</h2><p>This is the About section.</p></div>;

  return (
    <div className="container-fluid" style={{ display: 'flex', height: '100vh' }}>
      {/* Left: Vertical Menu */}
      <VerticalMenu selected={selectedItem} onSelect={setSelectedItem} />

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