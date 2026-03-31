import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const articleId = body?.articleId as string | undefined

  if (!articleId || typeof articleId !== 'string') {
    return NextResponse.json({ error: 'articleId inválido' }, { status: 400 })
  }

  // TODO: Rate limit por IP para evitar múltiplos incrementos do mesmo IP
  // no mesmo artigo dentro de 1 hora. Na Fase 1, aceitamos o incremento
  // simples sem controle de duplicidade para manter a implementação
  // sem dependência de cache externo (Redis/Upstash). O IP está disponível
  // via request.headers.get('x-forwarded-for') quando necessário.
  await prisma.article.update({
    where: { id: articleId },
    data: { views: { increment: 1 } },
  })

  return NextResponse.json({ ok: true })
}
