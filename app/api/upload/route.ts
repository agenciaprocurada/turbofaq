import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'
import { slugify } from '@/lib/slugify'

export async function POST(request: Request) {
  const session = await auth()

  if (!session || session.user.role === 'VIEWER') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    // Validação de tipo MIME e tamanho max 5MB (também restrito no next.config.js)
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem muito pesada (Mínimo de 5MB permitidos).' }, { status: 400 })
    }

    // Extrai extensão e nome base
    const filenameParts = file.name.split('.')
    const ext = filenameParts.pop() || 'jpg'
    const nameWithoutExt = filenameParts.join('.')
    
    // Sluggify e Hash 6 caracteres
    const slugName = slugify(nameWithoutExt)
    const hash = randomBytes(3).toString('hex')
    const finalFilename = `${slugName}-${hash}.${ext}`

    // Organizar por Ano e Mês
    const date = new Date()
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'images', year, month)
    
    // Garantir que diretório exista
    await mkdir(uploadDir, { recursive: true })

    const filePath = join(uploadDir, finalFilename)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Escrever arquivo no disco
    await writeFile(filePath, buffer)

    // Retorna URL pública do artigo
    const publicUrl = `/uploads/images/${year}/${month}/${finalFilename}`

    return NextResponse.json({ url: publicUrl })

  } catch (err: any) {
    console.error('Upload falhou:', err)
    return NextResponse.json({ error: 'Falha no upload de imagem.' }, { status: 500 })
  }
}
