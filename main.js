const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const url = require("url");
const process = require("process");
const { execSync, spawn } = require("child_process");
const fs = require("fs");

const server = path.join(__dirname, "api");
const client = path.join(__dirname, "client");
const serverPath = path.join(__dirname, "api", "index.js");

function isCommandAvailable(command) {
  try {
    execSync(`${command} --version`);
    return true;
  } catch (error) {
    return false;
  }
}

function startServer() {
  try {
    const serverProcess = spawn("node", [serverPath], {
      cwd: server,
      stdio: "inherit",
    });
  
    serverProcess.on("close", (code) => {
      if (code !== 0) {
        dialog.showErrorBox("Error", "Express server exited with an error.");
      }
    });
  } catch (error) {
    console.error("Error spawning child process:", error);
  }
}

function createMainWindow() {
  if (!isCommandAvailable("node")) {
    const response = dialog.showMessageBoxSync({
      type: "question",
      buttons: ["Install Node.js", "Cancel"],
      message: "Node.js is required. Install now?",
    });

    if (response === 0) {
      execSync(path.join(__dirname, "installers", "node-v18.17.1-x64"), {
        stdio: "inherit",
      });
    } else {
      app.quit();
    }
  }

  if (!fs.existsSync(path.join(server, "node_modules"))) {
    try {
      execSync("npm install", { cwd: server, stdio: "inherit" });
    } catch (error) {
      dialog.showErrorBox("Error", "Failed to install project dependencies.");
      app.quit();
    }
  }

  if (!fs.existsSync(path.join(client, "node_modules"))) {
    try {
      execSync("npm install", { cwd: client, stdio: "inherit" });
    } catch (error) {
      dialog.showErrorBox("Error", "Failed to install project dependencies.");
      app.quit();
    }
  }

  startServer();

  console.log(
    "____________________________________________________________________________________________"
  );

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    title: "MERN APP",
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.webContents.openDevTools();

  const indexPath = path.join(__dirname, "client", "build", "index.html");

  mainWindow.loadURL(
    url.format({
      protocol: "file:",
      pathname: indexPath,
      slashes: true,
    })
  );
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
      app.quit()
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
  }
});