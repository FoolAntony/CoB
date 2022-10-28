import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import {FlatList, Image, StyleSheet, Text, TouchableHighlight, View,} from 'react-native';


export default function Rules() {

    const spells = require('../Database/table_of_spells.json')

    const Item = ({id, spell_name, cost, type}) => (
        <View stype={{padding:50}}>
            <Text>#{id} {spell_name} {cost} {type}</Text>
        </View>
    );

    const renderItem = ({ item }) => (
      <Item id = {item.id} spell_name={item.spell_name} cost={item.cost} type={item.type}/>
    );

  return (
    <View style={styles.container}>
        <Text>Check Rules!</Text>
        <Text style={{paddingTop:10}}>Table Of Spells:</Text>
        <View style={{paddingTop:30}}>
            <FlatList data={spells}
                      keyExtractor={(item) => item.id}
                      renderItem={renderItem}/>
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
