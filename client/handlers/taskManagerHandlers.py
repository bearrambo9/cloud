import psutil, win32gui, win32process, threading, time, wmi
from pathlib import Path

class TaskManagerHandlers:
    def __init__(self, socketClient):
        self.sio = socketClient
        self.taskManagerActive = False
        self.taskManagerThread = None
    
    def registerEvents(self):
        self.sio.on('startTaskManager')(self.startTaskManager)
        self.sio.on('killProcess')(self.killProcess)
        self.sio.on('getProcessLocation')(self.getProcessLocation)
        self.sio.on('getHardwareSpecs')(self.getHardwareSpecs)

    def hasVisibleWindow(self, processId):
        def enumWindowsCallback(hwnd, windows):
            if win32gui.IsWindowVisible(hwnd):
                _, window_pid = win32process.GetWindowThreadProcessId(hwnd)
                if window_pid == processId:
                    windows.append(hwnd)
            return True
        
        windows = []
        win32gui.EnumWindows(enumWindowsCallback, windows)

        return len(windows) > 0

    def getCpuInfo(self):
        import pythoncom
        pythoncom.CoInitialize()
        
        cpuInfo = {}
        c = wmi.WMI()

        cpu = c.Win32_Processor()[0]
        cpuInfo["name"] = cpu.Name
        cpuInfo["speed"] = f"{cpu.CurrentClockSpeed / 1000:.2f} GHz"
        cpuInfo["baseSpeed"] = f"{cpu.MaxClockSpeed / 1000:.2f} GHz"
        cpuInfo["cores"] = cpu.NumberOfCores
        cpuInfo["logicalProcessors"] = cpu.NumberOfLogicalProcessors
        cpuInfo["sockets"] = len(c.Win32_Processor())
        processes = list(psutil.process_iter(['num_threads', 'num_handles']))
        cpuInfo["processCount"] = len(processes)
        cpuInfo["threadCount"] = sum(p.info['num_threads'] or 0 for p in processes)
        cpuInfo["handleCount"] = sum(p.info['num_handles'] or 0 for p in processes)

        return cpuInfo
    
    def getHardwareSpecs(self):
        hardwardSpecs = {}

        hardwardSpecs["cpu"] = self.getCpuInfo()

        return hardwardSpecs
    
    def getProcessLocation(self, data):
        try:
            processId = data['processId']
            process = psutil.Process(processId)
            path = Path(process.exe())
            path = str(path.parent)

            return path
        except:
            pass

    def getTaskManagerData(self):
        processes = []

        for process in psutil.process_iter():
            try:
                pid = process.pid
                isApp = self.hasVisibleWindow(pid)
                type = "app" if isApp else "background"
                name = process.name()
                status = process.status()
                cpuPercent = process.cpu_percent()
                memoryInfo = process.memory_info()
                memoryInfo = memoryInfo.rss / (1024 * 1024)

                processData = {"pid": pid, "name": name, "status": status, "cpuPercent": cpuPercent, "memory": memoryInfo, "type": type}
                processes.append(processData)
            except:
                pass

        cpuPercent = psutil.cpu_percent(interval=0.1)
        cpuFreq = psutil.cpu_freq()
        memory = psutil.virtual_memory()
        networkIo = psutil.net_io_counters()

        diskIo = psutil.disk_io_counters()
        networkIo = psutil.net_io_counters()

        performance = {
            "cpu": {
                "title": "CPU",
                "subtitle": f"{cpuPercent}% {cpuFreq.current/1000:.2f} GHz" if cpuFreq else f"{cpuPercent}%",
                "percentage": f"{cpuPercent}%",
            },
            "memory": {
                "title": "Memory", 
                "subtitle": f"{memory.used/1024**3:.1f}/{memory.total/1024**3:.1f} GB ({memory.percent:.0f}%)",
                "percentage": f"{memory.percent:.0f}%",
            },
            "disk": {
                "title": "Disk 0 (C:)",
                "subtitle": "SSD",
                "readBytes": diskIo.read_bytes,
                "writeBytes": diskIo.write_bytes,
                "readTime": diskIo.read_time,
                "writeTime": diskIo.write_time,
            },
         "network": {
                "title": "Wi-Fi",
                "bytesSent": networkIo.bytes_sent,
                "bytesRecv": networkIo.bytes_recv,
                "timestamp": time.time()
            }
        }

        return {
            "processes": processes,
            "performanceData": performance
        }
    
    def killProcess(self, data):
        try:
            process = psutil.Process(data['pid'])
            name = process.name()
            process.kill()

            return {"status": "success", "process": name}
        except Exception as ex:
            print(ex)

    def taskManager(self):
        while self.taskManagerActive:
            try:
                taskManagerData = self.getTaskManagerData()
                self.sio.emit("taskManagerData", taskManagerData)

                time.sleep(2)
            except:
                pass

    def startTaskManager(self):
        if self.taskManagerActive:
            return {"error": "Task manager already running"}
         
        self.taskManagerActive = True
        self.taskManagerThread = threading.Thread(target=self.taskManager, daemon=True)
        self.taskManagerThread.start()

        return self.getTaskManagerData()
