import win32service
import win32serviceutil

class ServiceHandlers:
    def __init__(self, socketClient):
        self.sio = socketClient

    def registerEvents(self):
        self.sio.on("getServices")(self.getServices)

    def getServices(self):
        scmHandle = win32service.OpenSCManager(None, None, win32service.SC_MANAGER_ENUMERATE_SERVICE)
        services = win32service.EnumServicesStatus(scmHandle)

        servicesList = []

        for service in services:
            serviceName = service[0]
            serviceDisplayName = service[1]
            serviceStatus = service[2] 
            
            currentState = serviceStatus[1] 
            processId = serviceStatus[7] if len(serviceStatus) > 7 else 0  
            
            description = "No description available"
            startType = "Unknown"
            group = "None"
            
            try:
                serviceHandle = win32service.OpenService(scmHandle, serviceName, win32service.SERVICE_QUERY_CONFIG)
                
                config = win32service.QueryServiceConfig(serviceHandle)
                startTypeCode = config[1]
                
                if startTypeCode == 2:
                    startType = "Automatic"
                elif startTypeCode == 3:
                    startType = "Manual"
                elif startTypeCode == 4:
                    startType = "Disabled"
                
                try:
                    description = win32service.QueryServiceConfig2(serviceHandle, win32service.SERVICE_CONFIG_DESCRIPTION)
                except:
                    pass
                    
                win32service.CloseServiceHandle(serviceHandle)
            except:
                pass

            if currentState == 1:
                status = "Stopped"
            elif currentState == 4:
                status = "Running"
            elif currentState == 2:
                status = "Start Pending"
            elif currentState == 3:
                status = "Stop Pending"
            else:
                status = "Unknown"

            service = {
                "serviceName": serviceName,
                "serviceDisplayName": serviceDisplayName,
                "status": status,
                "processId": processId if processId != 0 else None,
                "description": description,
                "startType": startType,
                "group": group
            }

            servicesList.append(service)

        win32service.CloseServiceHandle(scmHandle)
        return servicesList