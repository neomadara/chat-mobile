import { getSupabase, initSupabase } from '@/shared/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { createContext, useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

initSupabase({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
})

const queryClient = new QueryClient()
const supabase = getSupabase()

export const SessionContext = createContext<Session | null>(null)
export const useSession = () => useContext(SessionContext)

function LoginScreen() {
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
      style={loginStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={loginStyles.content}>
        <View style={loginStyles.header}>
          <View style={loginStyles.logo}>
            <Text style={loginStyles.logoEmoji}>💬</Text>
          </View>
          <Text style={loginStyles.title}>Chat App</Text>
          <Text style={loginStyles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={loginStyles.form}>
          <Text style={loginStyles.label}>Email</Text>
          <TextInput
            style={loginStyles.input}
            placeholder="usuario@test.com"
            placeholderTextColor="#888780"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={loginStyles.label}>Contraseña</Text>
          <TextInput
            style={loginStyles.input}
            placeholder="••••••••"
            placeholderTextColor="#888780"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[loginStyles.btn, loading && loginStyles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={loginStyles.btnText}>Iniciar sesión</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#075E54" />
      </View>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  return (
    <SessionContext.Provider value={session}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#075E54' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '500' },
            headerShown: false
          }}
        />
      </QueryClientProvider>
    </SessionContext.Provider>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
})

const loginStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#075E54', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16
  },
  logoEmoji: { fontSize: 32 },
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