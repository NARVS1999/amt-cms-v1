'use client';

import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface BlogEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export function BlogEditor({ value, onChange }: BlogEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic'],
          [{ header: [2, 3, false] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
        ],
      },
    });

    quill.on('text-change', () => {
      isInternalChange.current = true;
      onChange(quill.root.innerHTML);
    });

    quillRef.current = quill;

    return () => {
      quillRef.current = null;
    };
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (quill && !isInternalChange.current) {
      if (quill.root.innerHTML !== value) {
        quill.root.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  return (
    <div className="blog-editor">
      <div ref={containerRef} />
    </div>
  );
}
