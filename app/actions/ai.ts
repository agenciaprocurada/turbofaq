'use server'

import { auth } from '@/lib/auth'
import { GoogleGenAI, Type, Schema } from '@google/genai'

export async function askGeminiReview(
  instructions: string, 
  title: string, 
  slug: string, 
  excerpt: string, 
  content: string
) {
  const session = await auth()
  if (!session || session.user.role === 'VIEWER') {
    throw new Error('Não autorizado')
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Chave de API do Gemini não configurada no servidor (GEMINI_API_KEY).')
  }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `
Você é um editor técnico de alto nível especialista em marketing de conteúdo, SEO e documentação de software.
Foi solicitado que você revise um artigo da base de conhecimento da empresa.

INSTRUÇÕES DO USUÁRIO PARA A REVISÃO:
"${instructions}"

ABAIXO ESTÁ O CONTEÚDO ATUAL DO ARTIGO:
Título: ${title}
Slug: ${slug}
Resumo/Excerpt: ${excerpt}

Conteúdo HTML:
${content}

SUA TAREFA:
Aplique RIGOROSAMENTE as instruções dadas pelo usuário no conteúdo.
Atenção especial ao conteúdo HTML principal: mantenha as tags HTML relevantes (h2, p, ul, strong, a, img), não remova imagens e não altere a estrutura sem necessidade, mas corrija erros ortográficos, otimize a legibilidade e cumpra a instrução acima!
Se a instrução for para alterar o nome da empresa, altere no texto inteiro.
Revise o Título para que fique atrativo e claro como um tutorial de documentação.
Mantenha o SEO e refaça o Resumo se necessário de forma cativante (max 160 chars).
Sempre garanta que o retorno siga fielmente em Português do Brasil (PT-BR) a não ser que a instrução diga o contrário.
  `

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'O novo título revisado (claro, gramaticalmente correto, otimizado para central de ajuda)'
      },
      slug: {
        type: Type.STRING,
        description: 'O novo slug formatado (apenas hífens e letras minúsculas sem acentuação)'
      },
      excerpt: {
        type: Type.STRING,
        description: 'O novo resumo curto otimizado para meta description/SEO (máx 160 caracteres)'
      },
      content: {
        type: Type.STRING,
        description: 'O HTML do conteúdo revisado aplicando com precisão a instrução do usuário e corrigindo a gramática e coesão, preservando a semântica de tags.'
      }
    },
    required: ['title', 'slug', 'excerpt', 'content'],
  }

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2, // Precisão e menos invenção proativa
      }
    })

    if (!result.text) {
      throw new Error('Resposta vazia da IA')
    }

    return JSON.parse(result.text)
  } catch (err: any) {
    throw new Error('Falha na comunicação com a API do Gemini: ' + err.message)
  }
}
