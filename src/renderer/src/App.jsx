import { Routes, Route, Outlet, Link, useNavigate} from "react-router-dom";
import virtu from "./assets/virtu.jfif"
import settings from "./assets/icons8-settings.svg"
export function App() {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/seleccionar" />
          <Route path="/email" element={<Colocar />} />
          <Route path="/retirar" element={<Retirar />} />
        </Route>
      </Routes>
    </div>
  );
}

function Layout() {
  return (
    <div>
      <NavBar /> {/* Mostrar NavBar en todas las páginas */}
      <Outlet />
    </div>
  );
}

function NavBar() {
  const handleSettingsClick = () =>{
    console.log("boton")
  }
  return (
    <nav className="navbar">
      <button onClick={handleSettingsClick} className="settings-button">
        <img src={settings} alt="Settings" className="settings-icon" />
      </button>
      <img src={virtu} alt="Logo" className="navbar-logo" />
    </nav>
  );
}


function Home() {
  const navigate = useNavigate();

  const handleColocar = ()=>{
    navigate('/seleccionar');
  }
  const handleRecoger = ()=>{
    navigate('/retirar');
  }
  return (
    <div className="container">
      <button className="colocar" onClick={handleColocar}>
        Dejar paquete
      </button>
      <button className="recoger" onClick={handleRecoger}>
        Recoger paquete
      </button>
    </div>
  );
}

function Colocar() {
  return (
    <div className="body">
      <h2>Colocar Paquete</h2>
    </div>
  );
}

function Retirar() {
  return (
    <div className="body">
      <h2>Retirar paquete</h2>
    </div>
  );
}