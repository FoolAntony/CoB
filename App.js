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

let team = [{"CB": 5, "MP": [0, 0, 0], "Name": "Weldron", "RV": 2, "Race": "Human", "Skill": [{"Name":"Hellgate","Value": 4}], "Spells": [], "WP": 9, "WS": ["Sword", 2], "Weapon": ["Sword", "Bow"], "id": 20, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": 3, "MP": [1, 1, 2], "Name": "Almuric", "RV": 2, "Race": "Human", "Skill": [{"Name":"Hellgate","Value": 1}], "Spells": ["Charm", "Blast"], "WP": 8, "WS": ["Sword", 2], "Weapon": ["Sword", "Dagger"], "id": 1, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": 4, "MP": [1, 2, 3], "Name": "Sliggoth", "RV": 2, "Race": "Dwarf", "Skill": [{"Name":"Detrap","Value": 1}], "Spells": ["Charm", "Blast", "Explosion"],
            "WP": 8, "WS": ["Axe", 1], "Weapon": ["Axe", "Bow"], "id": 17, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": null, "MP": [1, 1, 1], "Name": "A", "RV": 2, "Race": "Elf", "Skill": [{"Name":"Negotiation","Value": 1}], "Spells": ["Flattery"], "WP": 5, "WS": ["Bow", 1],
            "Weapon": ["Dagger", "T-Dagger"], "id": 27, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": null, "MP": [0, 0, 0], "Name": "G", "RV": 2, "Race": "Elf", "Skill": [{"Name":"Negotiation","Value": 1}], "Spells": [], "WP": 5, "WS": ["Bow", 1],
            "Weapon": ["Sword", "T-Dagger"], "id": 28, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": null, "MP": [2, 2, 2], "Name": "H", "RV": 1, "Race": "Human", "Skill": [], "Spells": [], "WP": 7, "WS": ["Sword", 1],
            "Weapon": ["T-Dagger", "Bow"], "id": 31, "Treasure": [],"Inventory": [{"effect": "Combat Bonus", "type": "Medallion"}], "Effects": []}, {}, {}, {}];

function StackScreens() {
  return (
        <Stack.Navigator>
          {/*<Stack.Screen initialParams={{level: 1, squad: team, money: 0, XP: 0}} name={"Squad"} component={Squad}/>*/}
          <Stack.Screen initialParams={{level: 1, squad: team, money: 0, XP: 0}} name={"Board"} component={Board}/>
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
