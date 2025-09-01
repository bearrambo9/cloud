import socketio, pyautogui, psutil, os

from handlers.clientHandlers import ClientHandlers
from handlers.ptyHandlers import PtyHandlers
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

# Initialize handlers

clientHandlers = ClientHandlers(sio)
ptyHandlers = PtyHandlers(sio)
remoteDisplayHandlers = RemoteDisplayHandlers(sio, UDP_SERVER_IP, UDP_SERVER_PORT)
fileExplorerHandlers = FileExplorerHandlers(sio, URL)
taskManagerHandlers = TaskManagerHandlers(sio)

# Register events

clientHandlers.registerEvents()
ptyHandlers.registerEvents()
fileExplorerHandlers.registerEvents()
remoteDisplayHandlers.registerEvents()
taskManagerHandlers.registerEvents()


sio.connect(URL)

p = psutil.Process(os.getpid())
p.nice(psutil.HIGH_PRIORITY_CLASS) 
sio.wait()