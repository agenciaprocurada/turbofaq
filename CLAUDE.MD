# Regras de Execução

## Autonomia vs. Consulta
- Age autonomamente em: nomes de variáveis, organização interna, utilitários menores.
- **Consulte antes** de: alterar >3 arquivos, mudar arquitetura/estrutura/padrões, instalar dependências, afetar APIs/rotas/contratos públicos.
- Ao concluir: informe resumidamente o que foi feito e por quê.

## Git
- Commit **antes** de qualquer modificação: `pre-task: [descrição]`
- Commit descritivo ao finalizar.
- Nunca: `git push --force`, `git rebase` sem confirmação, criar/renomear/deletar branches sem perguntar.
- **NUNCA fazer push para `main`** — somente se explicitamente solicitado.

## Comandos que exigem permissão (CRÍTICO)
- `rm -rf`, `sudo`, `curl`/`wget` com pipe para shell, `chmod 777`
- Destrutivos de banco: `DROP TABLE`, `supabase db reset`, `prisma migrate reset`
- `git push --force` / `--force-with-lease`
- Instalação de pacotes (`npm install`, `pip install`, `npx`) — liste nome, versão e motivo antes
- Qualquer acesso a `.env`, `.secret`, `*.key`

## Credenciais
- Nunca leia, logue ou inclua no código: `.env*`, `*.key`, `*.pem`.
- Nunca hardcode tokens/senhas — sempre variáveis de ambiente.
- Se precisar de env var: informe nome e finalidade, nunca o valor.

## Banco de Dados (Supabase)
- Sem comandos destrutivos sem confirmação.
- Alterações de schema → migrations, nunca direto.
- Migrations em produção → sinalizar e aguardar confirmação.
- Seeds → aprovação prévia.

## Dependências
- Antes de instalar: liste nome, versão, uso e se há alternativa já no projeto.
- Prefira dependências já existentes.

## Qualidade de Código
- Siga os padrões existentes (nomenclatura, estrutura, estilo).
- Não reformate arquivos fora do escopo da tarefa.
- Não remova comentários, console.logs ou código comentado sem perguntar.
- Problemas fora do escopo: reporte, não corrija.

## Segurança
Para tarefas envolvendo autenticação, pagamento, upload, banco de dados ou endpoints com dados de usuários: ler [@SECURITY.md](SECURITY.md) antes de implementar.
