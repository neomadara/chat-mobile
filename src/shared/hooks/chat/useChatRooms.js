import { useQuery } from '@tanstack/react-query'
import { chatService } from '../../services/chatService'

export const useChatRooms = (session) => {
  return useQuery({
    queryKey: ['chatrooms', session?.user?.id],
    queryFn: () => chatService.getMyChatrooms(),
    enabled: !!session?.user?.id,
    staleTime: 0,
    retry: 1
  })
}