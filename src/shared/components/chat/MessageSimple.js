import { memo } from 'react'

const MessageSimple = ({ message, isOwn }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: 4,
      paddingHorizontal: 12
    }}>
      <div style={{
        maxWidth: '75%',
        backgroundColor: isOwn ? '#DCF8C6' : '#FFFFFF',
        borderRadius: 8,
        padding: '8px 12px',
        borderBottomRightRadius: isOwn ? 0 : 8,
        borderBottomLeftRadius: isOwn ? 8 : 0,
      }}>
        <p style={{ margin: 0, fontSize: 14, color: '#2C2C2A' }}>
          {message.body}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: '#888780', textAlign: 'right', marginTop: 2 }}>
          {new Date(message.created_at).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}

export default memo(MessageSimple)