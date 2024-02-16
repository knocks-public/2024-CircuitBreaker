import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import ProveScreen from './src/components/ProveScreen';
import VerifyScreen from './src/components/VerifyScreen';

const Tab = createBottomTabNavigator();

function ModeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Prove" component={ProveScreen} />
      <Tab.Screen name="Verify" component={VerifyScreen} />
    </Tab.Navigator>
  );
}

const App = (): JSX.Element => {
  return (
    <NavigationContainer>
      <ModeTabs />
    </NavigationContainer>
  );
};

export default App;
