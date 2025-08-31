import threading
import pyautogui
import numpy as np
import struct
import socket
import cv2
import time
import win32gui
import win32ui
import win32con

class RemoteDisplayHandlers:
    def __init__(self, socketClient, udpServerIp, udpServerPort):
        self.sio = socketClient
        self.remoteDisplayActive = False
        self.remoteDisplayThread = None
        self.screenWidth, self.screenHeight = pyautogui.size()

        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.udpServerAddr = (udpServerIp, udpServerPort)
        self.frameId = 0
    
    def registerEvents(self):
        self.sio.on('startRemoteDisplay')(self.startRemoteDisplay)
        self.sio.on('stopRemoteDisplay')(self.stopRemoteDisplay)
        self.sio.on('mouseMove')(self.mouseMove)
        self.sio.on('mouseClick')(self.mouseClick)
        self.sio.on('keyPress')(self.keyPress)
    
    def fastCaptureScreen(self):
        hwnd = win32gui.GetDesktopWindow()
        hdc = win32gui.GetWindowDC(hwnd)
        hcdc = win32ui.CreateDCFromHandle(hdc)
        hmdc = hcdc.CreateCompatibleDC()
        
        hbmp = win32ui.CreateBitmap()
        hbmp.CreateCompatibleBitmap(hcdc, self.screenWidth, self.screenHeight)
        hmdc.SelectObject(hbmp)
        
        hmdc.BitBlt((0, 0), (self.screenWidth, self.screenHeight), hcdc, (0, 0), win32con.SRCCOPY)
        
        bmpstr = hbmp.GetBitmapBits(True)
        img = np.frombuffer(bmpstr, dtype='uint8')
        img = img.reshape((self.screenHeight, self.screenWidth, 4))
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2RGB)
        
        win32gui.DeleteObject(hbmp.GetHandle())
        hmdc.DeleteDC()
        hcdc.DeleteDC()
        win32gui.ReleaseDC(hwnd, hdc)
        
        return img
    
    def remoteDisplay(self):
        while self.remoteDisplayActive:
            try:
                img = self.fastCaptureScreen()
                img = cv2.resize(img, (960, 540)) 
                
                encodeParam = [int(cv2.IMWRITE_JPEG_QUALITY), 40]
                _, buffer = cv2.imencode('.jpg', img, encodeParam)
                
                timestamp = int(time.time() * 1000)
                clientIdBytes = (self.clientId + '|').encode('utf-8')
                header = struct.pack('!IQ', self.frameId, timestamp) + clientIdBytes
                packet = header + buffer.tobytes()
                
                try:
                    self.sock.sendto(packet, self.udpServerAddr)
                except Exception as ex:
                    print(f"UDP send error: {ex}")
                
                self.frameId += 1
                time.sleep(1/60)
            except Exception as ex:
                print(f"Remote display error: {ex}")
                break
    
    def startRemoteDisplay(self, data):
        self.clientId = data['clientId']
        self.remoteDisplayActive = True
        self.remoteDisplayThread = threading.Thread(target=self.remoteDisplay, daemon=True)
        self.remoteDisplayThread.start()
    
    def stopRemoteDisplay(self):
        self.remoteDisplayActive = False
        if self.remoteDisplayThread:
            self.remoteDisplayThread.join()
            self.remoteDisplayThread = None
    
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