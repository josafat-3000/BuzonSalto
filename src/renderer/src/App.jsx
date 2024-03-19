import { useEffect, useState } from "react";
import { Routes, Route, Outlet, Link, useNavigate, useLocation} from "react-router-dom";
import virtu from "./assets/virtu.jfif"
import settings from "./assets/icons8-settings.svg"
import cerrar from "./assets/cerrar.png"
import back from "./assets/back.png"
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
  const location = useLocation();
  const navigate = useNavigate();
  const handleback = () =>{
    navigate('/')
  }
  
  // Verifica si estás en la página de inicio
  const isHomePage = location.pathname === '/';

  // Agrega una clase al navbar si estás en la página de inicio
  const navbarClass = isHomePage ? "navbar single-item" : "navbar";

  return (
    <nav className={navbarClass}>
      {location.pathname != '/' ? <button className="backBu"><img src={back} className="backIcon" onClick={handleback}/></button> : null}
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
  const navigate = useNavigate();

  useEffect(() => {
    window.electron.ipcRenderer.on('results', (event, results) => {
      setResults(results);
    });
  }, []);
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleClick = (departamento) => {
    window.electron.ipcRenderer.send('email',departamento);
    togglePopup();
    setTimeout(() => {
      navigate("/")
    }, 5000);
  };

  return (
    <div className="colocarContainer">
      <h2>Selecciona departamento</h2>
      
      <div className="containerButton">
      {results.map((elemento, index) => (
        <button key={index} className="departamento" onClick={() => handleClick(elemento)}>{elemento.departamento}</button>
      ))}</div>
       <Popup show={showPopup} handleClose={togglePopup}>
        <p>Por favor introduce tu paquete</p>
      </Popup>
    </div>
  );
}

function Retirar() {

  return (

    <div className="retirarContainer">
      
      <div className="email-form">

        <SecurityCodeForm />
      </div>
    </div>
  );
}

function Popup({ handleClose, show, children }) {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        <button className="close-button" onClick={handleClose}><img className="close"src={cerrar} alt="" /></button>
        {children}
      </section>
    </div>
  );
}
const SecurityCodeForm = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState(""); // Track popup content

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.electron.ipcRenderer.send('password', { code });

    window.electron.ipcRenderer.on('fail', (datos) => {
      setPopupContent("Contraseña incorrecta");
      togglePopup(); // Show popup for incorrect password
    });

    window.electron.ipcRenderer.on('success', (datos) => {
      setPopupContent("Por favor retira tu paquete");
      togglePopup(); // Show popup for successful password
    });
    setTimeout(() => {
      navigate("/");
    }, 5000);
  };

  return (
    <div className="security">
      <h2 >Introduce tu código de seguridad</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <input className="input" type="text" value={code} onChange={handleCodeChange} />
        </label>
        <br />
        <button className="submit-button" type="submit">Enviar</button>
      </form>

      {showPopup && <Popup show={showPopup} handleClose={togglePopup}>
        <p>{popupContent}</p>
      </Popup>}
    </div>
  );
};
