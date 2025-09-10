import socketio
import pyautogui
import psutil
import pystray
import threading
import os
import platform

from handlers.clientHandlers import ClientHandlers
from handlers.ptyHandlers import PtyHandlers as ConPtyHandlers 
from handlers.winElevenPtyHandlers import PtyHandlers as WinPtyHandlers 
from handlers.fileExplorerHandlers import FileExplorerHandlers
from handlers.remoteDisplayHandlers import RemoteDisplayHandlers
from handlers.taskManagerHandlers import TaskManagerHandlers
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

sio = socketio.Client()
pyautogui.PAUSE = 0.01  

PORT = int(os.getenv("PORT"))
URL = os.getenv("URL")
URL = f"{URL}:{PORT}"
DEV = os.getenv("DEV")
UDP_SERVER_IP = os.getenv("UDP_SERVER_IP")
UDP_SERVER_PORT = int(os.getenv("UDP_SERVER_PORT"))

# Tray icon

def onQuit():
    icon.stop()
    os._exit(1)

def onSubmitIssue():
    print("open issue application")

menu = pystray.Menu(
    pystray.MenuItem("Submit Issue", onSubmitIssue),
    pystray.MenuItem("Quit", onQuit)
)

icon = pystray.Icon("MyApp", Image.open("cloud.ico"), "Cloud Client | Not Connected", menu)

trayThread = threading.Thread(target=icon.run)
trayThread.daemon = True
trayThread.start()

# Register socket handlers

def getPtyHandler(sio):
    version = platform.version().split(".")
    major, _, build = map(int, version[:3])

    if major == 10 and build >= 17763 or major > 10:
        return ConPtyHandlers(sio)
    else:
        return WinPtyHandlers(sio)

clientHandlers = ClientHandlers(sio, icon)
ptyHandlers = getPtyHandler(sio)
remoteDisplayHandlers = RemoteDisplayHandlers(sio, UDP_SERVER_IP, UDP_SERVER_PORT)
fileExplorerHandlers = FileExplorerHandlers(sio, URL)
taskManagerHandlers = TaskManagerHandlers(sio)

clientHandlers.registerEvents()
ptyHandlers.registerEvents()
fileExplorerHandlers.registerEvents()
remoteDisplayHandlers.registerEvents()
taskManagerHandlers.registerEvents()

sio.connect(URL)

p = psutil.Process(os.getpid())
p.nice(psutil.HIGH_PRIORITY_CLASS) 

sio.wait()
