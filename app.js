document.addEventListener("DOMContentLoaded", function () {
  const folderStructure = document.getElementById("folder-structure");
  const fileContent = document.getElementById("file-content");
  const addFolderButton = document.getElementById("add-folder");
  const deleteButton = document.getElementById("delete-item");
  const renameButton = document.getElementById("rename-item");
  const uploadButton = document.getElementById("upload-file");
  const fileUpload = document.getElementById("file-upload");
  const downloadButton = document.getElementById("download-file");
  const fileTabsContainer = document.getElementById("file-tabs");
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  let selectedItem = null;
  let openFiles = [];

  const fileTree = [
    {
      name: "Проект_1",
      type: "folder",
      children: [
        {
          name: "bin",
          type: "folder",
          children: [
            {
              name: "Debug",
              type: "folder",
              children: [],
            },
          ],
        },
        {
          name: "Resources",
          type: "folder",
          children: [
            {
              name: "App.xaml",
              type: "file",
              content: "Содержимое файла App.xaml",
              description: "Это основной файл приложения.",
            },
            {
              name: "MainWindow.xaml",
              type: "file",
              content: "Содержимое файла MainWindow.xaml",
              description: "Файл главного окна.",
            },
            {
              name: "MainWindow.cs",
              type: "file",
              content: "Содержимое файла MainWindow.cs",
              description: "Файл с логикой главного окна.",
            },
          ],
        },
        { name: "package", type: "file", content: "Содержимое файла package" },
      ],
    },
  ];

  const openFolders = new Set();

  function renderTree(tree, parentElement) {
    parentElement.innerHTML = "";
    tree.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.name;

      if (item.type === "folder") {
        li.classList.add("folder");
        const ul = document.createElement("ul");
        ul.classList.toggle("hidden", !openFolders.has(item.name));
        li.appendChild(ul);

        li.addEventListener("dblclick", function (event) {
          event.stopPropagation();
          openFolders.has(item.name)
            ? openFolders.delete(item.name)
            : openFolders.add(item.name);
          renderTree(fileTree, folderStructure);
        });

        li.addEventListener("click", function (event) {
          event.stopPropagation();
          selectedItem = item;
          highlightSelectedItem(li);
        });

        renderTree(item.children, ul);
      } else {
        li.classList.add("file");
        li.addEventListener("click", function (event) {
          event.stopPropagation();
          selectedItem = item;
          highlightSelectedItem(li);
          openFile(item);
        });

        // Всплывающая подсказка
        li.addEventListener("mouseenter", function () {
          tooltip.textContent = item.description || "Нет описания";
          tooltip.style.display = "block";
          tooltip.style.left = `${event.pageX + 5}px`;
          tooltip.style.top = `${event.pageY + 5}px`;
        });

        li.addEventListener("mousemove", function (event) {
          tooltip.style.left = `${event.pageX + 5}px`;
          tooltip.style.top = `${event.pageY + 5}px`;
        });

        li.addEventListener("mouseleave", function () {
          tooltip.style.display = "none";
        });
      }
      parentElement.appendChild(li);
    });
  }

  function highlightSelectedItem(selectedElement) {
    const allItems = folderStructure.querySelectorAll("li");
    allItems.forEach((item) => {
      item.style.backgroundColor = "";
    });
    selectedElement.style.backgroundColor = "#e0e0e0";
  }

  renderTree(fileTree, folderStructure);

  function openFile(file) {
    if (!openFiles.includes(file)) {
      openFiles.push(file);
      createFileTab(file);
    }
    displayFileContent(file);
  }

  function createFileTab(file) {
    const fileTab = document.createElement("div");
    fileTab.classList.add("file-tab");
    fileTab.textContent = file.name;
    fileTab.addEventListener("click", function () {
      displayFileContent(file);
    });
    fileTabsContainer.appendChild(fileTab);
  }

  function displayFileContent(file) {
    fileContent.value = file.content;
    fileContent.oninput = function () {
      file.content = fileContent.value;
    };
  }

  addFolderButton.addEventListener("click", function () {
    const folderName = prompt("Введите имя папки:");
    if (folderName) {
      if (selectedItem && selectedItem.type === "folder") {
        selectedItem.children.push({
          name: folderName,
          type: "folder",
          children: [],
        });
      } else {
        fileTree.push({ name: folderName, type: "folder", children: [] });
      }
      renderTree(fileTree, folderStructure);
    }
  });

  deleteButton.addEventListener("click", function () {
    if (selectedItem) {
      const confirmDelete = confirm(
        `Вы уверены, что хотите удалить ${selectedItem.name}?`
      );
      if (confirmDelete) {
        deleteItem(fileTree, selectedItem.name);
        renderTree(fileTree, folderStructure);
        fileContent.value = "";
        selectedItem = null;
      }
    }
  });

  function deleteItem(tree, name) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].name === name) {
        tree.splice(i, 1);
        return;
      }
      if (tree[i].children) {
        deleteItem(tree[i].children, name);
      }
    }
  }

  renameButton.addEventListener("click", function () {
    if (selectedItem) {
      const newName = prompt("Введите новое имя:", selectedItem.name);
      const newDescription = prompt(
        "Введите описание:",
        selectedItem.description || ""
      );
      if (newName) {
        selectedItem.name = newName;
        selectedItem.description = newDescription;
        renderTree(fileTree, folderStructure);
      }
    }
  });

  uploadButton.addEventListener("click", function () {
    fileUpload.click();
  });

  fileUpload.addEventListener("change", function () {
    const files = fileUpload.files;
    if (files.length > 0) {
      if (selectedItem && selectedItem.type === "folder") {
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = function (e) {
            const newFile = {
              name: file.name,
              type: "file",
              content: e.target.result,
              description: "",
            };
            selectedItem.children.push(newFile);
          };
          reader.readAsText(file);
        });
        renderTree(fileTree, folderStructure);
      } else {
        alert("Пожалуйста, выберите папку для загрузки файлов.");
      }
    }
  });

  downloadButton.addEventListener("click", function () {
    if (selectedItem && selectedItem.type === "file") {
      const blob = new Blob([selectedItem.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedItem.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });
});
