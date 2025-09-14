import ctypes
from ctypes import wintypes
import subprocess

# Gonna use pyWin32 for production because its cleaner and more reliable,
# but I think this taught me something about lower level programming
# and interacting with the Windows API

SC_MANAGER_ALL_ACCESS = 0xF003F

SC_ENUM_PROCESS_INFO = 0
SERVICE_WIN32 = 0x00000030
SERVICE_STATE_ALL = 0x00000003

advapi32 = ctypes.windll.Advapi32
advapi32.OpenSCManagerW.argtypes = [
    wintypes.LPCWSTR,
    wintypes.LPCWSTR,
    wintypes.DWORD
]
advapi32.OpenSCManagerW.restype = ctypes.wintypes.HANDLE

dwDesiredAccess = ctypes.c_ulong(SC_MANAGER_ALL_ACCESS)

scmHandle = advapi32.OpenSCManagerW(None, None, dwDesiredAccess)

class SERVICE_STATUS_PROCESS(ctypes.Structure):
    _fields_ = [
        ("dwServiceType", wintypes.DWORD),
        ("dwCurrentState", wintypes.DWORD),
        ("dwControlsAccepted", wintypes.DWORD),
        ("dwWin32ExitCode", wintypes.DWORD),
        ("dwServiceSpecificExitCode", wintypes.DWORD),
        ("dwCheckPoint", wintypes.DWORD),
        ("dwWaitHint", wintypes.DWORD),
        ("dwProcessId", wintypes.DWORD),
        ("dwServiceFlags", wintypes.DWORD)
    ]

class ENUM_SERVICE_STATUS_PROCESSW(ctypes.Structure):
    _fields_ = [
        ("lpServiceName", wintypes.LPCWSTR),
        ("lpDisplayName", wintypes.LPCWSTR),
        ("ServiceStatusProcess", SERVICE_STATUS_PROCESS)
    ]

advapi32.EnumServicesStatusExW.argtypes = [
    wintypes.HANDLE,
    wintypes.DWORD,
    wintypes.DWORD,
    wintypes.DWORD,
    ctypes.POINTER(wintypes.BYTE),
    wintypes.DWORD,
    ctypes.POINTER(wintypes.DWORD),
    ctypes.POINTER(wintypes.DWORD),
    ctypes.POINTER(wintypes.DWORD),
    wintypes.LPCWSTR
]

advapi32.EnumServicesStatusExW.restype = wintypes.BOOL

advapi32.CloseServiceHandle.argtypes = [wintypes.SC_HANDLE]
advapi32.CloseServiceHandle.restype = wintypes.BOOL

arrayBytesNeeded = wintypes.DWORD()
servicesReturned = wintypes.DWORD()

advapi32.EnumServicesStatusExW(
    scmHandle, 
    SC_ENUM_PROCESS_INFO,
    SERVICE_WIN32, 
    SERVICE_STATE_ALL,
    None,
    0,
    ctypes.byref(arrayBytesNeeded),
    ctypes.byref(servicesReturned),
    None,
    None
)

buffer = (wintypes.BYTE * arrayBytesNeeded.value)()

advapi32.EnumServicesStatusExW(
    scmHandle, 
    SC_ENUM_PROCESS_INFO,
    SERVICE_WIN32, 
    SERVICE_STATE_ALL,
    ctypes.cast(buffer, ctypes.POINTER(wintypes.BYTE)),
    arrayBytesNeeded.value,
    ctypes.byref(arrayBytesNeeded),
    ctypes.byref(servicesReturned),
    None,
    None
)

services = ctypes.cast(buffer, ctypes.POINTER(ENUM_SERVICE_STATUS_PROCESSW * servicesReturned.value))

for i in range(servicesReturned.value):
    service = services.contents[i]
    name = service.lpServiceName
    displayName = service.lpDisplayName

    print(f"{name}, {displayName}")

advapi32.CloseServiceHandle(scmHandle)