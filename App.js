import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import { StyleSheet, View,} from 'react-native';
import {NavigationContainer} from "@react-navigation/native";

import Header from "./Components/Header"
import AboutScreen from "./Components/AboutScreen"
import HomeScreen from "./Components/HomeScreen"
import Settings from "./Components/Settings"
import Rules from "./Components/Rules"
import Test from "./Components/Test"
import Board from "./Components/GameplayComponents/Board";
import Squad from "./Components/GameplayComponents/Squad";
import Battlefield from "./Components/GameplayComponents/Battlefield";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Team} from "./Components/SquadController";


const Stack = createNativeStackNavigator();

let team = Team;

function StackScreens() {
  return (
        <Stack.Navigator>
          <Stack.Screen initialParams={{level: 1, squad: team, money: 0, XP: 0}} name={"Squad"} component={Squad}/>
          <Stack.Screen name={"Board"} component={Board}/>
          <Stack.Screen name={"Battle"} component={Battlefield}/>
        </Stack.Navigator>
  );
}


export default function App() {
  return (
      <View style={styles.container}>
          <Header/>
          <NavigationContainer>
            <StackScreens/>
          </NavigationContainer>
      </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    flex: 1,
    justifyContent: "center"
  },
});
