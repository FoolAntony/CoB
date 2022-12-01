import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import {FlatList, Image, StyleSheet, Text, TouchableHighlight, View,} from 'react-native';


export default function Rules() {

    const spells = require('../Database/table_of_spells.json')
    const characters = require('../Database/heroes.json')
    const monsters = require('../Database/monsters.json')

    const Spell = ({id, spell_name, cost, type}) => (
        <View>
            <Text>#{id} {spell_name} {cost} {type}</Text>
        </View>
    );
    const Hero = ({id, Name, Race}) => (
        <View>
            <Text>#{id} {Name} {Race}</Text>
        </View>
    );
    const Monster = ({id, Name}) => (
        <View>
            <Text>#{id} {Name}</Text>
        </View>
    )

    const renderSpell = ({ item }) => (
      <Spell id = {item.id} spell_name={item.spell_name} cost={item.cost} type={item.type}/>
    );
    const renderHero = ({ item }) => (
        <Hero id = {item.id} Name = {item.Name} Race={item.Race}/>
    );
    const renderMonster = ({ item }) => (
      <Monster id={item.id} Name={item.Name} />
    );

  return (
    <View style={styles.container}>
        <Text style={{paddingTop:50}}>Check Rules!</Text>
        <View style={{paddingTop:30}}>
            <FlatList data={characters}
                      keyExtractor={(item) => item.id}
                      renderItem={renderHero}/>
        </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"center",
    alignItems:"center",
  },
  text:{
      flex: 1,
      marginTop:20
  }
});
