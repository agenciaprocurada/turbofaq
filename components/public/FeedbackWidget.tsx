'use client'

import { useState, useEffect } from 'react'

interface Props {
  articleId: string
}

type State = 'idle' | 'submitting' | 'done'

export default function FeedbackWidget({ articleId }: Props) {
  const [widgetState, setWidgetState] = useState<State>('idle')

  // Verifica se o usuário já votou nesta sessão
  useEffect(() => {
    if (sessionStorage.getItem(`feedback_${articleId}`)) {
      setWidgetState('done')
    }
  }, [articleId])

  async function handleVote(helpful: boolean) {
    if (widgetState !== 'idle') return

    setWidgetState('submitting')

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, helpful }),
      })
    } catch {
      // Falha silenciosa — feedback não é crítico
    }

    sessionStorage.setItem(`feedback_${articleId}`, '1')
    setWidgetState('done')
  }

  if (widgetState === 'done') {
    return (
      <div className="feedback-widget feedback-widget--done">
        <p className="feedback-widget__thanks">
          Obrigado pelo seu feedback!
        </p>
      </div>
    )
  }

  return (
    <div className="feedback-widget">
      <p className="feedback-widget__question">Este artigo foi útil?</p>
      <div className="feedback-widget__actions">
        <button
          type="button"
          className="feedback-widget__btn feedback-widget__btn--yes"
          onClick={() => handleVote(true)}
          disabled={widgetState === 'submitting'}
          aria-label="Sim, este artigo foi útil"
        >
          👍 Sim
        </button>
        <button
          type="button"
          className="feedback-widget__btn feedback-widget__btn--no"
          onClick={() => handleVote(false)}
          disabled={widgetState === 'submitting'}
          aria-label="Não, este artigo não foi útil"
        >
          👎 Não
        </button>
      </div>
    </div>
  )
}
