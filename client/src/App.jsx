import {Navigate, Route,Routes} from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'

import ProtectedRoute from './auth/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx' 
import GroupsDashboardPage from './pages/GroupsDashboardPage.jsx'
import InviteAcceptPage from './pages/InviteAcceptPage.jsx'

import GroupPage from'./pages/GroupPage.jsx'
import GroupMembersTab from './pages/GroupMembersTab.jsx'
import GroupExpensesTab from './pages/GroupExpensesTab.jsx'
import GroupBalancesTab from './pages/GroupBalancesTab.jsx'

import ProfilePage from './pages/ProfilePage.jsx'
function App() {
 

  return (
    <>
    
    <Routes>
      <Route element={<PublicLayout/>}>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/signup' element={<SignupPage/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/invite' element={<InviteAcceptPage/>}/>
      </Route>

      <Route element={<ProtectedRoute/>}>
          <Route element={<AppLayout />}>
              <Route path="/app" element={<Navigate to="/app/groups" replace />} />
              <Route path='/app/groups' element={<GroupsDashboardPage/>}/>
             
               
                {/*nested routes*/}
              <Route path='/app/groups/:groupId' element={<GroupPage/>}>
                <Route index element={<GroupMembersTab />} />
                <Route path='members' element={<GroupMembersTab/>}/>
                <Route path='expenses' element={<GroupExpensesTab/>}/>
                <Route path="balances" element={<GroupBalancesTab />}/>
              </Route>

            <Route path="/app/profile" element={<ProfilePage />} />
          </Route>
      </Route>
      
      <Route path='*' element={<Navigate to='/' replace/>}/>
    </Routes>
     
    </>
  )
}

export default App
