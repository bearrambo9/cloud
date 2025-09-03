import psutil, win32gui, win32process, threading, time

class TaskManagerHandlers:
    def __init__(self, socketClient):
        self.sio = socketClient
        self.taskManagerActive = False
        self.taskManagerThread = None
    
    def registerEvents(self):
        self.sio.on('startTaskManager')(self.startTaskManager)
        self.sio.on('killProcess')(self.killProcess)

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

    def getProcesses(self):
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

        return processes
    
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
                processes = self.getProcesses()
                self.sio.emit("taskManagerData", processes)

                time.sleep(2)
            except:
                pass

    def startTaskManager(self):
        if self.taskManagerActive:
            return {"error": "Task manager already running"}
         
        self.taskManagerActive = True
        self.taskManagerThread = threading.Thread(target=self.taskManager, daemon=True)
        self.taskManagerThread.start()

        return self.getProcesses()
