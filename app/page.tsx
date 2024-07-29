"use client";

import { useState } from "react";
import { FilesystemItemAnimated } from "../components/filesystem-item";
import crypto from "crypto";

export default function Page() {
  const [nodes, setNodes] = useState(generateNodes(initialNodes));
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: Node | null;
  } | null>(null);
  const [popup, setPopup] = useState<{
    type: "file" | "folder";
    parentNode: Node | null;
  } | null>(null);
  const [newName, setNewName] = useState("");

  const addNode = (type: "folder" | "file", parentNode: Node) => {
    setPopup({ type, parentNode });
    setContextMenu(null);
  };

  const deleteNode = (targetNode: Node) => {
    setNodes((prevNodes) => deleteNodeRecursively(prevNodes, targetNode));
    setContextMenu(null);
  };

  const handleSave = () => {
    if (!popup?.parentNode) return;

    if (newName.length < 3) {
      alert(
        `${popup.type.toUpperCase()} name should be atleast 3 characters long!`
      );
      return;
    }

    if (popup.type === "file") {
      if (!newName.includes(".")) {
        alert(
          "Please enter a valid file name with an extension (e.g., 'document.txt')."
        );
        return;
      }

      if (newName.includes(" ")) {
        alert(
          "File names should not contain spaces. Please use underscores or hyphens instead."
        );
        return;
      }
    }

    const newNode: Node = { name: newName, id: generateHash(newName) };
    if (popup.type === "folder") {
      newNode.nodes = [];
    }

    const updatedNodes = addNodeRecursively(nodes, popup.parentNode, newNode);
    setNodes(updatedNodes);
    setPopup(null);
    setNewName("");
  };

  return (
    <div onClick={() => setContextMenu(null)}>
      <ul className="m-4">
        {generateNodes(nodes).map((node) => (
          <FilesystemItemAnimated
            node={node}
            key={node.name}
            addNode={addNode}
            deleteNode={deleteNode}
            setContextMenu={setContextMenu}
          />
        ))}
      </ul>
      {contextMenu && (
        <div
          className="h-screen w-screen bg-transparent"
          onClick={() => setContextMenu(null)}
        >
          <ul
            className="absolute p-1 list-none bg-black flex flex-col rounded-lg"
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
              border: "1px solid #ccc",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.node?.nodes ? (
              <>
                <li
                  className="hover:bg-slate-500 p-2 rounded-lg cursor-pointer"
                  onClick={() => addNode("file", contextMenu.node!)}
                >
                  Create File
                </li>
                <li
                  className="hover:bg-slate-500 p-2 rounded-lg cursor-pointer"
                  onClick={() => addNode("folder", contextMenu.node!)}
                >
                  Create Folder
                </li>
                <li
                  className="hover:bg-slate-500 p-2 rounded-lg cursor-pointer"
                  onClick={() => deleteNode(contextMenu.node!)}
                >
                  Delete Folder
                </li>
              </>
            ) : (
              <li
                className="hover:bg-slate-500 p-2 rounded-lg cursor-pointer"
                onClick={() => deleteNode(contextMenu.node!)}
              >
                Delete File
              </li>
            )}
          </ul>
        </div>
      )}
      {popup && (
        <div
          className="text-white fixed top-[50%] left-[50%] flex flex-col gap-4 p-5 rounded-lg outline-none border-none"
          style={{
            border: "1px solid white",
            transform: "translate(-50%, -50%)",
          }}
        >
          <input
            className="p-3 rounded-lg text-black"
            style={{ border: "1px solid white" }}
            type="text"
            autoFocus
            value={newName}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Enter ${popup.type} name`}
          />
          <div className="flex items-center gap-4 justify-between">
            <button
              onClick={handleSave}
              className="p-2 rounded-lg w-full hover:bg-slate-500"
              style={{ border: "1px solid white" }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setPopup(null);
                setNewName("");
              }}
              className="p-2 rounded-lg w-full hover:bg-slate-500"
              style={{ border: "1px solid white" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type Node = {
  id?: string;
  name: string;
  nodes?: Node[];
};

const generateHash = (secret: any) => {
  return crypto.createHash("sha256").update(secret).digest("base64").toString();
};

const generateNodes = (nodes: Node[]): Node[] => {
  return nodes
    .map((node) => {
      const hashedNode: Node = {
        ...node,
        id: generateHash(node.name),
      };

      if (node.nodes && node.nodes.length > 0) {
        hashedNode.nodes = generateNodes(node.nodes);
      }

      return hashedNode;
    })
    .sort((a, b) => {
      if (a.nodes && !b.nodes) return -1; // Folders before files
      if (!a.nodes && b.nodes) return 1; // Files after folders
      return 0; // Maintain original order if both are files or both are folders
    });
};

const deleteNodeRecursively = (nodes: Node[], targetNode: Node): Node[] => {
  return nodes
    .map((node) => {
      if (node.id === targetNode.id) return null;
      if (node.nodes)
        node.nodes = deleteNodeRecursively(node.nodes, targetNode);
      return node;
    })
    .filter(Boolean) as Node[];
};

const addNodeRecursively = (
  nodes: Node[],
  parentNode: Node,
  newNode: Node
): Node[] => {
  return nodes.map((node) => {
    if (node.id === parentNode.id) {
      node.nodes = [...(node.nodes || []), newNode];
    } else if (node.nodes) {
      node.nodes = addNodeRecursively(node.nodes, parentNode, newNode);
    }
    return node;
  });
};

const initialNodes: Node[] = [
  {
    name: "Home",
    id: generateHash("Home"),
    nodes: [
      {
        name: "Movies",
        nodes: [
          {
            name: "Action",
            nodes: [
              {
                name: "2000s",
                nodes: [
                  { name: "Gladiator.mp4" },
                  { name: "The-Dark-Knight.mp4" },
                ],
              },
              { name: "2010s", nodes: [] },
            ],
          },
          {
            name: "Comedy",
            nodes: [{ name: "2000s", nodes: [{ name: "Superbad.mp4" }] }],
          },
          {
            name: "Drama",
            nodes: [
              { name: "2000s", nodes: [{ name: "American-Beauty.mp4" }] },
            ],
          },
        ],
      },
      {
        name: "Music",
        nodes: [
          { name: "Rock", nodes: [] },
          { name: "Classical", nodes: [] },
        ],
      },
      { name: "Pictures", nodes: [] },
      {
        name: "Documents",
        nodes: [],
      },
      { name: "passwords.txt" },
    ],
  },
];
