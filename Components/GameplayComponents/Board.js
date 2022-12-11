import { StatusBar } from 'expo-status-bar';
import React, {useState} from "react";
import {StyleSheet, Text, View,} from 'react-native';


export default function Board() {


  return (
    <View style={styles.container}>
      <Text>This is About us!</Text>
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
