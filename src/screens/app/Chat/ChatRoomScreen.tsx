import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
import { chatService } from '../../../shared/services/chatService'
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
  mensajes_list?: unknown[]
}

type PageData = {
  isFirstPage?: boolean
  groups?: MessageGroup[]
  messages?: unknown[]
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

type InfiniteQueryResult = {
  data: { pages: PageData[] } | undefined
  isLoading: boolean
  fetchPreviousPage: () => Promise<unknown>
  hasPreviousPage: boolean
  isFetchingPreviousPage: boolean
}

const ChatRoomScreen = ({ route, session }: ChatRoomScreenProps) => {
  const { friendId } = route.params
  const flatListRef = useRef<FlatList<MessageGroup> | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const hasScrolledRef = useRef(false)

  const {
    data,
    isLoading,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage
  } = useChatMessages(friendId, session) as unknown as InfiniteQueryResult

  const { mutate: sendMessage, isPending } =
    useSendMessage() as unknown as SendMessageMutation

  const allGroups: MessageGroup[] = data?.pages?.flatMap((page: PageData) => {
    if (page.isFirstPage) return page.groups ?? []
    return (chatService.groupMessagesByDate(page.messages ?? []) as MessageGroup[])
  }) ?? []

  const totalMessages = allGroups.reduce((acc, group) => acc + (group.mensajes_list?.length ?? 0), 0)
  console.log(`[ChatRoom:${friendId}] páginas=${data?.pages?.length ?? 0} grupos=${allGroups.length} mensajes=${totalMessages} hasPreviousPage=${hasPreviousPage}`)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [])

  useEffect(() => {
    // Reset flag cuando cambia la sala
    hasScrolledRef.current = false
  }, [friendId])

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
      sendMessage(mensajito, { onSuccess: scrollToBottom })
    },
    [session, friendId, sendMessage, scrollToBottom]
  )

  const handleDeleteMessage = useCallback((messageId: string | number) => {
    Alert.alert(
      'Eliminar mensaje',
      '¿Estás seguro que deseas eliminar este mensaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => chatService.deleteMessage(messageId)
        }
      ]
    )
  }, [])

  const handleLoadMore = useCallback(async () => {
    if (!hasPreviousPage || isFetchingPreviousPage) return
    setIsLoadingMore(true)
    await fetchPreviousPage()
    setIsLoadingMore(false)
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage])

  const renderGroup = useCallback(
    ({ item }: { item: MessageGroup }) => (
      <MemoizedMessageGroup
        group={item}
        currentUserId={session.user.id}
        onLongPressMessage={handleDeleteMessage}
      />
    ),
    [session.user.id, handleDeleteMessage]
  )

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color='#075E54' />
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
        data={allGroups}
        keyExtractor={(item) => item.date_trunc}
        renderItem={renderGroup}
        initialNumToRender={50}
        maxToRenderPerBatch={5}
        windowSize={15}
        removeClippedSubviews={Platform.OS === 'android'}
        onContentSizeChange={() => {
          if (!hasScrolledRef.current && allGroups.length > 0) {
            hasScrolledRef.current = true
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        }}
        ListHeaderComponent={
          hasPreviousPage ? (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={handleLoadMore}
              disabled={isFetchingPreviousPage}
            >
              {isFetchingPreviousPage ? (
                <ActivityIndicator size='small' color='#075E54' />
              ) : (
                <Text style={styles.loadMoreText}>↑ Cargar mensajes anteriores</Text>
              )}
            </TouchableOpacity>
          ) : null
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
  loadMoreBtn: { alignItems: 'center', padding: 14 },
  loadMoreText: { fontSize: 13, color: '#075E54', fontWeight: '500' },
  emptyText: { color: '#888780', fontSize: 14, textAlign: 'center', lineHeight: 22 }
})

export default ChatRoomScreen