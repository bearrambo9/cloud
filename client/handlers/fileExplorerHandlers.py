import os
import requests
import shutil
import string
import platform
import base64
import mimetypes

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
        self.sio.on('createFolder')(self.createFolder)
        self.sio.on('createFile')(self.createFile)
        self.sio.on('saveFileContents')(self.saveFileContents)
        self.sio.on('getShortcut')(self.getShortcut)

    def getShortcut(self, data):
        shortcutName = data['shortcutName']
        
        folderMappings = {
            'Desktop': os.environ.get('USERPROFILE') + '\\Desktop',
            'Documents': os.environ.get('USERPROFILE') + '\\Documents',
            'Downloads': os.environ.get('USERPROFILE') + '\\Downloads',
            'Pictures': os.environ.get('USERPROFILE') + '\\Pictures',
            'Videos': os.environ.get('USERPROFILE') + '\\Videos',
            'Music': os.environ.get('USERPROFILE') + '\\Music'
        }
        
        if shortcutName in folderMappings:
            shortcutPath = folderMappings[shortcutName]
        else:
            shortcutPath = os.path.expanduser(f"~/{shortcutName}")
        
        shortcutPath = shortcutPath.replace("\\", "/")
        
        if os.path.exists(shortcutPath):
            return {"shortcutPath": shortcutPath}
        else:
            fallback = os.environ.get('USERPROFILE').replace("\\", "/")
            return {"shortcutPath": fallback}

    def saveFileContents(self, data):
        fileData = data['fileData']
        path = data['path']
        try:
            with open(path, "w", encoding='utf-8') as f:
                f.write(fileData)
            return {"status": "success", "file": os.path.basename(path)}
        except Exception as e:
            print(f"saveFileContents error: {e}")
    
    def createFile(self, data):
        path = data['path']
        if os.path.exists(path):
            return {"error": "Path already exists"}
        else:
            try:
                with open(path, "w") as f:
                    pass
                return {"status": "success"}
            except Exception as e:
                print(f"createFile error: {e}")
            
    def createFolder(self, data):
        path = data['path']
        if os.path.exists(path):
            return {"error": "Path already exists"}
        else:
            try:
                os.makedirs(path)
                return {"status": "success"}
            except Exception as e:
                print(f"createFolder error: {e}")

    def renamePath(self, data):
        path = data['path']
        name = data['newName']
        try:
            os.rename(path, name)
            return {"status": "success"}
        except Exception as e:
            print(f"renamePath error: {e}")
    
    def deletePath(self, data):
        path = data['path']
        try:
            if os.path.isfile(path):
                os.remove(path)
            else:
                shutil.rmtree(path)
            return {"status": "success"}
        except Exception as e:
            print(f"deletePath error: {e}")
    
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
        try:
            mimeType, _ = mimetypes.guess_type(path)
            if mimeType and mimeType.startswith('image/'):
                with open(path, "rb") as file:
                    binaryData = file.read()
                    base64Data = base64.b64encode(binaryData).decode('utf-8')
                    return {
                        "data": base64Data,
                        "mimeType": mimeType,
                        "isImage": True
                    }
            else:
                try:
                    with open(path, "r", encoding='utf-8') as file:
                        return {"data": file.read(), "isImage": False}
                except UnicodeDecodeError:
                    with open(path, "r", encoding='latin-1') as file:
                        return {"data": file.read(), "isImage": False}
        except Exception as e:
            print(f"getFileData error: {e}")
            return {"data": "", "isImage": False}
        
    def getRoot(self):
        print("getRoot called, returning: DRIVES")
        return "DRIVES"

    def getPathData(self, data):
        path = data['path']
        print(f"getPathData called with path: {path}")
        
        if path == "DRIVES":
            print("Handling DRIVES case")
            drives = []
            for letter in string.ascii_uppercase:
                drive = f"{letter}:\\"
                if os.path.exists(drive):
                    drives.append({
                        "path": f"{letter}:/",
                        "isFolder": True,
                        "name": f"{letter}: Drive"
                    })
            print(f"Found drives: {drives}")
            return drives
        
        print(f"Handling regular path: {path}")
        try:
            subfolders = [f.path for f in os.scandir(path)]
        except Exception as e:
            print(f"getPathData error: {e}")
            return []

        result = []
        for folder in subfolders:
            try:
                safePath = folder.replace("\\", "/")
                result.append({
                    "path": safePath,
                    "isFolder": os.path.isdir(folder),
                    "name": os.path.basename(folder),
                })
            except Exception as e:
                print(f"getPathData folder error: {e}")
                continue

        return result