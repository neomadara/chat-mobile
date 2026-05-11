import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../../services/chatService'

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mensajito) => chatService.sendMessage(mensajito),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] })
      queryClient.invalidateQueries({
        queryKey: ['chatMessages', variables.destinatario]
      })
    },
    onError: (error) => {
      console.error('[useSendMessage] error:', error.message)
    }
  })
}