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
