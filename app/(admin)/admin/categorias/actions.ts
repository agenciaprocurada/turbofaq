'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function checkPermission() {
  const session = await auth()
  if (!session || !['SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
    throw new Error('Sem permissão')
  }
}

export async function saveCategory(data: {
  id?: string
  name: string
  slug: string
  description?: string
  icon?: string
  active: boolean
}) {
  await checkPermission()

  if (data.id) {
    const updated = await prisma.category.update({
      where: { id: data.id },
      data,
    })
    revalidatePath('/ajuda')
    revalidatePath(`/admin/categorias`)
    return { success: true, category: updated }
  } else {
    // Definir 'order' como o último da lista se for novo
    const maxOrder = await prisma.category.aggregate({ _max: { order: true } })
    const created = await prisma.category.create({
      data: {
        ...data,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    })
    revalidatePath('/ajuda')
    revalidatePath(`/admin/categorias`)
    return { success: true, category: created }
  }
}

export async function reorderCategories(orderedIds: string[]) {
  await checkPermission()

  // Atualiza as categorias enviadas conforme o index da array
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { order: index + 1 },
      })
    )
  )

  revalidatePath('/ajuda')
  revalidatePath(`/admin/categorias`)
  return { success: true }
}
