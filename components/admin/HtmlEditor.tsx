"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export function HtmlEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  return (
    <div>
      <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
        {label}
      </span>
      <div className="mt-2 border-2 border-black [&_.ProseMirror]:min-h-40 [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-3 [&_.ProseMirror]:outline-none [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_p]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5">
        <div className="flex flex-wrap gap-1 border-b-2 border-black p-2">
          <Tool active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
            Bold
          </Tool>
          <Tool active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            Italic
          </Tool>
          <Tool active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
            Heading
          </Tool>
          <Tool active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            List
          </Tool>
          <Tool active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            Numbered
          </Tool>
        </div>
        <EditorContent editor={editor} style={{ fontFamily: sans }} />
      </div>
    </div>
  );
}

function Tool({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-2 border-black px-2 py-1 text-[11px] uppercase tracking-[0.12em] ${active ? "bg-[#FFD200]" : "bg-white"}`}
      style={{ fontFamily: mono }}
    >
      {children}
    </button>
  );
}
