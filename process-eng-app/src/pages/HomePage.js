// src/pages/HomePage.js
import React, { useState } from 'react';
import VerticalMenu from '../components/VerticalMenu';
// import page components
import ItemTypesPage from './ItemTypesPage';
import ItemTypePage from './ItemTypePage';
import TestApplicationsPage from './TestApplicationsPage';
import TestApplicationPage from './TestApplicationPage';

function HomePage() {
  const [leftPanelSelected, setLeftPanelSelected] = useState('item-types-page');//the default first page to load (user sees first)
  const [rightPanelContent, setRightPanelContent] = useState(null);
  const [selectedTestApp, setSelectedTestApp] = useState(null); 
  const [selectedItemType, setSelectedItemType] = useState(null); 
  let content;
  if (leftPanelSelected === 'item-types-page') content = 
                                                      <ItemTypesPage 
                                                      onCreateNewItemType={() => setRightPanelContent(<ItemTypePage key={Date.now()} action="create"/>)}
                                                      onEditItemType={(itemType) => {setSelectedItemType(itemType); setRightPanelContent(<ItemTypePage key={Date.now()} action="view" itemTypeData={itemType}/>);}}//TODO julia: edit item type
                                                      onSelectItemType={(itemType) => { setSelectedTestApp(itemType); setRightPanelContent(<ItemTypePage key={Date.now()} action="view" itemTypeData={itemType}/>); }}
                                                      />;
  else if (leftPanelSelected === 'test-applications-page') content = 
                                                      <TestApplicationsPage 
                                                      onCreateNewTestApplication={() => setRightPanelContent(<TestApplicationPage key={Date.now()} action="create"/>)}
                                                      onEditTestApplication={(testApp) => {setSelectedTestApp(testApp); setRightPanelContent(<TestApplicationPage key={Date.now()} action="view" testAppData={testApp}/>);}} //TODO julia: edit test application
                                                      onSelectTestApp={(testApp) => { setSelectedTestApp(testApp); setRightPanelContent(<TestApplicationPage key={Date.now()} action="view" testAppData={testApp}/>); }}
                                                      />;
  else if (leftPanelSelected === 'about-page') content = <div style={{ padding: 20 }}><h2>About</h2><p>This is the About section.</p></div>;

  return (
    <div className="container-fluid" style={{ display: 'flex', height: '100vh' }}>
      {/* Left: Vertical Menu */}
      <VerticalMenu selected={leftPanelSelected} onSelect={setLeftPanelSelected} />

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