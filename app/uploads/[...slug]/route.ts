import { NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'
import fs from 'fs'

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  const slugArray = params.slug || []
  
  if (slugArray.length === 0) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Combina o slug para formar o caminho do arquivo físico onde as imagens são salvas
  // CWD /public/uploads/... (que é montado no EasyPanel)
  const filePath = join(process.cwd(), 'public', 'uploads', ...slugArray)

  try {
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File Not Found', { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    
    // Identificar a extensão para colocar o Content-Type correto
    const ext = slugArray[slugArray.length - 1].split('.').pop()?.toLowerCase()
    
    let contentType = 'image/jpeg'
    if (ext === 'png') contentType = 'image/png'
    else if (ext === 'gif') contentType = 'image/gif'
    else if (ext === 'webp') contentType = 'image/webp'
    else if (ext === 'svg') contentType = 'image/svg+xml'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })

  } catch (err) {
    console.error('Error serving file:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
