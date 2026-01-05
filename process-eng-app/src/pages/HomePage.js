// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import VerticalMenu from '../components/VerticalMenu';
// import page components
import ItemTypesPage from './ItemTypesPage';
import ItemTypePage from './ItemTypePage';
import TestApplicationsPage from './TestApplicationsPage';
import TestApplicationPage from './TestApplicationPage';
import ItemsDashboardPage from './ItemsDashboardPage';
import ItemDetailsPage from './ItemDetailsPage';
import RunsDashboardPage from './RunsDashboardPage';
import RunDetailsPage from './RunDetailsPage';
import AboutPage from './AboutPage';
import UsersPage from './UsersPage';
import UserDetailsPage from './UserDetailsPage';
import constants from '../constants';


function HomePage({ selectedMenu, setSelectedMenu }) {
  //const [leftPanelSelected, setLeftPanelSelected] = useState(null);
  const [rightPanelContent, setRightPanelContent] = useState(null);
  const [selectedTestApp, setSelectedTestApp] = useState(null); 
  const [selectedItemType, setSelectedItemType] = useState(null); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);

    let content;

  // Whenever selectedMenu changed (clear the right panel)
  useEffect(() => {
    console.log("HomePage detected menu change, clearing right panel");
    setRightPanelContent(null);
  }, [selectedMenu]);

  useEffect(() => {
    // Fetch roles from server
    console.log(`useEffect for fetching available roles from server called.`)
    async function fetchRoles() {
      const response = await fetch(`${constants.API_BASE}/users/roles`);
      const data = await response.json();

      setAvailableRoles(data.roles || []);
    }
    fetchRoles();
  }, []);

  console.log("HomePage render, selectedMenu:", selectedMenu);
  if (selectedMenu === 'item-types-page') content = 
                                                      <ItemTypesPage 
                                                      onCreateNewItemType={() => setRightPanelContent(<ItemTypePage key={Date.now()} action="create"/>)}
                                                      onEditItemType={(itemType) => {if (itemType) {setSelectedItemType(itemType); setRightPanelContent(<ItemTypePage key={Date.now()} action="view" itemTypeData={itemType}/>);}}}//TODO julia: edit item type
                                                      onSelectItemType={(itemType) => { setRightPanelContent(null); if (itemType) {setSelectedTestApp(itemType); setRightPanelContent(<ItemTypePage key={Date.now()} action="view" itemTypeData={itemType}/>); }}}
                                                      />;
  else if (selectedMenu === 'test-applications-page') content = 
                                                      <TestApplicationsPage 
                                                      onCreateNewTestApplication={() => setRightPanelContent(<TestApplicationPage key={Date.now()} action="create"/>)}
                                                      onEditTestApplication={(testApp) => {if (testApp) { setSelectedTestApp(testApp); setRightPanelContent(<TestApplicationPage key={Date.now()} action="view" testAppData={testApp}/>);}}} //TODO julia: edit test application
                                                      onSelectTestApp={(testApp) => {setRightPanelContent(null); if (testApp) { setSelectedTestApp(testApp); setRightPanelContent(<TestApplicationPage key={Date.now()} action="view" testAppData={testApp}/>); }}}
                                                      />;
                                                      
  else if (selectedMenu === 'items-dashboard') content = 
                                                      <ItemsDashboardPage 
                                                      onSelectItem={(item) => { setRightPanelContent(null); setSelectedItem(item); if (item) setRightPanelContent(<ItemDetailsPage key={Date.now()} item={item}/>); }}
                                                      />;
  else if (selectedMenu === 'runs-dashboard') content = 
                                                      <RunsDashboardPage 
                                                      onSelectRun={(run) => { setRightPanelContent(null); setSelectedRun(run); if (run) setRightPanelContent(<RunDetailsPage key={Date.now()} run={run}/>); }}
                                                      />;
  else if (selectedMenu === 'settings-page') content = <div style={{ padding: 20 }}><h2>Settings</h2><p>This is the Settings section.</p></div>;
  else if (selectedMenu === 'about-page') content = <AboutPage/>;
  else if (selectedMenu === 'users') content = 
                                                     <UsersPage 
                                                      onInviteNewUser={() => setRightPanelContent(<UserDetailsPage key={Date.now()} action="invite" availableRoles={availableRoles}/>)}
                                                      onEditUser={(user) => {if (user) { setSelectedUser(user); setRightPanelContent(<UserDetailsPage key={Date.now()} action="view" userData={user} availableRoles={availableRoles}/>);}}} //TODO julia: edit user
                                                      onSelectUser={(user) => {setRightPanelContent(null); if (user) { setSelectedUser(user); setRightPanelContent(<UserDetailsPage key={Date.now()} action="view" userData={user} availableRoles={availableRoles}/>); }}}
                                                      />;

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