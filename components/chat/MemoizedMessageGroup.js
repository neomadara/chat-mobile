import { memo } from 'react'
import MessageSimple from './MessageSimple'

const MemoizedMessageGroup = ({ group, currentUserId }) => {
  return (
    <div>
      <div style={{
        textAlign: 'center',
        marginVertical: 12
      }}>
        <span style={{
          fontSize: 12,
          color: '#888780',
          backgroundColor: '#F1EFE8',
          padding: '4px 12px',
          borderRadius: 10
        }}>
          {new Date(group.date_trunc).toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </span>
      </div>
      {group.mensajes_list.map(message => (
        <MessageSimple
          key={message.id}
          message={message}
          isOwn={message.remitente === currentUserId}
        />
      ))}
    </div>
  )
}

export default memo(MemoizedMessageGroup)