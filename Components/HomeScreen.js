import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {
    Button,
    Image,
    StyleSheet,
    Text,
    View,
    Alert,
    FlatList,
    Modal,
    TouchableHighlight
} from 'react-native';
import Board from "./GameplayComponents/Board";

export default function HomeScreen() {

  return (
    <View style={styles.container}>
        <Text>Home screen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent:"center",
      alignItems:"center"
  },
});
