import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { MasterDataProvider } from './src/Context/MasterDataContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/utils/toastConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { propertyRoutes } from './src/Module/Property/PropertyRoutes';

import { waterRoutes } from './src/Module/Water/WaterRoutes';

// Dashboard
import DashBoard from './src/Screen/DashBoard';
import StaffCard from './src/Screen/StaffCard';

// Auth
import WelcomeScreen from './src/Screen/WelcomeScreen';
import LoginScreen from './src/Screen/LoginScreen';
import ForgotPassword from './src/Screen/ForgetPassword';

// Profile
import ProfilePage from './src/Screen/ProfilePage';
import Sidebar from './src/Screen/Sidebar';

const Stack = createNativeStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const expiry = await AsyncStorage.getItem('tokenExpiry');
        const now = new Date().getTime();

        if (token && expiry && now < JSON.parse(expiry)) {
          setInitialRoute('DashBoard');
        } else {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('userDetails');
          await AsyncStorage.removeItem('tokenExpiry');
          setInitialRoute('WelcomeScreen');
        }
      } catch (error) {
        console.error('Token check error:', error);
        setInitialRoute('WelcomeScreen');
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  if (isLoading || !initialRoute) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MasterDataProvider>
        <AlertNotificationRoot>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="DashBoard" component={DashBoard} />

              <Stack.Screen name="StaffCard" component={StaffCard} />
              {propertyRoutes.map(({ name, component }) => (
                <Stack.Screen key={name} name={name} component={component} />
              ))}
              <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
              {waterRoutes.map(({ name, component }) => (
                <Stack.Screen key={name} name={name} component={component} />
              ))}










              <Stack.Screen name="ProfilePage" component={ProfilePage} />
              <Stack.Screen name="Sidebar" component={Sidebar} />
            </Stack.Navigator>
          </NavigationContainer>
        </AlertNotificationRoot>
      </MasterDataProvider>

      {/* Toast notification */}
      <Toast
        config={toastConfig}
        topOffset={60}
        visibilityTime={2500}
        position="top"
      />
    </GestureHandlerRootView>
  );
};

export default App;
