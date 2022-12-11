import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import {StyleSheet, View,} from 'react-native';
import {NavigationContainer} from "@react-navigation/native";

import Header from "./Components/Header"
import AboutScreen from "./Components/AboutScreen"
import HomeScreen from "./Components/HomeScreen"
import Settings from "./Components/Settings"
import Rules from "./Components/Rules"
import Viewport from "./Components/Viewport"
import Test from "./Components/Test"
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Board from "./Components/GameplayComponents/Board";
import Squad from "./Components/GameplayComponents/Squad";
import Battlefield from "./Components/GameplayComponents/Battlefield";


const GameTab = createBottomTabNavigator();


function GameTabs() {
  return (
        <GameTab.Navigator>
          <GameTab.Screen name={"Board"} component={Board}/>
          <GameTab.Screen name={"Squad"} component={Squad}/>
          <GameTab.Screen name={"Battle"} component={Battlefield}/>
        </GameTab.Navigator>
  );
}


export default function App() {
  return (
      <View style={styles.container}>
          <Header/>
            <Squad/>
      </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
