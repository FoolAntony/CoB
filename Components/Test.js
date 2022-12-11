import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {Button, StyleSheet, Text, View,} from 'react-native';
import {
    monsterType,
    monsterWanderingType,
    rollDice,
    battleResult, briberyResult, magicPotential
} from "./GameController";
import {hero} from "./SquadController";

export default function Test() {
    const [chosenMonster, updateChosenMonster] = useState({})
    const [chosenWanderingMonster, updateWanderingMonster] = useState({})
    const monstTestFunc = () => {
        let a = rollDice();
        let b = rollDice();
        let c = rollDice();
        console.log("Dices: ", a, b, c)
        updateChosenMonster(monsterType(a,b,c))
    }
    const wandMonstTestFunc = () => {
        let a = rollDice();
        let b = rollDice();
        let c = rollDice();
        console.log("Dices: ", a, b, c)
        updateWanderingMonster(monsterWanderingType(a,b,c))
    }

    const battleResTest = () => {
        console.log("Battle result: ", battleResult(25, "Sword"));
    }

    const briberyTest = () => {
        console.log("Bribery result: ", briberyResult(13, 200))
    }

    const testHero = hero("Lord Dil")

    const assignMagicPotential = () => {
        let d = rollDice()
        magicPotential(d, testHero)
        console.log("Dice: ", d, "Hero: ", testHero.Name, " MP: ", testHero.MP)
    }

    useEffect(() => console.log("1.", chosenMonster), [chosenMonster])
    useEffect(() => console.log("2.", chosenWanderingMonster), [chosenWanderingMonster])

  return (
    <View style={styles.container}>
        <Button title={"Test monsters!"} onPress={monstTestFunc}/>
        <Button title={"Test wandering mosters!"} onPress={wandMonstTestFunc}/>
        <Button title={"Battle result!"} onPress={battleResTest}/>
        <Button title={"Bribery Test!"} onPress={briberyTest}/>
        <Button title={"Set Hero's MP!"} onPress={assignMagicPotential}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"center",
    alignItems:"center"
  }
});
