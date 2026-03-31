import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { ArticleForm } from '@/components/admin/ArticleForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function EditarArtigoPage({ params }: Props) {
  const session = await auth()

  if (!session || session.user.role === 'VIEWER') {
    redirect('/admin/artigos')
  }

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id: params.id },
      include: { category: true, author: { select: { name: true } } },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!article) {
    notFound()
  }

  // WRITER só pode editar os próprios artigos
  if (session.user.role === 'WRITER' && article.authorId !== session.user.id) {
    redirect('/admin/artigos')
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          Editar artigo
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
          Última atualização: {article.updatedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          {' — '} por {article.author.name}
        </p>
      </div>

      <ArticleForm
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? '',
          content: article.content,
          metaTitle: article.metaTitle ?? '',
          metaDesc: article.metaDesc ?? '',
          status: article.status,
          featured: article.featured,
          categoryId: article.categoryId,
        }}
        categories={categories}
        userRole={session.user.role}
        authorId={session.user.id}
      />
    </div>
  )
}
