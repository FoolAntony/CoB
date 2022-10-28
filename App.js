import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import {StyleSheet, View,} from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";

import Header from "./Components/Header"
import AboutScreen from "./Components/AboutScreen"
import HomeScreen from "./Components/HomeScreen"
import Settings from "./Components/Settings"
import Rules from "./Components/Rules"

const Tab = createBottomTabNavigator();

function MyTabs() {

  return (
        <Tab.Navigator>
          <Tab.Screen name={"Home"} component={HomeScreen}/>
          <Tab.Screen name={"About"} component={AboutScreen}/>
          <Tab.Screen name={"Settings"} component={Settings}/>
          <Tab.Screen name={"Rules"} component={Rules}/>
        </Tab.Navigator>
  );
}

export default function App() {
  return (
      <View style={styles.container}>
        <Header/>
          <View style={styles.tabs}>
              <NavigationContainer>
                  <MyTabs />
              </NavigationContainer>
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
      flex: 1,
      alignContent:"flex-start"
  }
});
