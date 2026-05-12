import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MessageSimple from './MessageSimple'

const MemoizedMessageGroup = ({ group, currentUserId, onLongPressMessage }) => {
  return (
    <View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {new Date(group.date_trunc).toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </Text>
      </View>
      {group.mensajes_list.map(message => (
        <MessageSimple
          key={message.id}
          message={message}
          isOwn={message.remitente === currentUserId}
          onLongPress={onLongPressMessage ? () => onLongPressMessage(message.id) : undefined}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  dateContainer: { alignItems: 'center', marginVertical: 12 },
  dateText: {
    fontSize: 12, color: '#888780',
    backgroundColor: '#F1EFE8',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 10, overflow: 'hidden'
  }
})

export default memo(MemoizedMessageGroup)