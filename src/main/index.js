import { app, shell, BrowserWindow,  ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import qr from 'qrcode';
import icon from '../../resources/icon.png?asset'
import nodemailer from "nodemailer"

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
  user: 'virtu.netmail@gmail.com',
  pass: 'ohzvnwqlcqhftavw'
  }
});

function codigo() {
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += Math.floor(Math.random() * 10);
  }
  return codigo;
}
function verificarEstado(connection, id_user, password) {
  connection.query("SELECT id FROM locker WHERE state = false", (error, results, fields) => {
    if (error) {
      console.error("Error al ejecutar la consulta:", error);
      return;
    }
    if (results.length > 0) {
      let lockersDisponibles = results.map((result) => result.id);
      let numeroAleatorio = Math.floor(Math.random() * lockersDisponibles.length);
      let idLockerSeleccionado = lockersDisponibles[numeroAleatorio];

      // Actualizar el estado, la contraseña y el usuario asociado en una sola consulta
      connection.query("UPDATE locker SET state = true, password = ?, id_user = ? WHERE id = ?", [password, id_user, idLockerSeleccionado], (error2, results2, fields2) => {
        if (error2) {
          console.error("Error al actualizar el estado del locker:", error2);
          return;
        }
        console.log("Locker seleccionado:", idLockerSeleccionado);
      });
    } else {
      console.log("No hay lockers disponibles.");
    }
  });
}


const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost', // Cambia esto si tu servidor MySQL está en otro lugar
  user: 'root',
  password: 'root',
  database: 'buzonusuarios'
});
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos MySQL');});

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    
    show: false,
    fullscreen: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),

      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')) 
  }
  ipcMain.on('getUsers',(s)=>{
    
      // Ejemplo de consulta a la base de datos
      connection.query('SELECT * FROM usuario', (error, results, fields) => {
        if (error) {
          console.error('Error al realizar la consulta:', error);
          return;
        }
        console.log('Resultados de la consulta:', results);
        mainWindow.webContents.send('results',results)
      });
      
  })

  ipcMain.on('email', (event, datos) => {
   
    console.log('Datos recibidos en el proceso principal:', datos);
    console.log(datos.correo)
    let password = codigo();
    const options = {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 1,
      margin: 1,
      color: {
        dark: '#000',
        light: '#fff'
      }
    };
    
    qr.toFile('codigo_qr.png', password, options, function (err) {
      if (err) throw err;
      console.log('Código QR generado correctamente.');
    });
    
    let message = {
      from: "josafat30000@gmail.com",
      to: datos.correo,
      subject: "Código de seguridad",
      html: `<h1 style="color: #333; font-size: 16px;">Código de seguridad</h1>
      <p style="color: #555; font-size: 14px;">Tu contraseña es: </p>
      <p style="color: #007BFF; font-size: 18px;foo"><b>${password}</b></p>`,
      attachments: [{
        filename: 'codigo_qr.png',
        path: './codigo_qr.png', // Reemplaza esto con la ruta de tu imagen
        cid: 'imagenAdjunta' // Id para hacer referencia a la imagen en el cuerpo del correo electrónico
      }]
    };
    transporter.sendMail(message, (error, info) => {
      if (error) {
          console.log("Error enviando email")
          console.log(error.message)
      } else {
          console.log("Email enviado")
      }
    });
    verificarEstado(connection,datos.id,password);
 });
 ipcMain.on('password', (event, datos) => {
  console.log(datos.code);
  
  // Consulta SQL para buscar el código en la base de datos
  const sql = 'SELECT * FROM locker WHERE password = ?';
  
  // Ejecutar la consulta SQL
  connection.query(sql, [datos.code], (error, results, fields) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      return;
    }

    // Si se encontró un locker con la contraseña especificada
    if (results.length > 0) {
      const locker = results[0];
      if(locker.state == true) {
        
      }
      // Liberar el estado del locker, el ID del usuario y la contraseña a NULL
      const updateSql = 'UPDATE locker SET state = ?, id_user = NULL, password = NULL WHERE id = ?';
      connection.query(updateSql, [false, locker.id], (updateError, updateResults, updateFields) => {
        if (updateError) {
          console.error('Error al actualizar el locker:', updateError);
          return;
        }
        mainWindow.webContents.send('success', null);
        console.log('Locker liberado:', locker.id);
      });
    } else {
      mainWindow.webContents.send('fail', null);
      console.log('fail');
    }
  });
});

ipcMain.on('login',(event,datos)=>{
  console.log(datos)
  const sql = 'SELECT * FROM administrador WHERE correo = ? AND password = ?';
  
  // Ejecutar la consulta SQL
  connection.query(sql, [datos.username, datos.password], (error, results, fields) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      return;
    }
    // Si se encontró un locker con la contraseña especificada
    if (results.length > 0) {
      mainWindow.webContents.send('authSuccess', null);
    } else {
      mainWindow.webContents.send('authFail', null);
    }
  });
});
ipcMain.on('alta',(event,datos)=>{
  console.log(datos)
  const sql = 'INSERT INTO usuario(correo,departamento) values (?,?)';
  
  // Ejecutar la consulta SQL
  connection.query(sql, [datos.username, datos.password], (error, results, fields) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      mainWindow.webContents.send('registerFail', null);
      return;
    }else{
      console.log('success')
      mainWindow.webContents.send('registerSuccess', null);
    }
  });
});

}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  connection.end();
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
