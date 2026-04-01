'use server'

import { auth } from '@/lib/auth'
import { readdir, stat, unlink } from 'fs/promises'
import { join, relative } from 'path'
import { existsSync } from 'fs'

export interface MediaFile {
  url: string
  name: string
  size: number
  date: Date
  pathFragment: string
}

async function getFilesRecursively(dir: string, fileList: string[] = []): Promise<string[]> {
  if (!existsSync(dir)) return fileList
  const files = await readdir(dir, { withFileTypes: true })
  
  for (const file of files) {
    if (file.isDirectory()) {
      await getFilesRecursively(join(dir, file.name), fileList)
    } else {
      fileList.push(join(dir, file.name))
    }
  }
  return fileList
}

export async function fetchAllMedia(): Promise<MediaFile[]> {
  const session = await auth()
  if (!session || session.user.role === 'VIEWER') {
    throw new Error('Não autorizado')
  }

  const baseUploadDir = join(process.cwd(), 'public', 'uploads', 'images')
  const allFiles = await getFilesRecursively(baseUploadDir)

  const medias = await Promise.all(allFiles.map(async (filePath) => {
    const fileStat = await stat(filePath)
    
    // Relative ex: "2026\03\file.jpg"
    const relPath = relative(baseUploadDir, filePath)
    
    // Linux/Windows compat (substitui \ por /)
    const relSlash = relPath.replace(/\\/g, '/')
    
    return {
      url: `/uploads/images/${relSlash}`,
      name: relSlash.split('/').pop() || 'Arquivo',
      size: fileStat.size,
      date: fileStat.mtime,
      pathFragment: relSlash
    }
  }))

  // Ordena pelas mais recentes
  return medias.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export async function deleteMedias(pathFragments: string[]) {
  const session = await auth()
  if (!session || session.user.role === 'VIEWER') {
    throw new Error('Permissão negada.')
  }

  const baseUploadDir = join(process.cwd(), 'public', 'uploads', 'images')
  
  for (const frag of pathFragments) {
    // Validação de segurança para não subir na estrutura (Directory Traversal)
    if (frag.includes('..')) continue

    const filePath = join(baseUploadDir, frag)
    try {
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    } catch(err) {
      console.error('Falha ao apagar arquivo:', frag)
    }
  }

  return { success: true }
}

/**
 * Converte uma imagem para WebP (qualidade 85%) e substitui o caminho antigo
 * em todos os artigos que a referenciam no banco de dados.
 */
export async function convertToWebp(pathFragment: string): Promise<{ newUrl: string; updatedArticles: number }> {
  const session = await auth()
  if (!session || session.user.role === 'VIEWER') {
    throw new Error('Permissão negada.')
  }

  // Rejeita tentativas de path traversal
  if (pathFragment.includes('..')) {
    throw new Error('Caminho inválido.')
  }

  // Lazy-import do sharp e prisma (evita bundling incorreto)
  const sharp = (await import('sharp')).default
  const { prisma } = await import('@/lib/prisma')
  const { writeFile, unlink } = await import('fs/promises')
  const { join, parse, dirname } = await import('path')
  const { existsSync } = await import('fs')

  const baseUploadDir = join(process.cwd(), 'public', 'uploads', 'images')
  const originalPath = join(baseUploadDir, pathFragment)

  if (!existsSync(originalPath)) {
    throw new Error('Arquivo não encontrado no servidor.')
  }

  // Se já for WebP, não converte de novo
  if (pathFragment.toLowerCase().endsWith('.webp')) {
    throw new Error('Esta imagem já está em formato WebP.')
  }

  // Gera novo caminho com extensão .webp
  const parsed = parse(originalPath)
  const webpFilename = parsed.name + '.webp'
  const webpPath = join(parsed.dir, webpFilename)

  // Cria o fragmento relativo do novo arquivo
  const relDir = dirname(pathFragment)
  const newPathFragment = (relDir === '.' ? '' : relDir + '/') + webpFilename
  const oldUrl = `/uploads/images/${pathFragment}`
  const newUrl = `/uploads/images/${newPathFragment}`

  // Converte com sharp
  const webpBuffer = await sharp(originalPath)
    .webp({ quality: 85 })
    .toBuffer()

  // Salva o novo arquivo .webp
  await writeFile(webpPath, webpBuffer)

  // Substitui referência em TODOS os artigos que contêm a URL antiga
  const articlesWithOldUrl = await prisma.article.findMany({
    where: {
      OR: [
        { content: { contains: oldUrl } },
        { excerpt: { contains: oldUrl } },
      ]
    },
    select: { id: true, content: true, excerpt: true }
  })

  let updatedArticles = 0
  for (const article of articlesWithOldUrl) {
    await prisma.article.update({
      where: { id: article.id },
      data: {
        content: article.content.replaceAll(oldUrl, newUrl),
        excerpt: article.excerpt?.replaceAll(oldUrl, newUrl) ?? article.excerpt,
      }
    })
    updatedArticles++
  }

  // Remove o arquivo original após conversão bem-sucedida
  try {
    await unlink(originalPath)
  } catch {
    // Não é crítico se falhar ao remover o original
  }

  return { newUrl, updatedArticles }
}

