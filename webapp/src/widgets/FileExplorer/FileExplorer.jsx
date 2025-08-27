import { ActionIcon, Group, Textarea, TextInput, Tree } from "@mantine/core";
import { IconCheck, IconChevronLeft } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { useMantineColorScheme } from "@mantine/core";
import { FileExplorerLeaf } from "../../components/FileExplorerLeaf/FileExplorerLeaf";
import { useFileContextMenu } from "../../hooks/useFileContextMenu";
import { FileContextMenu } from "../../components/FileContextMenu/FileContextMenu";
import { useEffect, useState } from "react";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import socket from "../../shared/api/socket";

function FileExplorer() {
  const params = useParams();
  const { colorScheme } = useMantineColorScheme();
  const [directoryPath, setDirectoryPath] = useState("");
  const [filePath, setFilePath] = useState("");
  const [fileData, setFileData] = useState();
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const { menuState, ref, handleContextMenu, closeMenu } = useFileContextMenu();

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
      setFilePath("");
      setFileData();
    } else {
      setFilePath(clickedPath);

      socket.emit(
        "getClientFileData",
        {
          token: localStorage.getItem("token"),
          clientId: params.clientId.replace(":", ""),
          path: clickedPath,
        },
        (data) => {
          setFileData(data);
        }
      );
    }
  }

  function back() {
    if (fileData) {
      setFileData();
      setFilePath("");
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

  useEffect(() => {
    socket.emit(
      "getClientRoot",
      {
        token: localStorage.getItem("token"),
        clientId: params.clientId.replace(":", ""),
      },
      (root) => {
        setDirectoryPath(root + "/");
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
        console.log("Current directory path:", currentPath);

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
    <div>
      <Group>
        <ActionIcon onClick={back} variant={"transparent"}>
          <IconChevronLeft
            color={colorScheme === "white" ? "black" : "white"}
            size={28}
          />
        </ActionIcon>
        <h1>{fileData ? filePath : directoryPath}</h1>
      </Group>

      {fileData ? (
        <Textarea autosize maxRows={25} value={fileData} readOnly />
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
    </div>
  );
}

export default FileExplorer;
