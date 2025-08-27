import platform
import ctypes
import os
import winreg
import uuid
import hashlib
import subprocess
import requests

def getPublicIP():
    try:
        response = requests.get('https://api.ipify.org', timeout=5)
        return response.text.strip()
    except:
        return None

def isAdmin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def getPowershellValue(command):
    try:
        result = subprocess.check_output(["powershell", "-Command", command], shell=True)
        return result.decode().strip()
    except Exception as e:
        return None

def getUserFingerprint():
    biosSerial = getPowershellValue("(Get-WmiObject win32_bios).SerialNumber")
    uuid_val = getPowershellValue("(Get-WmiObject Win32_ComputerSystemProduct).UUID")
    diskSerial = getPowershellValue("(Get-WmiObject Win32_PhysicalMedia).SerialNumber | Select-Object -First 1")
    
    if (biosSerial and uuid_val and diskSerial):
        raw = biosSerial + uuid_val + diskSerial
        return hashlib.sha256(raw.encode()).hexdigest()
    else:
        return None
    
def getUserId():
    REG_PATH = r"Software\Cloud"

    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_PATH, 0, winreg.KEY_READ)
        value, _ = winreg.QueryValueEx(key, "id")
        return value
    except FileNotFoundError:
        userId = str(uuid.uuid4()) 
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, REG_PATH)
        winreg.SetValueEx(key, "id", 0, winreg.REG_SZ, userId)
        return userId
    
def updateUserId(data):
    REG_PATH = r"Software\Cloud"

    try:
        userId = data['newId']
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, REG_PATH)
        winreg.SetValueEx(key, "id", 0, winreg.REG_SZ, userId)
    except Exception as ex:
        print(ex)

def getSystemInfo():
    return {
        'username': os.getenv("username"),
        'ip': getPublicIP(),
        'os': platform.platform(),
        'type': isAdmin(),
        'id': getUserId(),
        'fingerprint': getUserFingerprint()
    }