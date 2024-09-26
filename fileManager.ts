interface FileSystemItem {
  name: string;
  type: "file" | "folder";
  children?: FileSystemItem[];
  content?: string;
  description?: string;
}

class FileManager {
  private fileTree: FileSystemItem[] = [];

  constructor(initialTree: FileSystemItem[]) {
    this.fileTree = initialTree;
  }

  addFolder(name: string, parentPath: string[]): void {
    const folder = this.findFolder(parentPath);
    if (folder) {
      folder.children?.push({ name, type: "folder", children: [] });
    }
  }

  findFolder(path: string[]): FileSystemItem | null {
    let current = this.fileTree;
    for (const part of path) {
      const folder = current.find(
        (item) => item.name === part && item.type === "folder"
      );
      if (!folder) return null;
      current = folder.children!;
    }
    return { name: "", type: "folder", children: current };
  }
}
