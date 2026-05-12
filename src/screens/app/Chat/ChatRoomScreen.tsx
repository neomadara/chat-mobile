import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import MemoizedMessageGroup from '../../../shared/components/chat/MemoizedMessageGroup'
import { useChatMessages } from '../../../shared/hooks/chat/useChatMessages'
import { useSendMessage } from '../../../shared/hooks/chat/useSendMessage'
import InputChatBox from './components/InputChatBox'

type ChatRoomRouteParams = {
  friendId: string
  friendName?: string
}

type ChatRoomScreenProps = {
  route: { params: ChatRoomRouteParams }
  session: { user: { id: string } }
}

type MessageGroup = {
  date_trunc: string
}

type SendMessagePayload = {
  remitente: string
  destinatario: string
  body: string
  msg_type: number
  id_ref: null
  msg_extra_data: Record<string, unknown>
}

type SendMessageMutation = {
  mutate: (mensajito: SendMessagePayload, options?: { onSuccess?: () => void }) => void
  isPending: boolean
}

const ChatRoomScreen = ({ route, session }: ChatRoomScreenProps) => {
  const { friendId } = route.params
  const flatListRef = useRef<FlatList<MessageGroup> | null>(null)
  const [, setPage] = useState(1)

  const { data: groups, isLoading } = useChatMessages(friendId, session)
  const { mutate: sendMessage, isPending } =
  useSendMessage() as unknown as SendMessageMutation

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [])

  useEffect(() => {
    if (groups?.length) scrollToBottom()
  }, [groups, scrollToBottom])

  const handleSend = useCallback(
    (body: string) => {
      if (!body.trim()) return

      const mensajito: SendMessagePayload = {
        remitente: session.user.id,
        destinatario: friendId,
        body: body.trim(),
        msg_type: 1,
        id_ref: null,
        msg_extra_data: {}
      }

      sendMessage(mensajito, {
        onSuccess: scrollToBottom
      })
    },
    [session, friendId, sendMessage, scrollToBottom]
  )

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1)
  }, [])

  const renderGroup = useCallback(
    ({ item }: { item: MessageGroup }) => (
      <MemoizedMessageGroup group={item} currentUserId={session.user.id} />
    ),
    [session.user.id]
  )

  const getItemLayout = useCallback(
    (_data: ArrayLike<MessageGroup> | null | undefined, index: number) => ({
      length: 80,
      offset: 80 * index,
      index
    }),
    []
  )

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Cargando mensajes...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={(groups || []) as MessageGroup[]}
        keyExtractor={(item) => item.date_trunc}
        renderItem={renderGroup}
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={15}
        removeClippedSubviews={Platform.OS === 'android'}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore}>
            <Text style={styles.loadMoreText}>Cargar mensajes anteriores</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No hay mensajes aún.{'\n'}¡Sé el primero en escribir!
            </Text>
          </View>
        }
      />
      <InputChatBox onSend={handleSend} disabled={isPending} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECE5DD' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { color: '#888780', fontSize: 14 },
  emptyText: { color: '#888780', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  loadMoreBtn: { alignItems: 'center', padding: 12 },
  loadMoreText: { fontSize: 13, color: '#075E54', fontWeight: '500' }
})

export default ChatRoomScreen