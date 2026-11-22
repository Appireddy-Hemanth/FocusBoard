function toLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseLocalDate(dateKey) {
  return dateKey ? new Date(`${dateKey}T00:00:00`) : null
}

export function analyzeTasks(tasks = []) {
  const todayKey = toLocalDateKey()
  const openTasks = tasks.filter(task => task.status !== 'Completed')
  const overdue = openTasks.filter(task => task.dueDate && task.dueDate < todayKey)
  const dueToday = openTasks.filter(task => task.dueDate === todayKey)
  const dueSoon = openTasks.filter(task => {
    if (!task.dueDate || task.dueDate <= todayKey) return false
    const due = parseLocalDate(task.dueDate)
    const today = parseLocalDate(todayKey)
    const difference = (due - today) / 86400000
    return difference <= 3
  })
  const completed = tasks.filter(task => task.status === 'Completed')

  const rank = { High: 0, Medium: 1, Low: 2 }
  const priorityOrder = [...openTasks].sort((a, b) => {
    const dueA = a.dueDate || '9999-12-31'
    const dueB = b.dueDate || '9999-12-31'
    if (dueA !== dueB) return dueA.localeCompare(dueB)
    return rank[a.priority] - rank[b.priority]
  })

  return { todayKey, openTasks, overdue, dueToday, dueSoon, completed, priorityOrder }
}

export function generateAssistantResponse(question, tasks = [], history = []) {
  const analysis = analyzeTasks(tasks)
  const normalized = question.trim().toLowerCase()
  const recommendations = []

  if (!normalized) throw new Error('Enter a question for the assistant.')

  if (normalized.includes('plan') || normalized.includes('today') || normalized.includes('work on')) {
    const workOrder = analysis.priorityOrder.slice(0, 4)
    recommendations.push(...workOrder.map((task, index) => {
      const urgent = task.dueDate && task.dueDate < analysis.todayKey
        ? 'Overdue'
        : task.dueDate === analysis.todayKey
          ? 'Due today'
          : `${task.priority} priority`
      return {
        taskId: task.id,
        title: task.title,
        reason: `${urgent}; recommended at position ${index + 1} because earlier deadlines and higher priority reduce schedule risk.`,
      }
    }))
    const focusMinutes = workOrder.length >= 3 ? 25 : 45
    return {
      text: workOrder.length
        ? `Here is a realistic daily plan using a ${focusMinutes}-minute focus rhythm. Start with the earliest deadline or highest priority, then re-check progress.`
        : 'There are no pending tasks, so use today for planning or choose a new task.',
      recommendations,
      focusMinutes,
      tone: 'plan',
    }
  }

  if (normalized.includes('overdue')) {
    recommendations.push(...analysis.overdue.map(task => ({
      taskId: task.id,
      title: task.title,
      reason: `Past the ${task.dueDate} deadline and still ${task.status.toLowerCase()}.`,
    })))
    return {
      text: analysis.overdue.length
        ? `You have ${analysis.overdue.length} overdue task${analysis.overdue.length === 1 ? '' : 's'}. Address these before starting lower-risk work.`
        : 'You have no overdue tasks.',
      recommendations,
      focusMinutes: analysis.overdue.length ? 25 : 45,
      tone: 'overdue',
    }
  }

  if (normalized.includes('deadline') || normalized.includes('approach')) {
    const deadlineTasks = [...analysis.dueToday, ...analysis.dueSoon]
    recommendations.push(...deadlineTasks.map(task => ({
      taskId: task.id,
      title: task.title,
      reason: task.dueDate === analysis.todayKey ? 'Due today.' : `Due soon on ${task.dueDate}.`,
    })))
    return {
      text: analysis.dueToday.length || analysis.dueSoon.length
        ? 'These pending tasks have deadlines today or within the next three days.'
        : 'No tasks are due today or within the next three days.',
      recommendations: [...analysis.dueToday, ...analysis.dueSoon].map(task => ({
        taskId: task.id,
        title: task.title,
        reason: task.dueDate === analysis.todayKey ? 'Due today.' : `Due soon on ${task.dueDate}.`,
      })),
      focusMinutes: 25,
      tone: 'deadline',
    }
  }

  if (normalized.includes('break') || normalized.includes('subtask')) {
    const candidate = analysis.priorityOrder[0]
    if (!candidate) {
      return { text: 'No pending task is available to break down.', recommendations: [], focusMinutes: 25, tone: 'breakdown' }
    }
    const title = candidate.title
    const suggested = [
      `Define the outcome for "${title}"`,
      'Identify the first concrete 25-minute action',
      'Complete the main work and record progress',
      'Review the result and mark the task complete',
    ]
    return {
      text: `Suggested breakdown for "${title}":`,
      recommendations: suggested.map((step, index) => ({
        taskId: candidate.id,
        title: step,
        reason: `Step ${index + 1} makes the remaining work concrete and measurable.`,
      })),
      focusMinutes: 25,
      tone: 'breakdown',
    }
  }

  if (normalized.includes('summary') || normalized.includes('progress')) {
    return {
      text: `${analysis.completed.length} of ${tasks.length} tasks are completed. ${analysis.openTasks.length} remain open, including ${analysis.overdue.length} overdue.`,
      recommendations: [
        {
          taskId: null,
          title: 'Review the next three deadlines',
          reason: 'A short planning pass reduces last-minute schedule risk.',
        },
        {
          taskId: null,
          title: 'Protect one focused work block',
          reason: 'Consistent focus blocks convert pending work into completed work.',
        },
      ],
      focusMinutes: analysis.openTasks.length >= 3 ? 25 : 45,
      tone: 'summary',
    }
  }

  if (normalized.includes('priority') || normalized.includes('prioritize')) {
    const workOrder = analysis.priorityOrder.slice(0, 5)
    return {
      text: 'The ranking below combines deadline urgency with task priority.',
      recommendations: workOrder.map((task, index) => ({
        taskId: task.id,
        title: task.title,
        reason: `${task.priority} priority; due ${task.dueDate || 'with no deadline'}; rank ${index + 1}.`,
      })),
      focusMinutes: workOrder.length >= 3 ? 25 : 45,
      tone: 'priority',
    }
  }

  const completedHistory = history.filter(item => item.message?.toLower?.().includes('completed')).length
  return {
    text: completedHistory
      ? 'Based on your recent activity, keep one protected focus block and avoid changing priorities mid-session.'
      : 'Try a daily plan, overdue review, priority ranking, or task breakdown prompt.',
    recommendations: [],
    focusMinutes: 25,
    tone: 'fallback',
  }
}
