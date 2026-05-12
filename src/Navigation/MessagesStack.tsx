import { useSession } from '@/app/_layout'
import type { RouteProp } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import ChatRoomScreen from '../screens/app/Chat/ChatRoomScreen'
import ChatScreen from '../screens/app/Chat/chatScreen'

type RootStackParamList = {
  ChatScreen: undefined
  ChatRoomScreen: { friendId: string; friendName?: string }
}

const Stack = createStackNavigator<RootStackParamList>()

const ChatScreenWithSession = () => {
  const session = useSession()
  if (!session) return null
  return <ChatScreen session={session} />
}

const ChatRoomScreenWithSession = ({
  route
}: {
  route: RouteProp<RootStackParamList, 'ChatRoomScreen'>
}) => {
  const session = useSession()
  if (!session) return null
  return <ChatRoomScreen route={route} session={session} />
}

const MessagesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#075E54' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '500' }
      }}
    >
      <Stack.Screen
        name='ChatScreen'
        component={ChatScreenWithSession}
        options={{ title: 'Mensajes' }}
      />
      <Stack.Screen
        name='ChatRoomScreen'
        component={ChatRoomScreenWithSession}
        options={({ route }) => ({ title: route.params?.friendName || 'Chat' })}
      />
    </Stack.Navigator>
  )
}

export default MessagesStack