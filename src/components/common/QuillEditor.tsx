import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder || 'Write something...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ header: [2, 3, false] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'blockquote'],
          ['clean'],
        ],
      },
    });

    if (value) {
      quill.root.innerHTML = value;
    }

    quill.on('text-change', () => {
      onChange(quill.root.innerHTML);
    });

    quillRef.current = quill;
  }, []);

  return <div ref={containerRef} />;
}
