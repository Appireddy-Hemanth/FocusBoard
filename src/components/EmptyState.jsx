export default function EmptyState({
  title = 'No tasks found',
  description = 'Try changing your search or filters.',
}) {
  return (
    <div className="empty-state" role="status">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}
