import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const MessageSimple = ({ message, isOwn }) => {
  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={styles.body}>{message.body}</Text>
        <Text style={styles.time}>
          {new Date(message.created_at).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 4, paddingHorizontal: 12 },
  rowOwn: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8
  },
  bubbleOwn: { backgroundColor: '#DCF8C6', borderBottomRightRadius: 0 },
  bubbleOther: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 0 },
  body: { fontSize: 14, color: '#2C2C2A' },
  time: { fontSize: 11, color: '#888780', textAlign: 'right', marginTop: 2 }
})

export default memo(MessageSimple)