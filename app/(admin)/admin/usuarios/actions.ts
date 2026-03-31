'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'
import type { UserRole } from '@prisma/client'

async function checkSuperAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Sem permissão')
  }
}

export async function saveUser(data: {
  id?: string
  name: string
  email: string
  password?: string
  role: UserRole
  active: boolean
}) {
  await checkSuperAdmin()

  // Se for e-mail já existente
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing && existing.id !== data.id) {
    throw new Error('Já existe um usuário com este e-mail.')
  }

  if (data.id) {
    // Atualização
    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      active: data.active,
    }

    if (data.password) {
      updateData.password = await hash(data.password, 10)
    }

    await prisma.user.update({
      where: { id: data.id },
      data: updateData,
    })
  } else {
    // Criação
    if (!data.password) {
      throw new Error('A senha é obrigatória para criar um usuário.')
    }
    const hashedPassword = await hash(data.password, 10)

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        active: data.active,
      },
    })
  }

  revalidatePath(`/admin/usuarios`)
  return { success: true }
}
