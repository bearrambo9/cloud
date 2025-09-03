import threading
import winpty
import signal
import time

class PtyHandlers:
    def __init__(self, socketClient):
        self.sio = socketClient
        self.pty = None
        self.ptyReaderThread = None
        self.ptyActive = False
    
    def registerEvents(self):
        self.sio.on('connectPty')(self.connectPty)
        self.sio.on('ptyStop')(self.ptyStop)
        self.sio.on('ptyInput')(self.ptyInput)
    
    def readFromPty(self):
        while self.ptyActive:
            try:
                data = self.pty.read(1024)
                
                if data:
                    self.sio.emit("ptyData", {"data": data})
                else:
                    time.sleep(0.025)
            except Exception as ex:
                print("Reader stopped:", ex)
                break
    
    def connectPty(self, data):
        cols, rows = 80, 30
        
        self.ptyActive = True
        self.pty = winpty.PtyProcess.spawn("cmd.exe", dimensions=(rows, cols))

        if (data['parentDirectory']):   
            self.pty.write(f'cd /d "{data['parentDirectory']}" && cls \r\n')
        
        self.ptyReaderThread = threading.Thread(target=self.readFromPty, daemon=True)
        self.ptyReaderThread.start()
    
    def ptyStop(self):
        if not self.ptyActive:
            return {"error": "pty isn't running on client"}
        
        self.ptyActive = False
        
        try:
            self.pty.kill(signal.SIGTERM)
            self.ptyReaderThread.join()
        except Exception as ex:
            print(ex)
            return {"error": ex}
        
        self.pty = None
        return {"success": "pty stopped"}
    
    def ptyInput(self, data):
        if self.pty:
            try:
                self.pty.write(data['input'])
            except Exception as ex:
                print("Error writing to pty:", ex)