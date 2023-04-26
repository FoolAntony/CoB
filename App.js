import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import {Alert, Button, StyleSheet, View,} from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import Header from "./Components/Header"
import Board from "./Components/GameplayComponents/Board";
import Battlefield from "./Components/GameplayComponents/Battlefield";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import SquadHub from "./Components/GameplayComponents/SquadHub"


const Stack = createNativeStackNavigator();

let team = Array(9).fill({})

// This is the test squad I used to preform all needed actions. it can be modified with different data.

let team_test = [{"CB": 5, "MP": [0, 0, 0], "Name": "Weldron", "RV": 2, "Race": "Human", "Skill": [{"Name":"Hellgate","Value": 4}], "Spells": ["Heal"], "WP": 9, "WS": [{"Type":"Sword","Damage": 2}], "Weapon": ["Sword", "Bow"], "id": 20, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": 3, "MP": [1, 1, 2], "Name": "Almuric", "RV": 2, "Race": "Human", "Skill": [{"Name":"Hellgate","Value": 1}], "Spells": ["Thief", "Oratory"], "WP": 8, "WS": [{"Type":"Sword","Damage": 2}], "Weapon": ["Sword", "Dagger"], "id": 1, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": 4, "MP": [1, 2, 3], "Name": "Sliggoth", "RV": 2, "Race": "Dwarf", "Skill": [{"Name":"Detrap","Value": 1}], "Spells": ["Charm", "Blast", "Explosion"],
            "WP": 8, "WS": [{"Type":"Axe","Damage": 1}], "Weapon": ["Axe", "Bow"], "id": 17, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": null, "MP": [1, 1, 1], "Name": "A", "RV": 2, "Race": "Elf", "Skill": [{"Name":"Negotiation","Value": 1}], "Spells": ["Flattery"], "WP": 5, "WS": [{"Type":"Bow","Damage": 1}],
            "Weapon": ["Dagger", "T-Dagger"], "id": 27, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": null, "MP": [0, 0, 0], "Name": "G", "RV": 2, "Race": "Elf", "Skill": [{"Name":"Negotiation","Value": 1}], "Spells": ["Rejuvenate"], "WP": 5, "WS": [{"Type":"Bow","Damage": 1}],
            "Weapon": ["Sword", "T-Dagger"], "id": 28, "Treasure": [],"Inventory": [], "Effects": []}, {"CB": null, "MP": [2, 2, 2], "Name": "H", "RV": 1, "Race": "Human", "Skill": [], "Spells": [], "WP": 7, "WS": [{"Type":"Sword","Damage": 1}],
            "Weapon": ["T-Dagger", "Bow"], "id": 31, "Treasure": [],"Inventory": [{"effect": "Combat Bonus", "type": "Medallion"}, {"effect" : "Heal", "type": "Potion"}], "Effects": []}, {}, {}, {}];

// In order to skip some screens, just quote them with Ctrl+/ shortcut.
// Don't forget to unquote initial parameters for the following screen and quote them when
// higher screen in on use.

// If you want to test battle system, you can change battle parameter as following:
//
// 1. "normal": Normal fight
// 2. "wondering": Fight with wondering monsters
// 3. "medusa": Medusa statue event; Fight with medusa
// 4. "unknown": X the Unknown statue event; Fight with affected hero
// WARNING! To have unknown battle event stable, you show insert "Enemy" effect into Effects array
// 5. "vampire": Cabin event; Fight with a vampire
// 6. "boss": Final boss of the game

function StackScreens() {
  return (
        <Stack.Navigator>
          {/*<Stack.Screen*/}
          {/*    initialParams={{squad: team, money: 0, XP: 0}}*/}
          {/*    name={"Squad"}*/}
          {/*    component={Squad}/>*/}
          <Stack.Screen
              initialParams={{squad: team_test, money: 0, XP: 0}}
              name={"Board"}
              options={{
                  headerRight:() => (
                      <Button
                          title={"Squad Hub"}
                      />
                  )
              }}
              component={Board}/>
          <Stack.Screen
              /* initialParams={{squad: team_test, money: 0, XP: 0, battle:"normal"}}*/
              name={"Battle"}
              component={Battlefield}/>
          <Stack.Screen
              name={"Squad Hub"}
                /* initialParams={{squad: team_test, money: 0, XP: 0}}*/
              options={{
                  headerLeft:()=>(
                      <Button
                          title={"Return to Board"}
                      />
                  )
              }}
              component={SquadHub}/>
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
