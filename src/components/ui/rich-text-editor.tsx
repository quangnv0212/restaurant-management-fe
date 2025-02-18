import { cn } from "@/lib/utils";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Button } from "./button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  className,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="flex gap-1 p-1 border-b">
        <Button
          variant="ghost"
          type="button"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 p-0", {
            "bg-secondary": editor.isActive("bold"),
          })}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8 p-0", {
            "bg-secondary": editor.isActive("italic"),
          })}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          type="button"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-8 w-8 p-0", {
            "bg-secondary": editor.isActive("bulletList"),
          })}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-8 w-8 p-0", {
            "bg-secondary": editor.isActive("orderedList"),
          })}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 outline-none focus:outline-none"
      />
    </div>
  );
};

export { RichTextEditor };
