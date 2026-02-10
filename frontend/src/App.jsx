import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import InventoryPage from './pages/InventoryPage'
import BuyPage from './pages/BuyPage'
import './App.css'

function Layout({ children }) {
  return (
    <div className="app">
      <header className="header">
        <h1>Inventory Management</h1>
        <nav className="nav">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            end
          >
            Inventory
          </NavLink>
          <NavLink
            to="/buy"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Buy
          </NavLink>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <InventoryPage />
            </Layout>
          }
        />
        <Route
          path="/buy"
          element={
            <Layout>
              <BuyPage />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
