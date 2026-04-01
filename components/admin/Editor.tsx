'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

interface EditorProps {
  content: string
  onChange: (html: string) => void
}

export function Editor({ content, onChange }: EditorProps) {
  const [showHtml, setShowHtml] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content prose prose-sm sm:prose-base focus:outline-none',
        style: 'min-height: 400px; padding: 20px; border: 1px solid var(--color-border); border-radius: 0 0 8px 8px; backgroundColor: var(--bg-card);',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link', previousUrl)
    if (url === null) {
      return
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp,image/gif'
    input.style.display = 'none'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          const { error } = await response.json()
          throw new Error(error || 'Erro no upload')
        }

        const data = await response.json()
        editor.chain().focus().setImage({ src: data.url }).run()
      } catch (err: any) {
        alert(err.message || 'Erro inesperado')
      }
    }

    document.body.appendChild(input)
    input.click()
    input.remove()
  }

  return (
    <div className="tiptap-wrapper" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Menu do Editor */}
      <div
        className="tiptap-menu"
        style={{
          display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '10px 14px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <MenuButton
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          tooltip="Negrito (Cmd+B)"
        >
          <strong>B</strong>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          tooltip="Itálico (Cmd+I)"
        >
          <em>I</em>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          tooltip="Tachado"
        >
          <s>S</s>
        </MenuButton>
        
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 8px' }} />

        <MenuButton
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </MenuButton>
        <MenuButton
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </MenuButton>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 8px' }} />

        <MenuButton
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Lista
        </MenuButton>
        <MenuButton
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Lista
        </MenuButton>
        <MenuButton
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &quot; Citação
        </MenuButton>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 8px' }} />

        <MenuButton isActive={editor.isActive('link')} onClick={addLink}>
          🔗 Link
        </MenuButton>
        {/* Usamos image por URL aqui, mas uploads complexos também podem ser integrados chamando a /api/upload e injetando a URL no set image */}
        <MenuButton isActive={false} onClick={addImage}>
          🖼️ Imagem
        </MenuButton>

        <div style={{ flex: 1 }} />
        <MenuButton 
          isActive={showHtml}
          onClick={() => {
            if (showHtml) {
              editor.commands.setContent(content)
            }
            setShowHtml(!showHtml)
          }}
          tooltip="Editar HTML Fonte"
        >
          {showHtml ? '</> Fechar HTML' : '</> Ver HTML'}
        </MenuButton>

      </div>
      
      {/* Área de conteúdo do Editor */}
      {showHtml ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          style={{ 
            minHeight: '400px', width: '100%', padding: '20px', 
            fontFamily: 'monospace', fontSize: '13px', 
            border: '1px solid var(--color-border)', 
            borderRadius: '0 0 8px 8px', 
            backgroundColor: 'var(--bg-card)', 
            color: 'var(--text-primary)',
            outline: 'none', resize: 'vertical'
          }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  )
}

function MenuButton({
  children,
  onClick,
  isActive,
  tooltip,
}: {
  children: React.ReactNode
  onClick: () => void
  isActive: boolean
  tooltip?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      style={{
        padding: '6px 10px',
        backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
        color: isActive ? 'var(--color-primary-dark)' : 'var(--text-secondary)',
        border: '1px solid transparent',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {children}
    </button>
  )
}
