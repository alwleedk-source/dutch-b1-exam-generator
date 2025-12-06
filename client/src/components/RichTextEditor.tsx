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
  preserveFormatting?: boolean; // New option to preserve original formatting
  onImagePaste?: (file: File) => void; // Callback for image paste
}

export function RichTextEditor({ value, onChange, placeholder, className, preserveFormatting = false, onImagePaste }: RichTextEditorProps) {
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
      // Handle paste event
      handlePaste: (view: any, event: ClipboardEvent): boolean => {
        // 1. Check for images first
        const files = Array.from(event.clipboardData?.files || []);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
          // Handle image paste
          event.preventDefault();

          if (onImagePaste) {
            // Pass image to parent component for handling
            onImagePaste(imageFile);
          } else {
            // Fallback: show message
            console.warn('Image pasted but no onImagePaste handler provided');
          }

          return true;
        }

        // 2. Handle text/HTML paste as before
        const html = event.clipboardData?.getData('text/html');
        const text = event.clipboardData?.getData('text/plain');

        if (preserveFormatting) {
          // Preserve original formatting (paragraphs, line breaks, etc.)
          if (html) {
            // Keep basic HTML structure but remove dangerous tags
            const cleaned = html
              .replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/<style[^>]*>.*?<\/style>/gi, '')
              .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
            editor?.commands.insertContent(cleaned);
            event.preventDefault();
            return true;
          } else if (text) {
            // Preserve line breaks and paragraphs
            const formatted = text
              .split('\n\n')
              .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
              .join('');
            editor?.commands.insertContent(formatted);
            event.preventDefault();
            return true;
          }
        } else {
          // Clean text (remove all formatting)
          if (html) {
            const cleaned = cleanPastedText(html);
            editor?.commands.insertContent(cleaned);
            event.preventDefault();
            return true;
          } else if (text) {
            const cleaned = cleanPastedText(text);
            editor?.commands.insertContent(cleaned);
            event.preventDefault();
            return true;
          }
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
