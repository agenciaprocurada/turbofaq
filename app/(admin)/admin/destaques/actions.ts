'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'
import { slugify } from '@/lib/slugify'

export async function getHighlights() {
  return prisma.highlight.findMany({
    orderBy: { order: 'asc' },
    include: {
      article: { select: { id: true, title: true, slug: true, category: { select: { slug: true } } } }
    }
  })
}

export async function saveHighlight(data: {
  id?: string
  imageUrl: string
  articleId: string
  order: number
  active: boolean
}) {
  const session = await auth()
  if (!session || session.user.role === 'VIEWER') throw new Error('Não autorizado')

  if (data.id) {
    await prisma.highlight.update({
      where: { id: data.id },
      data: {
        imageUrl: data.imageUrl,
        articleId: data.articleId,
        order: data.order,
        active: data.active,
      }
    })
  } else {
    await prisma.highlight.create({
      data: {
        id: randomBytes(6).toString('hex'),
        imageUrl: data.imageUrl,
        articleId: data.articleId,
        order: data.order,
        active: data.active,
      }
    })
  }

  revalidatePath('/')
  revalidatePath('/admin/destaques')
}

export async function deleteHighlight(id: string) {
  const session = await auth()
  if (!session || session.user.role === 'VIEWER') throw new Error('Não autorizado')

  await prisma.highlight.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/destaques')
}

export async function uploadHighlightImage(formData: FormData): Promise<string> {
  const session = await auth()
  if (!session || session.user.role === 'VIEWER') throw new Error('Não autorizado')

  const file = formData.get('file') as File
  if (!file) throw new Error('Nenhum arquivo enviado.')

  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido.')
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const name = slugify(file.name.replace(/\.[^.]+$/, ''))
  const hash = randomBytes(3).toString('hex')
  const filename = `${name}-${hash}.${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'highlights')

  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

  return `/uploads/highlights/${filename}`
}

export async function getPublishedArticlesForSelect() {
  return prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { title: 'asc' },
    select: { id: true, title: true, slug: true, category: { select: { slug: true } } }
  })
}
