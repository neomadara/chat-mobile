import { createStackNavigator } from '@react-navigation/stack'
import ChatScreen from '../screens/app/Chat/ChatScreen'
import ChatRoomScreen from '../screens/app/Chat/ChatRoomScreen'

const Stack = createStackNavigator()

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
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: 'Mensajes' }}
      />
      <Stack.Screen
        name="ChatRoomScreen"
        component={ChatRoomScreen}
        options={({ route }) => ({ title: route.params?.friendName || 'Chat' })}
      />
    </Stack.Navigator>
  )
}

export default MessagesStack