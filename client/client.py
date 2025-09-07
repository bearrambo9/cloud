import socketio
import pyautogui
import psutil
import os
import platform

from handlers.clientHandlers import ClientHandlers
from handlers.ptyHandlers import PtyHandlers as ConPtyHandlers 
from handlers.winElevenPtyHandlers import PtyHandlers as WinPtyHandlers 
from handlers.fileExplorerHandlers import FileExplorerHandlers
from handlers.remoteDisplayHandlers import RemoteDisplayHandlers
from handlers.taskManagerHandlers import TaskManagerHandlers
from dotenv import load_dotenv

load_dotenv()

sio = socketio.Client()
pyautogui.PAUSE = 0.01  

PORT = int(os.getenv("PORT"))
URL = os.getenv("URL")
URL = f"{URL}:{PORT}"
DEV = os.getenv("DEV")
UDP_SERVER_IP = os.getenv("UDP_SERVER_IP")
UDP_SERVER_PORT = int(os.getenv("UDP_SERVER_PORT"))

def getPtyHandler(sio):
    version = platform.version().split(".")
    major, _, build = map(int, version[:3])

    if major == 10 and build >= 17763 or major > 10:
        return ConPtyHandlers(sio)
    else:
        return WinPtyHandlers(sio)

clientHandlers = ClientHandlers(sio)
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
