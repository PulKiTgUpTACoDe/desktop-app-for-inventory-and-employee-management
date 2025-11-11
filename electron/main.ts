import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { employeeHandlers } from './handlers/employee_handlers.js'
import { inventoryHandlers } from './handlers/inventory_handler.js'
import { supplierHandlers } from './handlers/supplier_handler.js'
import { vendorHandlers } from './handlers/vendor_handler.js'
import { purchaseOrderHandlers } from './handlers/purchaseOrder_handler.js'
import { salesOrderHandlers } from './handlers/salesOrder_handler.js'
import { payrollHandlers } from './handlers/payroll_handler.js'
import { invoiceHandlers } from './handlers/invoice_handler.js'
import { paymentHandlers } from './handlers/payment_handler.js'
import { reportHandlers } from './handlers/reportHandlers.js'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import Store from 'electron-store'

const __filename = fileURLToPath(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const isDev = process.env.NODE_ENV === 'development'

const dbPath = isDev
  ? join(app.getPath('userData'), 'database', 'app_data.db')
  : join(process.resourcesPath, 'prisma', 'dev.db')

fs.mkdirSync(join(app.getPath('userData'), 'database'), { recursive: true })

const store = new Store<{ isLoggedIn: boolean }>({
  defaults: { isLoggedIn: false },
})

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
})

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
      sandbox: true
    },
    icon: join(__dirname, '../assets/icon.png'),
    show: false
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

ipcMain.handle('get-login-state', () => {
  return store.get('isLoggedIn', false)
})

ipcMain.on('user-login', () => {
  store.set('isLoggedIn', true)
})

ipcMain.on('user-logout', () => {
  store.set('isLoggedIn', false)
})

async function initApp() {
  try {
    await prisma.$connect()
    console.log('✅ SQLite database connected at:', dbPath)

    employeeHandlers()
    inventoryHandlers()
    supplierHandlers()
    vendorHandlers()
    purchaseOrderHandlers()
    salesOrderHandlers()
    payrollHandlers()
    invoiceHandlers()
    paymentHandlers()
    reportHandlers() 

    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  } catch (error) {
    console.error('❌ Error initializing app:', error)
    app.quit()
  }
}

app.whenReady().then(initApp)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  store.set('isLoggedIn', false)
  await prisma.$disconnect()
})
