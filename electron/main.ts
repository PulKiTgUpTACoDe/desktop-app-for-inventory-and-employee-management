import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { startApiServer } from "./apiServer";
import { ipcMain } from 'electron';
import { EmployeeFormValues } from '../src/types/employee';
import prisma from '../src/lib/prisma';

const __filename = fileURLToPath(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    },
    icon: join(__dirname, '../assets/icon.png'),
    show: false
  })

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built files
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

// Register IPC handlers before app is ready
console.log("[main] registering ipcMain handlers...");

ipcMain.handle('get-employees', async () => {
  try {
    const employees = await prisma.employee.findMany();
    return { success: true, data: employees };
  } catch (error) {
    console.error('Failed to get employees:', error);
    return { success: false, error: error };
  }
});

ipcMain.handle('get-employee-by-id', async (event, id: string) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: id },
    });
    return { success: true, data: employee };
  } catch (error) {
    console.error(`Failed to get employee with ID ${id}:`, error);
    return { success: false, error: error };
  }
});

ipcMain.handle('create-employee', async (event, data: EmployeeFormValues) => {
  try {
    const adminUser = await prisma.adminUser.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      return { success: false, error: 'No admin user found' };
    }

    const newEmployee = await prisma.employee.create({
      data: {
        ...data,
        hireDate: new Date(data.hireDate),
        salary: data.salary,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
    });
    return { success: true, data: newEmployee };
  } catch (error) {
    console.error('Failed to create employee:', error);
    return { success: false, error: error };
  }
});

ipcMain.handle('update-employee', async (event, id: string, data: Partial<EmployeeFormValues>) => {
  try {
    const adminUser = await prisma.adminUser.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      return { success: false, error: 'No admin user found' };
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: id },
      data: {
        ...data,
        ...(data.hireDate && { hireDate: new Date(data.hireDate) }),
        updatedBy: adminUser.id,
      },
    });
    return { success: true, data: updatedEmployee };
  } catch (error) {
    console.error(`Failed to update employee with ID ${id}:`, error);
    return { success: false, error: error };
  }
});

ipcMain.handle('delete-employee', async (event, id: string) => {
  try {
    await prisma.employee.delete({
      where: { id: id },
    });
    return { success: true, message: 'Employee deleted successfully.' };
  } catch (error) {
    console.error(`Failed to delete employee with ID ${id}:`, error);
    return { success: false, error: error };
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  startApiServer();
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
