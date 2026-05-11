import { useState } from 'react'
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native'

const MAX_CHARS = 300

const InputChatBox = ({ onSend, disabled }) => {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje..."
        placeholderTextColor="#888780"
        value={text}
        onChangeText={t => t.length <= MAX_CHARS && setText(t)}
        multiline
        maxLength={MAX_CHARS}
      />
      {text.length > 250 && (
        <Text style={styles.counter}>{MAX_CHARS - text.length}</Text>
      )}
      <TouchableOpacity
        style={[styles.sendBtn, (!text.trim() || disabled) && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
      >
        <Text style={styles.sendText}>➤</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 8, backgroundColor: '#F1EFE8',
    borderTopWidth: 0.5, borderTopColor: '#D3D1C7'
  },
  input: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, fontSize: 14,
    color: '#2C2C2A', maxHeight: 100, marginRight: 8
  },
  counter: { fontSize: 11, color: '#E24B4A', alignSelf: 'flex-end', marginRight: 4, marginBottom: 10 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#075E54', alignItems: 'center', justifyContent: 'center'
  },
  sendBtnDisabled: { backgroundColor: '#D3D1C7' },
  sendText: { color: '#FFFFFF', fontSize: 16 }
})

export default InputChatBox