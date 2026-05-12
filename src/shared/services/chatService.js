import { getSupabase } from '../lib/supabase'

export const chatService = {

  async getMyChatrooms() {
    const { data, error } = await getSupabase().rpc('get_my_chatrooms')
    if (error) throw error
    return data
  },

  async getChatroomMessages(friendId, session) {
    if (!friendId || !session?.user?.id) throw new Error('Parámetros inválidos')
    const { data, error } = await getSupabase().rpc('get_chatroom_messages_v2', {
      friend_id_arg: friendId
    })
    if (error) throw error
    return data
  },

  groupMessagesByDate(messages) {
  if (!messages || !messages.length) return []

  // Agrupar mensajes planos por fecha
  const groups = {}
  messages.forEach(msg => {
    const day = new Date(msg.created_at).toISOString().split('T')[0]
    if (!groups[day]) {
      groups[day] = {
        date_trunc: new Date(msg.created_at).toISOString(),
        mensajes_list: []
      }
    }
    groups[day].mensajes_list.push(msg)
  })

  return Object.values(groups).sort(
    (a, b) => new Date(a.date_trunc) - new Date(b.date_trunc)
  )
},

  async sendMessage(mensajito) {
    const { data, error } = await getSupabase().rpc('despacho_de_mensaje', { mensajito })
    if (error) throw error
    return data
  },

  async markMessageAsRead(messageId) {
    const { data, error } = await getSupabase()
      .from('messages')
      .update({ is_leido: true })
      .eq('id', messageId)
    if (error) throw error
    return data
  },

  async deleteChatroom(session, chatroomId) {
    const { data, error } = await getSupabase().rpc('delete_soft_chatroom', {
      p_session: session,
      p_chatroom_id: chatroomId
    })
    if (error) throw error
    return data
  },

  async getChatroomMessagesPaginated(friendId, page = 1, pageSize = 20, session) {
  if (!friendId || !session?.user?.id) throw new Error('Parámetros inválidos')

  // Primero obtener el chatroom_id
  const chatroomId = await chatService.getOrCreateChatroomId(
    session.user.id, friendId
  )

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .eq('chatroom_id', chatroomId)
    .neq('msg_type', 0)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  // Retornar en orden ascendente para que se vean bien en la UI
  return data ? data.reverse() : []
},

  async getOrCreateChatroomId(userId, friendId) {
    const { data, error } = await getSupabase().rpc('check_chatroom_exist', {
      current_id: userId,
      friend_id: friendId
    })
    if (error) throw error
    return data
  },

  async deleteMessage(messageId) {
    const { data, error } = await getSupabase().rpc('delete_message', {
      p_message_id: messageId
    })
    if (error) throw error
    return data
  }
}