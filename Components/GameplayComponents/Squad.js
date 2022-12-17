import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useMachine} from "@xstate/react";
import {teamMachine} from "../StateMachine/StateMachine.Squad";
import {
    chooseFollowerTemplate, getRandomHero,
    idRandomHero,
    randomHero,
    Team,
} from "../SquadController";
import {getWeapon, magicPotential, rollDice} from "../GameController";
import {TextInput} from "react-native-gesture-handler";

export let CompleteSquad = Array(9).fill({})

const idUsed = [];

export default function Squad() {
    const [state, send] = useMachine(teamMachine);
    const [team, updateTeam] = useState(Team);
    const [modalVisible, setModalVisible] = useState(false);
    const [member, showMember] = useState({});
    const [modalOption, setModalOption] = useState("showHeroInfo");
    const [dice, updateDice] = useState(null);

    let upTeam = Team;


    const teamAddNewMember = () => {
    if(state.context.amount < 3) {
      let id = checkHeroDuplication()
      console.log(idUsed)
      send("ADD")
      upTeam[state.context.amount] = getRandomHero(id)
      updateTeam(upTeam)
      SetMember(team[state.context.amount]);
      CompleteSquad = team;
    }
    else{
      console.log("Team is completed, thank you!");
    }
}

const checkWeaponDuplication = (weapon_check) => {
    console.log(weapon_check)
    if (upTeam[state.context.amount].Weapon.length === 0) {
        return false;
    }
    else{
        console.log(upTeam[state.context.amount].Weapon.includes(weapon_check))
        return upTeam[state.context.amount].Weapon.includes(weapon_check);
    }
}

const checkHeroDuplication = () => {
    let id = idRandomHero()
    do{
        id = idRandomHero()
    }while (idUsed.includes(id))
    idUsed.push(id)
    return id;
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

    const FollowerStates = (data) => {
     switch (state.value){
         case "addFollowers":
             upTeam[state.context.amount] = JSON.parse(JSON.stringify(chooseFollowerTemplate(data)))
             upTeam[state.context.amount].id += state.context.amount
             updateTeam(upTeam)
             send("NEXT")
             setModalOption("InputName")
             break;
         case "addName":
             upTeam[state.context.amount].Name = data
             updateTeam(upTeam)
             send("NEXT")
             setModalOption("nextState")
             break;
         case "addWeapon":
             let weapon = getWeapon(data)
             if(checkWeaponDuplication(weapon) === false) {
                 upTeam[state.context.amount].Weapon.push(weapon)
                 updateTeam(upTeam)
                 send("ADD")
                 setModalOption("nextState")
             }
             else{
                 Alert.alert("Your dice result has been repeated, but all weapons must be unique. Roll Again!")
                 setModalOption("nextState");
             }

             break;
         case "addMana":
             upTeam[state.context.amount].MP = magicPotential(data)
             updateTeam(upTeam)
             send("NEXT")
             SetMember(team[state.context.amount])
             CompleteSquad = team
             break;
         default:
             console.log("Some error in Follower State")
     }
}

  const itemSeparator = () => {
    return(<View style={styles.separator}/>)
  }

  function NextStateTemplate() {
     switch (state.value) {
         case "addFollowers":
             return(
                 <View>
                     <Text style={styles.modalText}>Find Who Is Your Follower!</Text>
                     <Text style={styles.modalText}>Possible results:</Text>
                     <Text style={styles.modalText}>1-2: Elf</Text>
                     <Text style={styles.modalText}>3-4: Dwarf</Text>
                     <Text style={styles.modalText}>5-6: Human</Text>
                 </View>

             )
         case "addWeapon":
             return(
                 <View>
                    <Text style={styles.modalText}>Get Your {state.context.weapons + 1} Follower Weapon!</Text>
                     <Text style={styles.modalText}>Possible results:</Text>
                     <Text style={styles.modalText}>1: Dagger</Text>
                     <Text style={styles.modalText}>2: Throwing Dagger</Text>
                     <Text style={styles.modalText}>3: Bow</Text>
                     <Text style={styles.modalText}>4: Sword</Text>
                     <Text style={styles.modalText}>5: Hammer</Text>
                     <Text style={styles.modalText}>6: Axe</Text>
                 </View>
             )
         case "addMana":
             return(
                 <View>
                     <Text style={styles.modalText}>Find What Magic Potential Your Follower Has!</Text>
                     <Text style={styles.modalText}>Possible results (Red/Yellow/Blue):</Text>
                     <Text style={styles.modalText}>1-2: [0, 0, 0]</Text>
                     <Text style={styles.modalText}>3: [2, 1, 0]</Text>
                     <Text style={styles.modalText}>4: [0, 1, 2]</Text>
                     <Text style={styles.modalText}>5: [1, 1, 1]</Text>
                     <Text style={styles.modalText}>6: [2, 2, 2]</Text>
                 </View>
             )
         case "addName":
             return(
                 <Text style={styles.modalText}>Name Your New Follower!</Text>
             )
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
                  animationType="fade"
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
        const [inputName, setInputName] = useState("")
        return(
                <Modal
                      animationType="fade"
                      transparent={true}
                      visible={modalVisible}
                      onRequestClose={() => {
                        console.log("Modal has been closed.");
                        setModalVisible(() => false);
                      }}
                  >
                    <KeyboardAvoidingView behavior={"height"} style={styles.centeredView}>
                      <View style={styles.modalView}>
                        <NextStateTemplate/>
                          <TextInput
                              style={styles.input}
                              defaultValue={inputName}
                              onChangeText={setInputName}
                              onSubmitEditing={() => {
                                  setInputName("")
                                  FollowerStates(inputName)
                              }}
                              placeholder={"Example: Artorias"}
                          />
                      </View>
                    </KeyboardAvoidingView>
                  </Modal>
        );
      case "DiceRoll":
            return(
                <Modal
                      animationType="fade"
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
                      <Text style={styles.text}>{item.Name ? item.Name : index < 6 ? "Lonely..." : "Empty"}</Text>
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
    alignSelf:"center",
  },
  list: {
    alignSelf: "center",
    height:405,
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
      width: 150
  },

});
