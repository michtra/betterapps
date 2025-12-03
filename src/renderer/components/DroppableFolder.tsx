import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  id: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  sortable?: boolean
}

export function DroppableFolder({ id, children, className, onClick, sortable = false }: Props) {
  const droppable = useDroppable({
    id
  })

  const sortableProps = useSortable({
    id,
    disabled: !sortable
  })

  const { setNodeRef, isOver } = sortable ? sortableProps : droppable

  const style = sortable ? {
    transform: CSS.Transform.toString(sortableProps.transform),
    transition: sortableProps.transition,
    opacity: sortableProps.isDragging ? 0.5 : 1,
  } : {}

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${className} ${isOver ? 'folder-drop-active' : ''}`}
      onClick={onClick}
      {...(sortable ? sortableProps.attributes : {})}
      {...(sortable ? sortableProps.listeners : {})}
    >
      {children}
    </li>
  )
}
