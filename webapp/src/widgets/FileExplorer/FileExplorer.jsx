import {
  ActionIcon,
  Group,
  Textarea,
  TextInput,
  Tree,
  Loader,
  Text,
  Popover,
  Badge,
} from "@mantine/core";
import { IconCheck, IconChevronLeft, IconUpload } from "@tabler/icons-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMantineColorScheme } from "@mantine/core";
import { FileExplorerLeaf } from "../../components/FileExplorerLeaf/FileExplorerLeaf";
import { useFileContextMenu } from "../../hooks/useFileContextMenu";
import { FileContextMenu } from "../../components/FileContextMenu/FileContextMenu";
import { useDirectoryContextMenu } from "../../hooks/useDirectoryContextMenu";
import { DirectoryContextMenu } from "../../components/DirectoryContextMenu/DirectoryContextMenu";
import { useEffect, useState } from "react";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import socket from "../../shared/api/socket";
import { useDisclosure } from "@mantine/hooks";

function FileExplorer() {
  const params = useParams();
  const { colorScheme } = useMantineColorScheme();
  const [directoryPath, setDirectoryPath] = useState("");
  const [opened, { close, open }] = useDisclosure(false);
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [fileData, setFileData] = useState("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchParams] = useSearchParams();
  const { menuState, ref, handleContextMenu, closeMenu } = useFileContextMenu();
  const {
    dirContextMenuState,
    dirContextMenuRef,
    handleDirContextMenu,
    closeDirMenu,
  } = useDirectoryContextMenu();

  function updateContents() {
    socket.emit(
      "getClientPathData",
      {
        token: localStorage.getItem("token"),
        path: directoryPath,
        clientId: params.clientId.replace(":", ""),
      },
      (data) => {
        setData(data);
      }
    );
  }

  const handleOpenInTerminal = (path) => {
    window.location = `/shell/${params.clientId.replace(
      ":",
      ""
    )}?parentDirectory=${encodeURIComponent(path)}`;
  };

  const handleOpen = (item) => {
    onPathClick(item.path, item.isFolder);
    closeMenu();
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you'd like to delete ./${item.name}?`)) {
      socket.emit(
        "deleteClientPath",
        {
          token: localStorage.getItem("token"),
          clientId: params.clientId.replace(":", ""),
          path: item.path,
        },
        () => {
          updateContents();
        }
      );
    }
  };

  const handleCreateFolder = (path) => {
    const folderName = prompt("New folder name:");

    if (folderName) {
      socket.emit(
        "createClientFolder",
        {
          token: localStorage.getItem("token"),
          clientId: params.clientId.replace(":", ""),
          path: `${path}/${folderName}`,
        },
        () => {
          updateContents();
        }
      );
    }

    closeDirMenu();
  };

  const handleCreateFile = (path) => {
    const fileName = prompt("New file name:");

    if (fileName) {
      socket.emit(
        "createClientFile",
        {
          token: localStorage.getItem("token"),
          clientId: params.clientId.replace(":", ""),
          path: `${path}/${fileName}`,
        },
        () => {
          updateContents();
        }
      );
    }

    closeDirMenu();
  };

  function getParentDirectory(path) {
    const cleanPath = path.replace(/[\/\\]+$/, "");

    const lastSlash = Math.max(
      cleanPath.lastIndexOf("/"),
      cleanPath.lastIndexOf("\\")
    );

    if (lastSlash === -1) {
      return null;
    }

    const parent = cleanPath.substring(0, lastSlash);

    if (!parent || parent.match(/^[A-Z]:$/)) {
      return parent;
    }

    return parent;
  }

  const handleRename = (item) => {
    const newName = window.prompt(`Enter new name for ${item.name}`);

    if (newName) {
      socket.emit(
        "renameClientPath",
        {
          token: localStorage.getItem("token"),
          clientId: params.clientId.replace(":", ""),
          path: item.path,
          newName: `${getParentDirectory(item.path)}/${newName}`,
        },
        () => {
          updateContents();
        }
      );
    }
  };

  function returnToHome() {
    location.href = "/clients/";
  }

  function onPathClick(clickedPath, isFolder) {
    if (isFolder) {
      setDirectoryPath(clickedPath);
      setSelectedFilePath("");
      setFileData("");
    } else {
      setSelectedFilePath(clickedPath);
      setIsLoadingFile(true);
      setFileData("");

      socket.emit(
        "getClientFileData",
        {
          token: localStorage.getItem("token"),
          clientId: params.clientId.replace(":", ""),
          path: clickedPath,
        },
        (data) => {
          setFileData(data || "");
          setIsLoadingFile(false);
        }
      );
    }
  }

  function back() {
    if (selectedFilePath) {
      setSelectedFilePath("");
      setFileData("");
      setIsLoadingFile(false);
      return;
    }

    const currentPath = directoryPath.replace(/\/$/, "");

    if (currentPath.match(/^[A-Z]:$/)) {
      returnToHome();
      return;
    }

    const lastSlash = currentPath.lastIndexOf("/");
    if (lastSlash === 2) {
      setDirectoryPath(currentPath.substring(0, 3));
    } else if (lastSlash > 2) {
      setDirectoryPath(currentPath.substring(0, lastSlash + 1));
    }
  }

  const handleFileDataChange = (event) => {
    setFileData(event.currentTarget.value);
  };

  useEffect(() => {
    const path = searchParams.get("path");

    socket.emit(
      "getClientRoot",
      {
        token: localStorage.getItem("token"),
        clientId: params.clientId.replace(":", ""),
      },
      (root) => {
        if (path) {
          setDirectoryPath(path);
        } else {
          setDirectoryPath(root + "/");
        }
      }
    );

    const handleUploadData = (data) => {
      for (const file in data) {
        if (file !== "creator" && file !== "username") {
          notifications.show({
            color: "green",
            icon: <IconCheck />,
            title: `${data.creator} uploaded ${file} to @${data.username}`,
          });
        }
      }

      setDirectoryPath((currentPath) => {
        socket.emit(
          "getClientPathData",
          {
            token: localStorage.getItem("token"),
            path: currentPath,
            clientId: params.clientId.replace(":", ""),
          },
          (data) => {
            setData(data);
          }
        );

        return currentPath;
      });
    };

    socket.on("uploadData", handleUploadData);

    return () => {
      socket.off("uploadData", handleUploadData);
    };
  }, []);

  async function onFilesDrop(files) {
    const base64Files = [];

    const promises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target.result.split(",")[1];
          const fileData = {
            name: file.name,
            data: base64Data,
          };
          base64Files.push(fileData);
          resolve(fileData);
        };
        reader.readAsDataURL(file);
      });
    });

    await Promise.all(promises);

    try {
      const { data } = await axios.post("/uploadFiles", {
        token: localStorage.getItem("token"),
        files: base64Files,
        clientId: params.clientId.replace(":", ""),
        targetPath: directoryPath,
      });

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  function saveFileContents() {
    socket.emit(
      "saveClientFileContents",
      {
        token: localStorage.getItem("token"),
        fileData: fileData,
        clientId: params.clientId.replace(":", ""),
        path: selectedFilePath,
      },
      (data) => {
        if (data.status == "success") {
          notifications.show({
            color: "green",
            icon: <IconCheck />,
            title: `Saved ${data.file}'s contents successfully`,
          });
        }
      }
    );
  }

  function getShortcut(shortcutName) {
    socket.emit(
      "getClientShortcut",
      {
        token: localStorage.getItem("token"),
        clientId: params.clientId.replace(":", ""),
        shortcutName: shortcutName,
      },
      (data) => {
        if (data["shortcutPath"]) {
          setFileData();
          setSelectedFilePath("");
          setDirectoryPath(data["shortcutPath"]);
        }
      }
    );
  }

  function search(event) {
    event.preventDefault();
    setDirectoryPath(searchValue);
  }

  useEffect(() => {
    if (directoryPath !== "") {
      socket.emit(
        "getClientPathData",
        {
          token: localStorage.getItem("token"),
          path: directoryPath,
          clientId: params.clientId.replace(":", ""),
        },
        (data) => {
          setData(data);
        }
      );
    }
  }, [directoryPath]);

  return (
    <div
      style={{ height: "100vh" }}
      onContextMenu={(e) => handleDirContextMenu(e, directoryPath)}
    >
      <Group>
        <ActionIcon onClick={back} variant={"transparent"}>
          <IconChevronLeft
            color={colorScheme === "white" ? "black" : "white"}
            size={28}
          />
        </ActionIcon>
        <h1>{selectedFilePath || directoryPath}</h1>
      </Group>

      <Group>
        <Badge
          size={"lg"}
          my={"sm"}
          onMouseEnter={(e) => (e.target.style.cursor = "pointer")}
          onClick={() => getShortcut("Desktop")}
        >
          Desktop
        </Badge>
        <Badge
          size={"lg"}
          my={"sm"}
          onMouseEnter={(e) => (e.target.style.cursor = "pointer")}
          onClick={() => getShortcut("Documents")}
        >
          Documents
        </Badge>
        <Badge
          size={"lg"}
          my={"sm"}
          onMouseEnter={(e) => (e.target.style.cursor = "pointer")}
          onClick={() => getShortcut("Downloads")}
        >
          Downloads
        </Badge>
        <Badge
          size={"lg"}
          my={"sm"}
          onMouseEnter={(e) => (e.target.style.cursor = "pointer")}
          onClick={() => getShortcut("Pictures")}
        >
          Pictures
        </Badge>
        <Badge
          size={"lg"}
          my={"sm"}
          onMouseEnter={(e) => (e.target.style.cursor = "pointer")}
          onClick={() => getShortcut("Videos")}
        >
          Videos
        </Badge>
        <Badge
          size={"lg"}
          my={"sm"}
          onMouseEnter={(e) => (e.target.style.cursor = "pointer")}
          onClick={() => getShortcut("Music")}
        >
          Music
        </Badge>
      </Group>

      {selectedFilePath ? (
        <div>
          <Popover position={"top"} shadow={"md"} opened={opened}>
            <Popover.Target>
              <ActionIcon
                onClick={() => saveFileContents()}
                my={"md"}
                variant={"filled"}
                aria-label={"Save"}
              >
                <IconUpload
                  onMouseEnter={open}
                  onMouseLeave={close}
                  style={{ width: "70%", height: "70%" }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown style={{ pointerEvents: "none" }}>
              <Text size="sm">Save file contents</Text>
            </Popover.Dropdown>
          </Popover>
          {isLoadingFile ? (
            <Group>
              <Loader size="sm" />
              <Text>Loading file content...</Text>
            </Group>
          ) : null}
          <Textarea
            autosize
            maxRows={25}
            value={fileData}
            onChange={handleFileDataChange}
            placeholder={
              isLoadingFile ? "Loading..." : "File content will appear here..."
            }
            disabled={isLoadingFile}
          />
        </div>
      ) : (
        <div>
          <form onSubmit={(event) => search(event)}>
            <TextInput
              value={searchValue}
              onChange={(event) => setSearchValue(event.currentTarget.value)}
              placeholder={directoryPath}
              mb={"xl"}
            />
          </form>
          <Tree
            ml={"lg"}
            mb={"lg"}
            data={data}
            selectOnClick
            renderNode={({ node }) => (
              <FileExplorerLeaf
                name={node.name}
                path={node.path}
                isFolder={node.isFolder}
                onPathClick={onPathClick}
                onContextMenu={handleContextMenu}
              />
            )}
          />
        </div>
      )}

      <Dropzone.FullScreen
        activateOnDrag={true}
        onDrop={async (files) => onFilesDrop(files)}
      />

      <FileContextMenu
        menuState={menuState}
        menuRef={ref}
        onClose={closeMenu}
        onOpen={handleOpen}
        onDelete={handleDelete}
        onRename={handleRename}
      />
      <DirectoryContextMenu
        menuState={dirContextMenuState}
        menuRef={dirContextMenuRef}
        onClose={closeDirMenu}
        onCreateFolder={handleCreateFolder}
        onCreateFile={handleCreateFile}
        onOpenInTerminal={handleOpenInTerminal}
      />
    </div>
  );
}

export default FileExplorer;
