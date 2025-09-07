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
import win32api

class RemoteDisplayHandlers:
   def __init__(self, socketClient, udpServerIp, udpServerPort):
       self.sio = socketClient
       self.remoteDisplayActive = False
       self.remoteDisplayThread = None
       self.screenWidth, self.screenHeight = pyautogui.size()
       self.currentDisplay = 0

       self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
       self.udpServerAddr = (udpServerIp, udpServerPort)
       self.frameId = 0
   
   def registerEvents(self):
       self.sio.on('startRemoteDisplay')(self.startRemoteDisplay)
       self.sio.on('stopRemoteDisplay')(self.stopRemoteDisplay)
       self.sio.on('mouseMove')(self.mouseMove)
       self.sio.on('mouseClick')(self.mouseClick)
       self.sio.on('keyPress')(self.keyPress)
       self.sio.on('getDisplays')(self.getDisplays)
       self.sio.on('changeDisplay')(self.changeDisplay)
   
   def getDisplays(self, data):
       displays = []
       try:
           import win32api
           monitors = win32api.EnumDisplayMonitors()
           for i, monitor in enumerate(monitors):
               handle, device, rect = monitor
               width = rect[2] - rect[0]
               height = rect[3] - rect[1]
               displays.append(f"Display {i + 1} ({width}x{height})")
       except Exception as e:
           print(f"getDisplays error: {e}")
           displays = ["Display 1"]
       return {"displays": displays}

   def changeDisplay(self, data):
       self.currentDisplay = data.get('displayIndex', 0)
       try:
           import win32api
           monitors = win32api.EnumDisplayMonitors()
           if self.currentDisplay < len(monitors):
               handle, device, rect = monitors[self.currentDisplay]
               self.screenWidth = rect[2] - rect[0]
               self.screenHeight = rect[3] - rect[1]
       except Exception as e:
           print(f"changeDisplay error: {e}")
           self.screenWidth, self.screenHeight = pyautogui.size()
       return {"status": "changed"}
   
   def fastCaptureScreen(self):
       try:
           import win32api
           monitors = win32api.EnumDisplayMonitors()
           if self.currentDisplay < len(monitors):
               handle, device, rect = monitors[self.currentDisplay]
               left = rect[0]
               top = rect[1]
               width = rect[2] - rect[0]
               height = rect[3] - rect[1]
           else:
               left, top = 0, 0
               width, height = self.screenWidth, self.screenHeight
       except Exception as e:
           print(f"fastCaptureScreen monitor error: {e}")
           left, top = 0, 0
           width, height = self.screenWidth, self.screenHeight

       hwnd = win32gui.GetDesktopWindow()
       hdc = win32gui.GetWindowDC(hwnd)
       hcdc = win32ui.CreateDCFromHandle(hdc)
       hmdc = hcdc.CreateCompatibleDC()
       
       hbmp = win32ui.CreateBitmap()
       hbmp.CreateCompatibleBitmap(hcdc, width, height)
       hmdc.SelectObject(hbmp)
       
       hmdc.BitBlt((0, 0), (width, height), hcdc, (left, top), win32con.SRCCOPY)
       
       bmpstr = hbmp.GetBitmapBits(True)
       img = np.frombuffer(bmpstr, dtype='uint8')
       img = img.reshape((height, width, 4))
       img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
       
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
           import win32api
           monitors = win32api.EnumDisplayMonitors()
           if self.currentDisplay < len(monitors):
               handle, device, rect = monitors[self.currentDisplay]
               x = int(data['mouseInfo']['x'] * (rect[2] - rect[0])) + rect[0]
               y = int(data['mouseInfo']['y'] * (rect[3] - rect[1])) + rect[1]
           else:
               x = int(data['mouseInfo']['x'] * self.screenWidth)
               y = int(data['mouseInfo']['y'] * self.screenHeight)
           
           pyautogui.moveTo(x, y)
       except Exception as e:
           print(f"Mouse move error: {e}")
   
   def mouseClick(self, data):
       try:
           import win32api
           monitors = win32api.EnumDisplayMonitors()
           if self.currentDisplay < len(monitors):
               handle, device, rect = monitors[self.currentDisplay]
               x = int(data['mouseInfo']['x'] * (rect[2] - rect[0])) + rect[0]
               y = int(data['mouseInfo']['y'] * (rect[3] - rect[1])) + rect[1]
           else:
               x = int(data['mouseInfo']['x'] * self.screenWidth)
               y = int(data['mouseInfo']['y'] * self.screenHeight)

           pyautogui.moveTo(x, y)
           time.sleep(0.01)
           
           if data['mouseInfo']['button'] == 0: 
               pyautogui.click(x, y)
           elif data['mouseInfo']['button'] == 2: 
               pyautogui.rightClick(x, y)
       except Exception as e:
           print(f"Mouse click error: {e}")
   
   def keyPress(self, data):
       try:
           pyautogui.press(data['key'].lower())
       except:
           try:
               pyautogui.typewrite(data['key'])
           except Exception as e:
               print(f"Key press error: {e}")