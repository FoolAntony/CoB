import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {Button, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useMachine} from "@xstate/react";
import {teamMachine} from "../StateMachine";
import {chooseFollowerTemplate, idRandomHero, randomHero, Team} from "../SquadController";
import {getWeapon, magicPotential, rollDice} from "../GameController";
import {stringify} from "xstate/es/json";
import {TextInput} from "react-native-gesture-handler";


export default function Squad() {

  const [state, send] = useMachine(teamMachine);
  const [inputName, setInputName] = useState("")
  const [team, updateTeam] = useState(Team);
  const [modalVisible, setModalVisible] = useState(false);
  const [member, showMember] = useState({});
  const [modalOption, setModalOption] = useState("showHeroInfo");
  const [dice, updateDice] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  let upteam = Team
  let idUsed = [];

 function AddMembersButton() {
    switch (state.value){
      case "empty":
      case "addHeroes":
        return (
            <TouchableOpacity  onPress={teamAddNewMember}>
              <View style={styles.textButtonContainer}>
                <Text style={styles.textButton}>Add New Hero!</Text>
              </View>
            </TouchableOpacity>
        );

      default:
        return (
            <TouchableOpacity  onPress={addNewFollower}>
              <View style={styles.textButtonContainer}>
                <Text style={styles.textButton}>Add New Follower!</Text>
              </View>
            </TouchableOpacity>
        );

      case "full":
        return (
            <TouchableOpacity  onPress={teamAddNewMember}>
              <View style={styles.textButtonContainer}>
                <Text style={styles.textButton}>Next Stage!</Text>
              </View>
            </TouchableOpacity>
        );
    }
 }

  const teamAddNewMember = () => {
    if(state.context.amount < 3) {
      let id = idRandomHero()
      console.log(id)
      send("ADD")
      upteam[state.context.amount] = randomHero(id)
      updateTeam(upteam)
      idUsed.push(id)
    }
    else{
      console.log("Team is completed, thank you!")
    }
  }

  const Dice = () => {
     setModalOption("DiceRoll");
     updateDice(rollDice())
  }

  const SetMember = (member) => {
      setModalOption("showHeroInfo");
      showMember(member);
      setModalVisible(true);
  }

  const addNewFollower = () => {
     setModalOption("nextState");
     setModalVisible(true);
  }

  function NextStateTemplate() {
     switch (state.value) {
         case "addFollowers":
             return(
                 <Text style={styles.modalText}>Find Who Is Your Follower!</Text>
             )
         case "addWeapon":
             return(
                 <Text style={styles.modalText}>Get Your {state.context.weapons + 1} Follower Weapon!</Text>
             )
         case "addMana":
             return(
                 <Text style={styles.modalText}>Find What Magic Potential Your Follower Has!</Text>
             )
         case "addName":
             return(
                 <Text style={styles.modalText}>Name Your New Follower!</Text>
             )
     }
  }

  const FollowerStates = (data) => {
     switch (state.value){
         case "addFollowers":
             upteam[state.context.amount] = chooseFollowerTemplate(data)
             updateTeam(upteam)
             send("NEXT")
             setModalOption("InputName")
             break;
         case "addName":
             upteam[state.context.amount].Name = data
             updateTeam(upteam)
             send("NEXT")
             setModalOption("nextState")
             break;
         case "addWeapon":
             upteam[state.context.amount].Weapon.push(getWeapon(data))
             updateTeam(upteam)
             send("ADD")
             setModalOption("nextState")
             break;
         case "addMana":
             upteam[state.context.amount].MP = magicPotential(data)
             updateTeam(upteam)
             send("NEXT")
             SetMember(team[state.context.amount])
             break;
         default:
             console.log("Some error in Follower State")
     }
  }


  function ModalScreen() {
    switch (modalOption) {
      case "showHeroInfo":
        return(
              <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    console.log("Modal has been closed.");
                    setModalVisible(() => false);
                  }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.modalText}>{member.Name ? "Name: " + member.Name : "Add new member here to see his info!"}</Text>
                    <Text style={styles.modalText}>{member.Race ? "Race: " + member.Race : undefined}</Text>
                    <Text style={styles.modalText}>{member.WP ? "Wound Points / WP: " + member.WP : undefined}</Text>
                    <Text style={styles.modalText}>{member.MP ? "Mana Points / MP (Red/Yellow/Blue): " + member.MP : undefined}</Text>
                    <Text style={styles.modalText}>{member.RV ? "Resistance / RV: " + member.RV : undefined}</Text>
                    <Text style={styles.modalText}>{member.CB ? "Combat Bonus : " + member.CB : undefined}</Text>
                    <Text style={styles.modalText}>{member.Weapon ? "Weapons: " + member.Weapon : undefined}</Text>
                    <Text style={styles.modalText}>{member.WS ? "Weapon Skills: " + "+" + member.WS[1] + " for " + member.WS[0] : undefined}</Text>
                    <Text style={styles.modalText}>{member.Skill ? "Hero Skills: " + "+" + member.Skill[1] + " in " + member.Skill[0] : undefined}</Text>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.textStyle}>Hide Info</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
          );
      case "nextState":
        return(
            <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    console.log("Modal has been closed.");
                    setModalVisible(() => false);
                  }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <NextStateTemplate/>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={Dice}
                    >
                      <Text style={styles.textStyle}>Roll a Dice!</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
        );
      case "InputName":
          let n = ""
        return(
            <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    console.log("Modal has been closed.");
                    setModalVisible(() => false);
                  }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <NextStateTemplate/>
                      <TextInput
                          style={styles.input}
                          value={inputName}
                          onChangeText={text => setInputName(text)}
                          onSubmitEditing={() => {
                              FollowerStates(inputName)
                          }}
                          placeholder={"Example: Artorias"}
                      />
                    {/*<TouchableOpacity*/}
                    {/*    style={[styles.button, styles.buttonClose]}*/}
                    {/*    onPress={(n) => {*/}
                    {/*        setInputName(n)*/}
                    {/*        FollowerStates(inputName)*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*  <Text style={styles.textStyle}>Submit!</Text>*/}
                    {/*</TouchableOpacity>*/}
                  </View>
                </View>
              </Modal>
        );
      case "DiceRoll":
            return(
                <Modal
                      animationType="slide"
                      transparent={true}
                      visible={modalVisible}
                      onRequestClose={() => {
                        console.log("Modal has been closed.");
                        setModalVisible(() => false);
                      }}
                  >
                    <View style={styles.centeredView}>
                      <View style={styles.modalView}>
                        <Text style={styles.modalText}>Your Result: {dice}</Text>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => FollowerStates(dice)}
                        >
                          <Text style={styles.textStyle}>Go Next Step!</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
            );

    }
  }

  const itemSeparator = () => {
    return(<View style={styles.separator}/>)
  }


  useEffect(() => {
    console.log(team)
    console.log(state.value);
  }, [state, team])

  return (
    <View style={styles.container}>
      <ModalScreen/>
      <View style={styles.headerTextContainer}>
        <Text style={styles.textHeader}>Make your Squad of Heroes!</Text>
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
                  <TouchableOpacity onPress={() => SetMember(item)}>
                    <View style={[styles.textContainer, {backgroundColor: item.Name ? "silver" : "grey"}]}>
                      <Text style={styles.text}>{item.Name ? item.Name : "Lonely..."}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
            )}
        />
      </View>
      <AddMembersButton/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"space-evenly",
  },
  text: {
    textAlign:"center",
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
  },
  textButton: {
    fontSize: 20,
    textAlign: "center",
    paddingTop: 5,
    color:"white"
  },
  textButtonContainer: {
    borderColor:'grey',
    borderRadius:4,
    width:200,
    alignSelf:'center',
    height:40,
    backgroundColor:'#4040a1',
    marginBottom: 100
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },

});

