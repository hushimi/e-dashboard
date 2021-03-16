const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const os = require('os');
const pty = require('node-pty');
const path = require('path');
const glob = require('glob');

// detect --debug option
const debug = /--debug/.test(process.argv[2]);

let shellName = os.platform() === 'win32' ? 'powershell': 'bash';
global.shareObj = {
    shellName: shellName
}

mainWindow = null;

function initialize () {
    console.log(path.join(__dirname, 'preload.js'))
    makeSingleInstance();

    // Closure function
    function createWindow () {
        const windowOptions = {
            width: 1080,
            minWidth: 680,
            height: 840,
            title: app.getName(),
            webPreferences: {
                // preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true
            }
        };

        // load index.html
        mainWindow = new BrowserWindow(windowOptions);
        mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

        // open dev tool when debug mode
        if (debug) {
            mainWindow.webContents.openDevTools()
            mainWindow.maximize()
        }

        mainWindow.on('closed', () => {
            mainWindow = null;
        });


        // --------------------------------------------
        // handle xterm's I/O
        // --------------------------------------------
        let ptyProcess = pty.spawn(shellName, [], {
            name: 'xterm-color',
            cols: 100,
            rows: 1000,
            cwd: process.env.HOME,
            env: process.env,
        });

        ipcMain.on('terminal.toTerm', function(event, data) {
            ptyProcess.write(data);
        });

        ptyProcess.onData((data) => {
            mainWindow.webContents.send('terminal.incData', data);
        });
    }

    // --------------------------------------------
    // Handle window event
    // --------------------------------------------
    app.on('ready', () => {
        createWindow();
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });


}


/**
 * ------------------------------------------------
 * make this app a single instance app
 * prevent another instance launch
 *
 * @return void
 * ------------------------------------------------
 */
function makeSingleInstance () {
    // check if environment is mac
    if (process.mas) {
        return;
    }

    app.requestSingleInstanceLock();
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    })
}

initialize();
