"use client";

import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { DocumentIcon, FolderIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Node = {
  id?: string;
  name: string;
  nodes?: Node[];
};

export function FilesystemItemAnimated({
  node,
  addNode,
  deleteNode,
  setContextMenu,
}: {
  node: Node;
  addNode: (type: "folder" | "file", parentNode: Node) => void;
  deleteNode: (targetNode: Node) => void;
  setContextMenu: (
    contextMenu: { x: number; y: number; node: Node | null } | null
  ) => void;
}) {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <li key={node.name}>
      <span
        className="flex items-center gap-1.5 py-1 cursor-pointer relative"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY, node });
        }}
      >
        {node.nodes && node.nodes.length > 0 && (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="flex p-1 -m-1"
          >
            <ChevronRightIcon className="size-4 text-gray-500" />
          </motion.span>
        )}

        {node.nodes ? (
          <FolderIcon
            className={`size-6 text-sky-500 ${
              node.nodes.length === 0 ? "ml-[22px]" : ""
            }`}
          />
        ) : (
          <DocumentIcon className="ml-[22px] size-6 text-gray-900" />
        )}
        {node.name}
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="pl-6 overflow-hidden flex flex-col justify-end"
          >
            {node.nodes?.map((node) => (
              <FilesystemItemAnimated
                node={node}
                key={node.name}
                addNode={addNode}
                deleteNode={deleteNode}
                setContextMenu={setContextMenu}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
