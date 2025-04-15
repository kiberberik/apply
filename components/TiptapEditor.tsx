'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import HardBreak from '@tiptap/extension-hard-break';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Button } from './ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Code,
  Strikethrough,
  Underline as UnderlineIcon,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const TiptapEditor = ({
  content,
  onChange,
  placeholder = 'Начните писать...',
}: TiptapEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: true,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg cursor-pointer transition-all hover:opacity-90',
        },
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      HardBreak.configure({
        keepMarks: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content) {
      const images = editor.view.dom.querySelectorAll('img');
      images.forEach((img: HTMLImageElement) => {
        if (!img.classList.contains('styled')) {
          img.classList.add('mx-auto', 'max-w-full', 'h-auto', 'rounded-lg', 'styled');
          img.style.display = 'block';
          img.style.margin = '1rem auto';
        }
      });
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const tempImg = document.createElement('img');
        tempImg.src = result;
        tempImg.style.display = 'block';
        tempImg.style.margin = '1rem auto';
        tempImg.classList.add('mx-auto', 'max-w-full', 'h-auto', 'rounded-lg', 'styled');

        editor.chain().focus().setImage({ src: result }).run();

        const image = editor.view.dom.querySelector(
          'img[src="' + result + '"]',
        ) as HTMLImageElement;
        if (image) {
          image.style.cssText = tempImg.style.cssText;
          image.className = tempImg.className;
        }

        editor.commands.focus();
        onChange(editor.getHTML());
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    setSelectedImage(img);
  };

  const handleImageResize = (scale: number) => {
    if (selectedImage) {
      const currentWidth = selectedImage.width;
      const newWidth = currentWidth * scale;
      selectedImage.style.width = `${newWidth}px`;
      selectedImage.style.height = 'auto';
      editor.commands.focus();
      onChange(editor.getHTML());
    }
  };

  const handleImageAlign = (align: 'left' | 'center' | 'right') => {
    if (selectedImage) {
      selectedImage.style.display = 'block';
      selectedImage.style.margin = '1rem auto';
      switch (align) {
        case 'left':
          selectedImage.style.marginLeft = '0';
          break;
        case 'center':
          selectedImage.style.margin = '1rem auto';
          break;
        case 'right':
          selectedImage.style.marginRight = '0';
          break;
      }
      editor.commands.focus();
      onChange(editor.getHTML());
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-slate-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-slate-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-slate-200' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-slate-200' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-slate-200' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-slate-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-slate-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-slate-200' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-slate-200' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200' : ''}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const url = window.prompt('URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={editor.isActive('link') ? 'bg-slate-200' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        {selectedImage && (
          <div className="ml-2 flex gap-2 border-l pl-2">
            <Button variant="outline" size="sm" onClick={() => handleImageResize(1.1)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleImageResize(0.9)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleImageAlign('left')}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleImageAlign('center')}>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleImageAlign('right')}>
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose max-w-none whitespace-pre-wrap"
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'IMG') {
            handleImageClick(e as React.MouseEvent<HTMLImageElement>);
          } else {
            setSelectedImage(null);
          }
        }}
      />
    </div>
  );
};

export default TiptapEditor;
