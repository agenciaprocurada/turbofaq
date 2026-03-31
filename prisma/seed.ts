import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// ⚠️  SENHA TEMPORÁRIA — troque imediatamente após o primeiro login
const SEED_ADMIN_EMAIL = 'admin@turbocloud.com.br'
const SEED_ADMIN_PASSWORD = 'TurboAdmin@2026'

async function main() {
  // ─── Categorias ────────────────────────────────────────────────────────────

  const categories = [
    {
      name: 'Primeiros Passos',
      slug: 'primeiros-passos',
      description: 'Tudo que você precisa saber para começar com a TurboCloud.',
      icon: '🚀',
      order: 1,
      active: true,
    },
    {
      name: 'WordPress',
      slug: 'wordpress',
      description: 'Instalação, configuração e otimização do WordPress.',
      icon: '📝',
      order: 2,
      active: true,
    },
    {
      name: 'Domínios e DNS',
      slug: 'dominios-dns',
      description: 'Registro, transferência e configuração de domínios e DNS.',
      icon: '🌐',
      order: 3,
      active: true,
    },
    {
      name: 'E-mail',
      slug: 'email',
      description: 'Criação e configuração de contas de e-mail profissional.',
      icon: '✉️',
      order: 4,
      active: true,
    },
    {
      name: 'VPS e Projetos',
      slug: 'vps',
      description: 'Gerenciamento de servidores VPS e projetos de hospedagem.',
      icon: '🖥️',
      order: 5,
      active: true,
    },
    {
      name: 'Segurança e Backup',
      slug: 'seguranca-backup',
      description: 'Proteção do seu site e recuperação de dados.',
      icon: '🔒',
      order: 6,
      active: true,
    },
    {
      name: 'Faturamento',
      slug: 'faturamento',
      description: 'Planos, pagamentos, notas fiscais e cancelamentos.',
      icon: '💳',
      order: 7,
      active: true,
    },
    {
      name: 'Afiliados',
      slug: 'afiliados',
      description: 'Como funciona o programa de afiliados da TurboCloud.',
      icon: '🤝',
      order: 8,
      active: true,
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  console.log('✅ 8 categorias criadas/atualizadas.')

  // ─── Usuário SUPER_ADMIN inicial ───────────────────────────────────────────

  // Senha hasheada com bcrypt, 12 rounds — valor temporário para primeiro acesso
  const hashedPassword = await hash(SEED_ADMIN_PASSWORD, 12)

  await prisma.user.upsert({
    where: { email: SEED_ADMIN_EMAIL },
    update: {},                          // Não sobrescreve se já existir
    create: {
      email: SEED_ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN',
      active: true,
    },
  })

  console.log('✅ Usuário SUPER_ADMIN criado.')
  console.log('')
  console.log('┌─────────────────────────────────────────────────────┐')
  console.log('│  CREDENCIAIS INICIAIS DO PAINEL ADMIN               │')
  console.log('│                                                       │')
  console.log(`│  E-mail : ${SEED_ADMIN_EMAIL.padEnd(42)}│`)
  console.log(`│  Senha  : ${SEED_ADMIN_PASSWORD.padEnd(42)}│`)
  console.log('│                                                       │')
  console.log('│  ⚠️  TROQUE A SENHA IMEDIATAMENTE APÓS O PRIMEIRO    │')
  console.log('│     LOGIN EM /admin/usuarios                         │')
  console.log('└─────────────────────────────────────────────────────┘')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
