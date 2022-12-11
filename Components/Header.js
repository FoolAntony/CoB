import React, {useState} from 'react';
import {StyleSheet, View, Text} from "react-native";

export default function Header(){
    return (
      <View style={styles.main}>
          <Text style={styles.text}>Citadel Of Blood</Text>
      </View>
    );
    }

    const styles = StyleSheet.create({
        main: {
            paddingTop: 40,
            height: 70,
            backgroundColor: 'gray'
        },
        text: {
            fontSize: 18,
            color: 'red',
            textAlign: "center"
        }
    });