import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { Session } from '@supabase/supabase-js'
import { useCallback, useState } from 'react'
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useChatRooms } from '../../../shared/hooks/chat/useChatRooms'

const FILTERS = ['Todos', 'Sin leer', 'Leídos'] as const

type FilterType = (typeof FILTERS)[number]

type RootStackParamList = {
  ChatScreen: undefined
  ChatRoomScreen: {
    friendId: string
    friendName?: string
  }
}

type ChatRoom = {
  chatroom_id: string | number
  friend_id: string | number
  friend_name?: string | null
  unread_count?: number | null
  last_message?: string | null
  last_message_at?: string | null
}

type ChatScreenProps = {
  session: Session | null
}

const ChatScreen = ({ session }: ChatScreenProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ChatScreen'>>()
  const { data: chatrooms, isLoading, refetch, error } = useChatRooms(session)

  console.log('session:', session?.user?.id)
  console.log('chatrooms:', JSON.stringify(chatrooms))
  console.log('error:', error)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('Todos')
  const [refreshing, setRefreshing] = useState(false)

  const rooms = (chatrooms ?? []) as ChatRoom[]

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const filtered = rooms.filter((room: ChatRoom) => {
    const name = room.friend_name ?? ''
    const unread = room.unread_count ?? 0
    const matchSearch = name.toLowerCase().includes(search.toLowerCase())

    if (filter === 'Sin leer') return matchSearch && unread > 0
    if (filter === 'Leídos') return matchSearch && unread === 0
    return matchSearch
  })

  const renderItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={() =>
        navigation.navigate('ChatRoomScreen', {
          friendId: String(item.friend_id),
          friendName: item.friend_name ?? undefined
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.friend_name ?? '?').charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.friendName}>{item.friend_name ?? 'Sin nombre'}</Text>
          {item.last_message_at && (
            <Text style={styles.time}>
              {new Date(item.last_message_at).toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          )}
        </View>

        <View style={styles.roomFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message || 'Sin mensajes aún'}
          </Text>
          {(item.unread_count ?? 0) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder='Buscar...'
        placeholderTextColor='#888780'
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Cargando chats...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.chatroom_id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No hay conversaciones</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  search: {
    margin: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F1EFE8',
    fontSize: 14,
    color: '#2C2C2A'
  },
  filters: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8, gap: 8 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#D3D1C7'
  },
  filterActive: { backgroundColor: '#075E54', borderColor: '#075E54' },
  filterText: { fontSize: 13, color: '#888780' },
  filterTextActive: { color: '#FFFFFF' },
  roomItem: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1EFE8',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '500' },
  roomInfo: { flex: 1 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  friendName: { fontSize: 15, fontWeight: '500', color: '#2C2C2A' },
  time: { fontSize: 12, color: '#888780' },
  roomFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { fontSize: 13, color: '#888780', flex: 1, marginRight: 8 },
  badge: {
    backgroundColor: '#075E54',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '500' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { color: '#888780', fontSize: 14 },
  emptyText: { color: '#888780', fontSize: 14 }
})

export default ChatScreen