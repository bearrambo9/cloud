import os
import requests

class FileExplorerHandlers:
    def __init__(self, socketClient, url):
        self.sio = socketClient
        self.URL = url
    
    def registerEvents(self):
        self.sio.on('renamePath')(self.renamePath)
        self.sio.on('deletePath')(self.deletePath)
        self.sio.on('downloadFiles')(self.downloadFiles)
        self.sio.on('getFileData')(self.getFileData)
        self.sio.on('getPathData')(self.getPathData)
        self.sio.on('getRoot')(self.getRoot)
    
    def renamePath(self, data):
        path = data['path']
        name = data['newName']
        
        try:
            os.rename(path, name)
        except:
            pass
    
    def deletePath(self, data):
        path = data['path']
        
        try:
            os.remove(path)
        except:
            pass
    
    def downloadFiles(self, data):
        responses = {}

        for url in data['urls']:
            response = requests.get(self.URL + "/download?file=" + url)

            if response.status_code == 200:
                print(url + " downloaded successfully")
                fileName = url.split("-")[0].replace("/", "")
                filePath = data['urls'][url]
             
                with open(filePath, "wb") as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:  
                            file.write(chunk)

                responses[fileName] = True

        self.sio.emit("uploadData", responses)
    
    def getFileData(self, data):
        path = data['path']
        fileData = ""

        try:
            with open(path, "r") as file:
                fileData = file.read()
        except: 
            pass

        return fileData
    
    def getPathData(self, data):
        path = data['path']
        subfolders = [f.path for f in os.scandir(path)]

        result = []

        for folder in subfolders:
            safePath = folder.replace("\\", "/")
            result.append({
                "path": safePath,
                "isFolder": os.path.isdir(folder),
                "name": os.path.basename(folder),
            })

        return result
    
    def getRoot(self):
        root = os.environ.get('SystemDrive', 'C:')[:2]
        return root