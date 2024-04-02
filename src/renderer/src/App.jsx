import { useEffect, useState,useRef } from 'react';
import { Routes, Route, Outlet, Link, useNavigate, useLocation} from "react-router-dom";

import virtu from "./assets/virtu.jfif"
import settings from "./assets/icons8-settings.svg"
import cerrar from "./assets/cerrar.png"
import back from "./assets/back.png"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace, faCircleArrowLeft, faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/seleccionar" element={<Colocar />}/>
          <Route path="/email" element={<Colocar />} />
          <Route path="/retirar" element={<Retirar />} />
          <Route path="/settings" element={<Settings />} />
         <Route path="/protected" element={<ProtectedPage />}/>
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
  const handleSettings = () =>{
    navigate('/settings')
  }
  
  // Verifica si estás en la página de inicio
  const isHomePage = location.pathname === '/';

  // Agrega una clase al navbar si estás en la página de inicio
  const navbarClass = isHomePage ? "navbar single-item" : "navbar";

  return (
    <nav className={navbarClass}>
      {location.pathname != '/' ? <button className="backBu"><img src={back} className="backIcon" onClick={handleback}/></button> : null}
      {location.pathname == '/' ? <button className="settings-button"><img src={settings} className="settings-icon" onClick={handleSettings}/></button> : null}
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
  const [popupContent, setPopupContent] = useState("");

  const handleKeyPress = (char) => {
    setCode(prevValue => prevValue + char);
  };

  const handleBackspace = () => {
    setCode(prevValue => prevValue.slice(0, -1));
  };


  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.electron.ipcRenderer.send('password', { code });
  };
  window.electron.ipcRenderer.on('fail', (datos) => {
    setPopupContent("Contraseña incorrecta");
    togglePopup();
    setTimeout(() => {
      navigate('/')
    }, 1000);
  });

  window.electron.ipcRenderer.on('success', (datos) => {
    setPopupContent("Por favor retira tu paquete");
    togglePopup(); // Show popup for successful password
    setTimeout(() => {
      navigate("/");
    }, 5000);
  });

  return (
    <div className="security">
      <h2>Introduce tu código de seguridad o escanea tu código QR</h2>

      <form onSubmit={handleSubmit}>
        <label>
          <input autoFocus className="input" type="text" value={code} onChange={handleCodeChange} />
        </label>
        <br />
        <div className="virtual-keyboard">
          <div className="row">
            <div className="key" onClick={() => handleKeyPress('1')}>1</div>
            <div className="key" onClick={() => handleKeyPress('2')}>2</div>
            <div className="key" onClick={() => handleKeyPress('3')}>3</div>
            
          </div>
          <div className="row">
            <div className="key" onClick={() => handleKeyPress('4')}>4</div>
            <div className="key" onClick={() => handleKeyPress('5')}>5</div>
            <div className="key" onClick={() => handleKeyPress('6')}>6</div>
          </div>
          <div className="row">
            <div className="key" onClick={() => handleKeyPress('7')}>7</div>
            <div className="key" onClick={() => handleKeyPress('8')}>8</div>
            <div className="key" onClick={() => handleKeyPress('9')}>9</div>
          </div>
          <div className="row">
          <div className="key backspace" onClick={() => handleBackspace()}><FontAwesomeIcon  icon={faBackspace}/></div>
            <div className="key" onClick={() => handleKeyPress('0')}>0</div>
            <button className="key enviar submit-button" type="submit"><FontAwesomeIcon icon={faCircleArrowRight}/></button>
          </div>
        </div>
        </form>
       
      

      {showPopup && <Popup show={showPopup} handleClose={togglePopup}>
        <p>{popupContent}</p>
      </Popup>}
    </div>
  );
};

