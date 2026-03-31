/**
 * Gera um slug URL-friendly a partir de um texto qualquer.
 * Regras: lowercase, sem acentos, sem caracteres especiais,
 * espaços viram hífens, máximo 60 caracteres.
 *
 * Conforme README seção 9 — fonte única da verdade para slugs.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')      // remove especiais
    .trim()
    .replace(/\s+/g, '-')              // espaços → hífens
    .replace(/-+/g, '-')               // hífens duplos → simples
    .slice(0, 60)                       // máximo 60 chars
}
