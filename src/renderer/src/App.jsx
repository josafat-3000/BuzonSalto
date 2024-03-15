import { useEffect, useState } from "react";
import { Routes, Route, Outlet, Link, useNavigate} from "react-router-dom";
import virtu from "./assets/virtu.jfif"
import settings from "./assets/icons8-settings.svg"
export function App() {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/seleccionar" element={<Colocar />}/>
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
    window.electron.ipcRenderer.send('getUsers',null);
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
  const [results, setResults] = useState([]);

  useEffect(() => {
    window.electron.ipcRenderer.on('results', (event, results) => {
      setResults(results);
    });
  }, []);

  const handleClick = (departamento) => {
    window.electron.ipcRenderer.send('email',departamento);
  };

  return (
    <div>
      <h2>Colocar Paquete</h2>
      <div className="containerButton">
      {results.map((elemento, index) => (
        <button key={index} className="departamento" onClick={() => handleClick(elemento)}>{elemento.departamento}</button>
      ))}</div>
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
