import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { employeeHandlers } from './handlers/employee_handlers.js'
import { inventoryHandlers } from './handlers/inventory_handler.js'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const isDev = process.env.NODE_ENV === 'development'

const dbPath = join(app.getPath('userData'), 'database', 'app_data.db')

fs.mkdirSync(join(app.getPath('userData'), 'database'), { recursive: true })

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
      preload: join(__dirname, 'preload.js')
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

// ✅ Initialize handlers after Prisma is ready
async function initApp() {
  try {
    await prisma.$connect()
    console.log('✅ SQLite database connected at:', dbPath)

    employeeHandlers()
    inventoryHandlers()
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  } catch (error) {
    console.error('❌ Failed to initialize app:', error)
    app.quit()
  }
}

app.whenReady().then(initApp)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ✅ Gracefully disconnect Prisma on app quit
app.on('before-quit', async () => {
  await prisma.$disconnect()
})
