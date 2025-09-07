import threading
import time
import winpty

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
                    self.sio.emit("ptyData", {"data": data.decode('utf-8', errors='ignore')})
                else:
                    time.sleep(0.025)
            except Exception as ex:
                print("Reader stopped:", ex)
                break

    def connectPty(self, data):
        cols, rows = 80, 30
        self.ptyActive = True
        self.pty = winpty.PtyProcess.spawn("cmd.exe", dimensions=(cols, rows))

        parentDir = data.get("parentDirectory")
        if parentDir:
            cmd = f'cd /d "{parentDir}" && cls\r\n'
            self.pty.write(cmd.encode('utf-8'))

        self.ptyReaderThread = threading.Thread(target=self.readFromPty, daemon=True)
        self.ptyReaderThread.start()

    def ptyStop(self):
        if not self.ptyActive:
            return {"error": "pty isn't running on client"}

        self.ptyActive = False

        try:
            if self.pty:
                self.pty.terminate()
            if self.ptyReaderThread:
                self.ptyReaderThread.join()
        except Exception as ex:
            print(ex)
            return {"error": str(ex)}

        self.pty = None
        return {"success": "pty stopped"}

    def ptyInput(self, data):
        if self.pty:
            try:
                self.pty.write(data['input'].encode('utf-8'))
            except Exception as ex:
                print("Error writing to pty:", ex)
