import { useDroppable } from '@dnd-kit/core'

interface Props {
  id: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function DroppableFolder({ id, children, className, onClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id
  })

  return (
    <li
      ref={setNodeRef}
      className={`${className} ${isOver ? 'folder-drop-active' : ''}`}
      onClick={onClick}
    >
      {children}
    </li>
  )
}
