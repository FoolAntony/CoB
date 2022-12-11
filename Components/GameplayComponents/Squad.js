import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {Button, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useMachine} from "@xstate/react";
import {teamMachine} from "../StateMachine";
import {idRandomHero, randomHero, Team} from "../SquadController";

export default function Squad() {

  const [state, send] = useMachine(teamMachine)
  const [team, updateTeam] = useState(Team)
  // const [modalVisible, setModalVisible] = useState(false)

  let upteam = Team
  let idUsed = []

  const teamAddNewMember = () => {
    if(state.value !== "full" && state.context.amount < 3) {
      let id = idRandomHero()
      console.log(id)
      send("ADD")
      upteam[state.context.amount] = randomHero(id)
      updateTeam(upteam)
      idUsed.push(id)
    }
    else if(state.value !== "full" && state.context.amount >= 3) {

    }
    else{
      console.log("Team is completed, thank you!")
    }

    }


  // function InfoHero(item) {
  //   return(
  //       <Modal
  //       animationType="slide"
  //       transparent={true}
  //       visible={modalVisible}
  //       onRequestClose={() => {
  //         console.log("Modal has been closed.");
  //         setModalVisible(!modalVisible);
  //       }}
  //     >
  //       <View style={styles.centeredView}>
  //         <View style={styles.modalView}>
  //           <Text style={styles.modalText}>{item.Name? item.Name : "Hello!"}</Text>
  //           <TouchableOpacity
  //             style={[styles.button, styles.buttonClose]}
  //             onPress={() => setModalVisible(!modalVisible)}
  //           >
  //             <Text style={styles.textStyle}>Hide Info</Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View>
  //     </Modal>
  //   )
  // }

  const itemSeparator = () => {
    return(<View style={styles.separator}/>)
  }


  useEffect(() => {
    console.log(team)
    console.log(state.value)
  }, [state, team])

  return (
    <View style={styles.container}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.textHeader}>This is Squad Screen!</Text>
      </View>
      <View style={styles.list}>
        <FlatList
            style={styles.flatlist}
            scrollEnabled={false}
            ItemSeparatorComponent={itemSeparator}
            data={team}
            numColumns={3}
            renderItem={({item, index}) => (
                <View>
                  <TouchableOpacity>
                    <View style={[styles.textContainer, {backgroundColor: item.Name ? "silver" : "grey"}]}>
                      <Text style={styles.text}>{item.Name ? item.Name : "Lonely..."}</Text>
                      <Text style={styles.text}>{item.Race ? item.Race : undefined}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
            )}
        />
      </View>
      <View style={styles.buttonAdd}>
        <Button title={"Add team member!"} onPress={teamAddNewMember}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"space-evenly",
  },
  text: {
    fontSize:18,
  },
  textContainer: {
    alignContent: "center",
    alignItems:"center",
    width: 120,
    height: 120,
    borderWidth:2,
    borderColor:"grey",
    borderRadius: 10
  },
  textHeader: {
    fontSize:22,
    alignSelf:"center"
  },
  list: {
    alignSelf: "center",
    height:256,
    width:360,
    borderColor:"red",
  },
  flatlist: {
    alignContent:"center"
  },
  separator: {
    height: 15,
    width:10
  },
  buttonAdd: {
    paddingBottom:150
  },
  headerTextContainer: {
    height:25,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }

});

