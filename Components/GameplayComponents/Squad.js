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
    Team,
} from "../SquadController";
import {findPrimarySun, getSpell, getWeapon, magicPotential, rollDice, spellsList} from "../GameController";
import {TextInput} from "react-native-gesture-handler";

export let CompleteSquad = {
    squad: Array(9).fill({}),
    money: 0
}

let chosen = ""

let spellNumber = 1

const idUsed = [];

export default function Squad({route, navigation}) {
    const [state, send] = useMachine(teamMachine);
    const [team, updateTeam] = useState(route.params.squad);
    const [modalVisible, setModalVisible] = useState(false);
    const [member, showMember] = useState({});
    const [modalOption, setModalOption] = useState("showHeroInfo");
    const [dice, updateDice] = useState(null);
    const [sun, setSun] = useState(null)

    useEffect(() => {
        console.log(team)
        console.log(state.value);
        console.log("Sun:"+ sun);
        console.log("Chosen: "+chosen);
        console.log("SpellNum: " + spellNumber)
  }, [state, team, sun, chosen])

    let upTeam = Team;

    const NavigateToBoard = () => {
        navigation.navigate({
          name: "Board",
          params: {
              level: 1,
              squad: team,
              money: 0,
              XP: 0
          }
      });
    }


    const teamAddNewMember = () => {
    if(state.context.amount < 3) {
      let id = checkHeroDuplication()
      console.log(idUsed)
      send("ADD")
      upTeam[state.context.amount] = getRandomHero(id)
      updateTeam(upTeam)
      SetMember(team[state.context.amount]);
    }
    else{
      console.log("Thank you!")
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
                 setModalOption("Error")
             }

             break;
         case "addMana":
             upTeam[state.context.amount].MP = magicPotential(data)
             updateTeam(upTeam)
             send("NEXT")
             SetMember(team[state.context.amount])
             CompleteSquad.squad = team
             break;
         case "primarySun":
             setSun(findPrimarySun(data))
             send("NEXT")
             setModalVisible(false)
             break;
         case "addHeroSpell":
             if (upTeam[state.context.hasSpells].MP[sun] >= spellNumber) {
                 if (upTeam[state.context.hasSpells].Spells.includes((spell) => spell === data) === false) {
                     upTeam[state.context.hasSpells].Spells.push(data)
                     updateTeam(upTeam)
                     setModalOption("nextState")
                     spellNumber++
                 } else {
                    setModalOption("Error")
                 }
             } else if (state.context.hasSpells !== 5){
                 setModalOption("Error")
                 spellNumber = 1
                 send("ADD")
             } else if (state.context.hasSpells === 5) {
                 setModalOption("Error")
             }
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
         case "primarySun":
             return(
                 <View>
                     <Text style={styles.modalText}>Now you will choose your Primary Sun!</Text>
                     <Text style={styles.modalText}>Your Hero's amount of Spells will depend on their number for Primary Sun</Text>
                     <Text style={styles.modalText}>Possible results:</Text>
                     <Text style={styles.modalText}>1-2: Red</Text>
                     <Text style={styles.modalText}>3-4: Yellow</Text>
                     <Text style={styles.modalText}>5-6: Blue</Text>
                 </View>
             )
         case "addHeroSpell":
             const [spellIndex, changeSpellIndex] = useState(0)
             chosen = spellsList[spellIndex]
             return(
                 <View>
                     <Text style={styles.modalText}>Choose {team[state.context.hasSpells].Name}'s {spellNumber} Spell from the list of Spells!</Text>
                     <Text style={styles.modalText}>Read more about each spell in the Info section.</Text>
                     <Text style={styles.modalText}>This hero can have {team[state.context.hasSpells].MP[sun] - spellNumber + 1}</Text>
                     <Text style={styles.modalText}>REMEMBER:</Text>
                     <Text style={styles.modalText}>(C): Combat-Only Spells</Text>
                     <Text style={styles.modalText}>(NC): Non-Combat-Only Spells</Text>
                     <Text style={styles.modalText}>(N): Negotiation Spells</Text>
                     <Text style={styles.modalText}>(B): Bribery Spells</Text>
                     <View style={{flexDirection:"row", height:50}}>
                        <TouchableOpacity
                            style={{marginLeft:10}}
                              onPress={() => {
                                  changeSpellIndex(spellIndex !== 0? spellIndex - 1 : 23)
                              }}
                          >
                              <View style={[styles.button, {backgroundColor: "crimson", width:100}]}>
                                  <Text style={styles.textStyle}>Previous</Text>
                              </View>
                          </TouchableOpacity>
                        <View style={{width:100}}>
                            <Text style={[styles.textStyle, {color:"black"}]}>{chosen}</Text>
                        </View>
                        <TouchableOpacity
                            style={{marginRight:10}}
                              onPress={() => {
                                  changeSpellIndex(spellIndex !== 23? spellIndex + 1 : 0)
                              }}
                          >
                              <View style={[styles.button, {backgroundColor: "steelblue", width:100}]}>
                                  <Text style={styles.textStyle}>Next</Text>
                              </View>
                          </TouchableOpacity>
                    </View>
                 </View>
             )
         case "addName":
             return(
                 <Text style={styles.modalText}>Name Your New Follower!</Text>
             )
     }
  }

  function ModalButton() {
        switch (state.value) {
            default:
                return(
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={Dice}
                    >
                      <Text style={styles.textStyle}>Roll a Dice!</Text>
                    </TouchableOpacity>
                )
            case "addHeroSpell":
                return(
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => FollowerStates(chosen)}
                    >
                      <Text style={styles.textStyle}>Choose!</Text>
                    </TouchableOpacity>
                )
        }
  }

  function ErrorMessage() {
        switch (state.value) {
            case "addWeapon":
                return(
                    <View>
                        <Text style={styles.modalText}>WARNING!</Text>
                        <Text style={styles.modalText}>Your dice result has been repeated, but all weapons must be unique. Roll Again!</Text>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalOption("nextState")}
                        >
                          <Text style={styles.textStyle}>OK!</Text>
                        </TouchableOpacity>
                    </View>
                );
            case "addHeroSpell":
                 if (state.context.hasSpells !== 5) {
                    return (
                        <View>
                            <Text style={styles.modalText}>WARNING!</Text>
                            <Text style={styles.modalText}>This hero's spells limit has been exceeded!</Text>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalOption("nextState")}
                        >
                          <Text style={styles.textStyle}>OK!</Text>
                        </TouchableOpacity>
                        </View>
                    );
                }
                 break;
            case "finish":
                return (
                        <View>
                            <Text style={styles.modalText}>WARNING!</Text>
                            <Text style={styles.modalText}>All heroes got their spells!</Text>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => {
                                setModalOption("nextState")
                                setModalVisible(false)
                            }}
                        >
                          <Text style={styles.textStyle}>OK!</Text>
                        </TouchableOpacity>
                    </View>
                    );
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
                    <Text style={styles.modalText}>{member.MP ? "Mana Points / MP (Red/Yellow/Blue): \n" + member.MP : undefined}</Text>
                    <Text style={styles.modalText}>{member.Spells ? "Spells: " + member.Spells : undefined}</Text>
                    <Text style={styles.modalText}>{member.RV ? "Resistance / RV: " + member.RV : undefined}</Text>
                    <Text style={styles.modalText}>{member.CB ? "Combat Bonus : " + member.CB : undefined}</Text>
                    <Text style={styles.modalText}>{member.Weapon ? "Weapons: " + member.Weapon : undefined}</Text>
                    <Text style={styles.modalText}>{member.WS ? "Weapon Skills: " + member.WS.map((weaponSkill) => {return "{" + weaponSkill.Type + ": +" + weaponSkill.Damage + (weaponSkill.Magic ? ", Magic} " : "} ")}) : undefined}</Text>
                    <Text style={styles.modalText}>{member.Skill ? "Hero Skills: " + member.Skill.map((skill) => {return "{" + skill.Name + ": +" + skill.Value + "} "}) : undefined}</Text>
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
                    <ModalButton/>
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
        case "Error":
            return(
                <Modal
                      animationType="fade"
                      transparent={true}
                      visible={modalVisible}
                      onRequestClose={() => {
                        console.log("Modal has been closed.");
                        setModalVisible(() => false);
                      }}>
                    <View style={styles.centeredView}>
                         <View style={styles.modalView}>
                            <ErrorMessage/>
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
            <TouchableOpacity style={{paddingTop:55}} onPress={teamAddNewMember}>
              <View style={styles.textButtonContainer}>
                <Text style={styles.textButton}>Add New Hero!</Text>
              </View>
            </TouchableOpacity>
        );

     case "addFollowers":
        return (
            <TouchableOpacity style={{paddingTop:55}}  onPress={addNewFollower}>
              <View style={styles.textButtonContainer}>
                <Text style={styles.textButton}>Add New Follower!</Text>
              </View>
            </TouchableOpacity>
        );
     case "primarySun":
        return (
            <TouchableOpacity style={{paddingTop:55}}  onPress={addNewFollower}>
              <View style={styles.textButtonContainer}>
                <Text style={styles.textButton}>Find your Primary Sun!</Text>
              </View>
            </TouchableOpacity>
        );

     case "addHeroSpell":
        return (
            <TouchableOpacity style={{paddingTop:55}}  onPress={addNewFollower}>
              <View style={styles.textButtonContainer}>
                <Text style={styles.textButton}>Add Spells!</Text>
              </View>
            </TouchableOpacity>
        );

      case "finish":
        return (
            <TouchableOpacity style={{paddingTop:55}}  onPress={NavigateToBoard}>
              <View style={styles.textButtonContainer}>
                <Text style={styles.textButton}>Next Stage!</Text>
              </View>
            </TouchableOpacity>
        );
    }
 }


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
    height:455,
    width:360,
    paddingTop:40,
    alignSelf: "center",
  },
  flatlist: {
      alignContent: "center"
  },
  separator: {
    height: 15,
    width:10
  },
  buttonAdd: {
    paddingBottom:150
  },
  headerTextContainer: {
      paddingTop:10
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
    color:"white"
  },
  textButtonContainer: {
    borderColor:'grey',
    borderRadius:4,
    width:200,
    alignSelf:'center',
    justifyContent: 'center',
    height:40,
    backgroundColor:'#4040a1',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
      width: 150
  },

});

