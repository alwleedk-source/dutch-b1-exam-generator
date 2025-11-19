import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { cleanPastedText } from '@/lib/textCleaner';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Plak of typ hier je Nederlandse tekst...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] max-w-none p-4',
      },
      // Handle paste event to clean text
      handlePaste: (view, event) => {
        const html = event.clipboardData?.getData('text/html');
        const text = event.clipboardData?.getData('text/plain');

        if (html) {
          // Clean HTML content
          const cleaned = cleanPastedText(html);
          editor?.commands.insertContent(cleaned);
          event.preventDefault();
          return true;
        } else if (text) {
          // Clean plain text
          const cleaned = cleanPastedText(text);
          editor?.commands.insertContent(cleaned);
          event.preventDefault();
          return true;
        }

        return false;
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className={`border rounded-lg overflow-hidden ${className || ''}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
