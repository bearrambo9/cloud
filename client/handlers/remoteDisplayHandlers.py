import threading
import pyautogui
import mss
import io
from PIL import Image
import base64
import time

class RemoteDisplayHandlers:
    def __init__(self, socketClient):
        self.sio = socketClient
        self.remoteDisplayThread = None
        self.remoteDisplayActive = False
        self.screenWidth, self.screenHeight = pyautogui.size()
    
    def registerEvents(self):
        self.sio.on('startRemoteDisplay')(self.startRemoteDisplay)
        self.sio.on('stopRemoteDisplay')(self.stopRemoteDisplay)
        self.sio.on('mouseMove')(self.mouseMove)
        self.sio.on('mouseClick')(self.mouseClick)
        self.sio.on('keyPress')(self.keyPress)
    
    def captureDesktopScreenshot(self):
        try:
            with mss.mss() as sct:
                screenshot = sct.grab(sct.monitors[1])
                
                img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
                
                new_width = img.width // 2
                new_height = img.height // 2
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                buffer = io.BytesIO()
                img.save(buffer, format="JPEG", quality=60, optimize=True)
                
                encoded = base64.b64encode(buffer.getvalue()).decode()
                return encoded
        except: 
            pass
    
    def remoteDisplay(self):
        while self.remoteDisplayActive:
            try:
                self.sio.emit("displayData", {"displayData": self.captureDesktopScreenshot()})
                time.sleep(0.06)
            except Exception as ex:
                print("Reader stopped:", ex)
                break
    
    def startRemoteDisplay(self):
        self.remoteDisplayActive = True
        self.remoteDisplayThread = threading.Thread(target=self.remoteDisplay, daemon=True)
        self.remoteDisplayThread.start()
    
    def stopRemoteDisplay(self):
        self.remoteDisplayActive = False
        self.remoteDisplayThread.join(timeout=5.0)
    
    def mouseMove(self, data):
        try:
            x = int(data['mouseInfo']['x'] * self.screenWidth)
            y = int(data['mouseInfo']['y'] * self.screenHeight)
            
            x = max(0, min(x, self.screenWidth - 1))
            y = max(0, min(y, self.screenHeight - 1))
            
            pyautogui.moveTo(x, y)
        except:
            pass
    
    def mouseClick(self, data):
        try:
            x = int(data['mouseInfo']['x'] * self.screenWidth)
            y = int(data['mouseInfo']['y'] * self.screenHeight)

            x = max(0, min(x, self.screenWidth - 1))
            y = max(0, min(y, self.screenHeight - 1))
            
            if data['mouseInfo']['button'] == 0: 
                pyautogui.click(x, y)
            elif data['mouseInfo']['button'] == 2: 
                pyautogui.rightClick(x, y)
        except:
            pass
    
    def keyPress(self, data):
        try:
            pyautogui.press(data['key'].lower())
        except:
            try:
                pyautogui.typewrite(data['key'])
            except:
                pass