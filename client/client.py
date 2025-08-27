import socketio, pyautogui

from handlers.clientHandlers import ClientHandlers
from handlers.ptyHandlers import PtyHandlers
from handlers.fileExplorerHandlers import FileExplorerHandlers
from handlers.remoteDisplayHandlers import RemoteDisplayHandlers

sio = socketio.Client()
pyautogui.PAUSE = 0.01  
PORT = 3000
URL = f"http://localhost:{PORT}"
TEST_URL = [f"http://192.168.1.165:{PORT}", f"http://10.0.0.123:{PORT}"]
DEV = True

# Initialize handlers

clientHandlers = ClientHandlers(sio)
ptyHandlers = PtyHandlers(sio)
remoteDisplayHandlers = RemoteDisplayHandlers(sio)
fileExplorerHandlers = None

if (DEV):
    fileExplorerHandlers = FileExplorerHandlers(sio, TEST_URL[1])
else:
    fileExplorerHandlers = FileExplorerHandlers(sio, URL)

# Register events

clientHandlers.registerEvents()
ptyHandlers.registerEvents()
fileExplorerHandlers.registerEvents()
remoteDisplayHandlers.registerEvents()

if (DEV):
   sio.connect(TEST_URL[1])
else:
   sio.connect(URL)

sio.wait()