const Settings = ()=>{
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  // Refs para los inputs
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Función para manejar el cambio de foco
  const handleFocusChange = (input) => {
    setFocusedInput(input);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (username && password) {
        window.electron.ipcRenderer.send('login',{username,password});
      } else {
        throw new Error("Por favor ingresa un nombre de usuario y contraseña");
      }
    } catch (error) {
      setPopupContent(error.message);
      togglePopup();
    }
  };

  // Función para manejar la escritura en los inputs del componente Settings
  const handleInputKeyPress = (value) => {
    // Verificar qué input está enfocado y actualizar su valor
    console.log(value);
    if (focusedInput === 'username') {
      setUsername(prevValue => { 
        if (value == 'backspace' || value == 'BACKSPACE') {
          return prevValue.slice(0, -1); // Eliminar último carácter
        } else if (value === 'space'|| value == 'SPACE') {
          return prevValue + ' '; // Añadir un espacio
        } else if (value === 'return'|| value == 'RETURN') {
          handleSubmit();
          return prevValue; // No modificar el valor si se presiona "return"
        } else {
          return prevValue + value; // Añadir el carácter al final del valor actual
        }
      });
    } else if (focusedInput === 'password') {
      setPassword(prevValue => {
        if (value == 'backspace' || value == 'BACKSPACE') {
          return prevValue.slice(0, -1); // Eliminar último carácter
        } else if (value === 'space'|| value == 'SPACE') {
          return prevValue + ' '; // Añadir un espacio
        } else if (value === 'return'|| value == 'RETURN') {
          handleSubmit();
          return prevValue; // No modificar el valor si se presiona "return"
        } else {
          return prevValue + value; // Añadir el carácter al final del valor actual
        }
      });
      
    }
};
window.electron.ipcRenderer.on('authFail', (datos) => {
  setPopupContent("Contraseña incorrecta");
  togglePopup();
  setTimeout(() => {
    navigate('/')
  }, 1000);
});
window.electron.ipcRenderer.on('authSuccess', (datos) => {
    navigate('/protected')
});
  return (
    <div className="login">
      <h2>Iniciar Sesión</h2>
      <form className='form'onSubmit={handleSubmit}>
        <label>
          Username:
          <input
          className="inputLogin"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            onFocus={() => handleFocusChange('username')}
            ref={usernameInputRef}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            className="inputLogin"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => handleFocusChange('password')}
            ref={passwordInputRef}
          />
        </label>
        <br />
        <button className="send" type="submit">Iniciar Sesión</button>
      </form>
      {showPopup && <Popup show={showPopup} handleClose={togglePopup}>
        <p>{popupContent}</p>
      </Popup>}
      {/* Pasar la función handleInputKeyPress al componente Keyboard */}
      <Keyboard onKeyPress={handleInputKeyPress} />
    </div>
  );
};

const Keyboard = ({ onKeyPress }) => {
  const [shiftEnabled, setShiftEnabled] = useState(false); // Estado para alternar entre mayúsculas y minúsculas
  const [symbolEnabled, setSymbolEnabled] = useState(false); // Estado para alternar entre letras y símbolos

  // Define los caracteres para cada fila del teclado
  const qwertyRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
    ['symbols', 'space', 'return']
  ];

  // Define los caracteres especiales
  const specialCharacters = [
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
    ['-', '_', '+', '=', '{', '}', '[', ']', '|', '\\'],
    [':', ';', '"', '\'', '<', '>', '/', '?', ',', '.'],
    ['symbols']
  ];

  // Función para manejar el evento de clic en una tecla
  const handleKeyPress = (char) => {
    if (char === 'shift') {
      setShiftEnabled(!shiftEnabled);
    } else if (char === 'symbols') {
      setSymbolEnabled(!symbolEnabled);
    } else {
      shiftEnabled?onKeyPress(char.toUpperCase()):onKeyPress(char); // Añadir el carácter al final del valor actual
    }
  };

  // Renderiza las filas del teclado
  const renderKeyboardRows = () => {
    if (symbolEnabled) {
      return specialCharacters.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((key, keyIndex) => (
            <div className="key-" key={keyIndex} onClick={() => handleKeyPress(key)}>
              {renderKeyLabel(key)}
            </div>
          ))}
        </div>
      ));
    } else {
      return qwertyRows.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((key, keyIndex) => (
            <div className="key-" key={keyIndex} onClick={() => handleKeyPress(key)}>
              {renderKeyLabel(key)}
            </div>
          ))}
        </div>
      ));
    }
  };

  // Función para renderizar la etiqueta de la tecla
  const renderKeyLabel = (key) => {
    switch (key) {
      case 'shift':
        return shiftEnabled ? '⇧' : '⇩';
      case 'symbols':
        return symbolEnabled ? 'ABC' : '#+=';
      case 'backspace':
        return '⌫';
      case 'space':
        return 'Space';
      case 'return':
        return '↵';
      default:
        return shiftEnabled ? key.toUpperCase() : key.toLowerCase();
    }
  };

  return (
    <div className="keyboard">
      {renderKeyboardRows()}
    </div>
  );
};

const ProtectedPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  // Refs para los inputs
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Función para manejar el cambio de foco
  const handleFocusChange = (input) => {
    setFocusedInput(input);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (username && password) {
        window.electron.ipcRenderer.send('alta',{username,password});
      } else {
        throw new Error("Por favor ingresa un nombre de usuario y contraseña");
      }
    } catch (error) {
      setPopupContent(error.message);
      togglePopup();
    }
  };

  // Función para manejar la escritura en los inputs del componente Settings
  const handleInputKeyPress = (value) => {
    // Verificar qué input está enfocado y actualizar su valor
    console.log(value);
    if (focusedInput === 'username') {
      setUsername(prevValue => { 
        if (value == 'backspace' || value == 'BACKSPACE') {
          return prevValue.slice(0, -1); // Eliminar último carácter
        } else if (value === 'space'|| value == 'SPACE') {
          return prevValue + ' '; // Añadir un espacio
        } else if (value === 'return'|| value == 'RETURN') {
          handleSubmit();
          return prevValue; // No modificar el valor si se presiona "return"
        } else {
          return prevValue + value; // Añadir el carácter al final del valor actual
        }
      });
    } else if (focusedInput === 'password') {
      setPassword(prevValue => {
        if (value == 'backspace' || value == 'BACKSPACE') {
          return prevValue.slice(0, -1); // Eliminar último carácter
        } else if (value === 'space'|| value == 'SPACE') {
          return prevValue + ' '; // Añadir un espacio
        } else if (value === 'return'|| value == 'RETURN') {
          handleSubmit();
          return prevValue; // No modificar el valor si se presiona "return"
        } else {
          return prevValue + value; // Añadir el carácter al final del valor actual
        }
      });
      
    }
};
window.electron.ipcRenderer.on('registerFail', (datos) => {
  setPopupContent("Contraseña incorrecta");
  togglePopup();
  setTimeout(() => {
    navigate('/')
  }, 1000);
});
window.electron.ipcRenderer.on('registerSuccess', (datos) => {
  setPopupContent("Usuario registrado correctamente");
  togglePopup();
  setTimeout(() => {
    
  }, 2000);
});
  return (
    <div className="login">
      <h2>Registrar usuario</h2>
      <form className='form'onSubmit={handleSubmit}>
        <label>
          Correo:
          <input
          className="inputLogin"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            onFocus={() => handleFocusChange('username')}
            ref={usernameInputRef}
          />
        </label>
        <br />
        <label>
          Departamento:
          <input
            className="in"
            type="text"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => handleFocusChange('password')}
            ref={passwordInputRef}
          />
        </label>
        <br />
        <button className="send" type="submit">Registar</button>
      </form>
      {showPopup && <Popup show={showPopup} handleClose={togglePopup}>
        <p>{popupContent}</p>
      </Popup>}
      {/* Pasar la función handleInputKeyPress al componente Keyboard */}
      <Keyboard onKeyPress={handleInputKeyPress} />
    </div>
  );
};