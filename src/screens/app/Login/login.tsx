import { supabase } from '@/shared/lib/supabase'
import { useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Ingresa tu email y contraseña')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) Alert.alert('Error', error.message)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>

        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>💬</Text>
          </View>
          <Text style={styles.title}>Chat App</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="usuario@test.com"
            placeholderTextColor="#888780"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#888780"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.btnText}>Iniciar sesión</Text>
            }
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#075E54', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16
  },
  logoText: { fontSize: 32 },
  title: { fontSize: 24, fontWeight: '500', color: '#2C2C2A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888780' },
  form: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500', color: '#444441', marginBottom: 2 },
  input: {
    borderWidth: 0.5, borderColor: '#D3D1C7', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#2C2C2A',
    backgroundColor: '#F1EFE8', marginBottom: 12
  },
  btn: {
    backgroundColor: '#075E54', borderRadius: 8,
    padding: 14, alignItems: 'center', marginTop: 8
  },
  btnDisabled: { backgroundColor: '#D3D1C7' },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' }
})