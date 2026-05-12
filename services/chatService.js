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
    if (!messages) return []
    return messages.map(group => ({
      date: new Date(group.date_trunc).toLocaleDateString('es-CL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }),
      date_trunc: group.date_trunc,
      mensajes_list: group.mensajes_list
    }))
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
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error } = await getSupabase()
      .from('messages')
      .select('*')
      .or(`remitente.eq.${session.user.id},destinatario.eq.${session.user.id}`)
      .neq('msg_type', 0)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    return data
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