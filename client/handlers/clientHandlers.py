from utils.systemUtils import getSystemInfo, updateUserId

class ClientHandlers:
    def __init__(self, socketClient, icon):
        self.sio = socketClient
        self.icon = icon
    
    def registerEvents(self):
        self.sio.on('connect')(self.connect)
        self.sio.on('disconnect')(self.disconnect)
    
    def sendClientData(self):
        systemInfo = getSystemInfo()
        self.sio.emit('clientConnection', systemInfo, callback=updateUserId)
    
    def connect(self):
        self.sendClientData()
        self.icon.title = "Cloud Client | Connected"
    
    def disconnect(self):
        print('socket disconnected from server')