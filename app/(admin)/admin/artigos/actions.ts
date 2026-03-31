'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ArticleStatus } from '@prisma/client'

export async function saveArticle(data: {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string
  metaTitle: string
  metaDesc: string
  status: ArticleStatus
  featured: boolean
  categoryId: string
  authorId: string
}) {
  const session = await auth()

  if (!session || session.user.role === 'VIEWER') {
    throw new Error('Não autorizado')
  }

  // Verifica permissão para publicar
  if (data.status === 'PUBLISHED' && session.user.role === 'WRITER') {
    throw new Error('Somente Editores ou Super Admins podem publicar artigos.')
  }

  // Se houver ID, é atualização. Senão, é criação
  if (data.id) {
    // Para WRITER, verifica se ele é o autor original
    if (session.user.role === 'WRITER') {
      const existing = await prisma.article.findUnique({
        where: { id: data.id },
        select: { authorId: true },
      })
      if (!existing || existing.authorId !== session.user.id) {
        throw new Error('Você só pode editar seus próprios artigos.')
      }
    }

    const updated = await prisma.article.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        status: data.status,
        featured: data.featured,
        categoryId: data.categoryId,
        ...(data.status === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
      },
    })
    
    // Invalida cache da categoria desse artigo, hub e artigo em si
    revalidatePath('/ajuda')
    revalidatePath(`/admin/artigos`)
    revalidatePath(`/ajuda/[categoria]`, 'page')
    revalidatePath(`/ajuda/[categoria]/[slug]`, 'page')

    return { success: true, articleId: updated.id }
  } else {
    const created = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        status: data.status,
        featured: data.featured,
        categoryId: data.categoryId,
        authorId: data.authorId,
        ...(data.status === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
      },
    })

    revalidatePath('/ajuda')
    revalidatePath(`/admin/artigos`)
    revalidatePath(`/ajuda/[categoria]`, 'page')

    return { success: true, articleId: created.id }
  }
}
