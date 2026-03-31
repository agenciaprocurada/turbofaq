import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const articleId = body?.articleId as string | undefined
  const helpful = body?.helpful as boolean | undefined

  if (!articleId || typeof articleId !== 'string') {
    return NextResponse.json({ error: 'articleId inválido' }, { status: 400 })
  }

  if (typeof helpful !== 'boolean') {
    return NextResponse.json({ error: 'helpful deve ser boolean' }, { status: 400 })
  }

  await prisma.article.update({
    where: { id: articleId },
    data: helpful
      ? { helpful: { increment: 1 } }
      : { notHelpful: { increment: 1 } },
  })

  return NextResponse.json({ ok: true })
}
