import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Sparkles, Trash2 } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'
import { generateAssistantResponse } from '../utils/assistantEngine'

const CHAT_KEY = 'focusboard_assistant_chat_v1'

function loadMessages() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function AssistantView({ onEditTask }) {
  const {
    tasks,
    activity,
    highPriorityOpenTasks,
  } = useTaskContext()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState(loadMessages)
  const [planChoices, setPlanChoices] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('focusboard_plan_choices_v1') || '{}')
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  })
  const messageEndRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(messages))
    } catch {
      // Chat remains usable for the current session if storage is unavailable.
    }
  }, [messages])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages, loading])

  const highPriority = useMemo(
    () => highPriorityOpenTasks ||
      tasks.filter(task => task.priority === 'High' && task.status !== 'Completed'),
    [highPriorityOpenTasks, tasks],
  )

  const answerQuestion = question => {
    const text = question.trim()
    if (!text) {
      setError('Enter a question or choose a suggested prompt.')
      return
    }

    setError('')
    setLoading(true)
    setMessages(current => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text },
    ])

    window.setTimeout(() => {
      try {
        const response = generateAssistantResponse(text, tasks, activity)
        setMessages(current => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: response.text,
            recommendations: response.recommendations,
            focusMinutes: response.focusMinutes,
          },
        ])
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Could not generate recommendations.')
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  const submit = event => {
    event.preventDefault()
    answerQuestion(input)
    setInput('')
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  const chooseRecommendation = (taskId, choice) => {
    if (!taskId) return
    setPlanChoices(current => {
      const next = { ...current, [taskId]: choice }
      localStorage.setItem('focusboard_plan_choices_v1', JSON.stringify(next))
      return next
    })
  }

  const prompts = [
    'Plan my day.',
    'Find my overdue tasks.',
    'What should I prioritize?',
    'Break down a large task.',
    'Show my productivity summary.',
  ]

  return (
    <main className="main view-main" id="assistant">
      <header className="view-header">
        <div><p className="eyebrow">Local recommendations</p><h1>AI Productivity Assistant</h1></div>
        {messages.length > 0 && (
          <button type="button" className="secondary-button" onClick={clearChat}>
            <Trash2 size={16} />Clear chat
          </button>
        )}
      </header>
      <section className="assistant-layout">
        <article className="assistant-chat">
          <div className="assistant-banner">
            <span><Sparkles size={18} /></span>
            <div><strong>Focus Assistant</strong><small>Local rule-based recommendations</small></div>
          </div>
          <div className="assistant-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="assistant-empty">
                <Sparkles size={24} />
                <strong>Start with a productivity prompt</strong>
                <p>Recommendations use your real tasks and due dates.</p>
              </div>
            )}
            {messages.map(message => (
              <div key={message.id} className={`assistant-message ${message.role}`}>
                <span>{message.text}</span>
                {message.recommendations?.length > 0 && (
                  <ol className="assistant-recommendations">
                    {message.recommendations.map((recommendation, index) => (
                      <li key={`${recommendation.taskId || 'step'}-${index}`}>
                        {recommendation.taskId ? (
                          <button type="button" onClick={() => {
                            const task = tasks.find(item => item.id === recommendation.taskId)
                            if (task) onEditTask(task)
                          }}>
                            {recommendation.title}
                          </button>
                        ) : <strong>{recommendation.title}</strong>}
                        <small>{recommendation.reason}</small>
                        {recommendation.taskId && (
                          <span className="plan-choice-actions">
                            <button type="button" onClick={() => chooseRecommendation(recommendation.taskId, 'accepted')}>
                              {planChoices[recommendation.taskId] === 'accepted' ? 'Accepted' : 'Accept'}
                            </button>
                            <button type="button" onClick={() => chooseRecommendation(recommendation.taskId, 'rejected')}>
                              {planChoices[recommendation.taskId] === 'rejected' ? 'Rejected' : 'Reject'}
                            </button>
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
                {message.focusMinutes && (
                  <small className="assistant-focus">Suggested focus block: {message.focusMinutes} minutes</small>
                )}
              </div>
            ))}
            {loading && (
              <div className="assistant-message assistant" role="status">
                Analyzing your tasks…
              </div>
            )}
            {error && <div className="assistant-error" role="alert">{error}</div>}
            <div ref={messageEndRef} />
          </div>
          <div className="assistant-prompts">
            {prompts.map(prompt => (
              <button type="button" key={prompt} onClick={() => answerQuestion(prompt)} disabled={loading}>
                {prompt}
              </button>
            ))}
          </div>
          <form className="assistant-input" onSubmit={submit}>
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder="Ask about your tasks..."
              aria-label="Ask productivity assistant"
            />
            <button type="submit" aria-label="Send message" disabled={loading}>
              <Send size={18} />
            </button>
          </form>
        </article>
        <aside className="assistant-insights">
          <h2>Open high-priority tasks</h2>
          {highPriority.slice(0, 5).map(task => (
            <button type="button" key={task.id} onClick={() => onEditTask(task)}>
              <span>{task.title}</span>
              <small>{task.status}</small>
            </button>
          ))}
          {highPriority.length === 0 && <p>Nothing urgent is open.</p>}
        </aside>
      </section>
    </main>
  )
}
