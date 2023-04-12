import React, {useState} from 'react';
import {StyleSheet, View, Text} from "react-native";

export default function Header(){
    return (
      <View style={[styles.main, {justifyContent:"center"}]}>
          <Text style={styles.text}>Citadel Of Blood</Text>
      </View>
    );
    }

    const styles = StyleSheet.create({
        main: {
            height: 70,
            backgroundColor: 'gray'
        },
        text: {
            fontSize: 25,
            color: 'red',
            textAlign: "center"
        }
    });