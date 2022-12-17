import React, {useEffect, useState} from "react";
import {Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {getMonsterHP, monsterType, negotiation, rollDice} from "../GameController";
import {CompleteSquad} from "./Squad";
import {useMachine} from "@xstate/react";
import {battleMachine} from "../StateMachine/StateMachine.Battle";

const TeamSet = [ {} , {} , {} ,
                  {} , {} , {} ,
                  {} , {} , {} ]

const MonsterSet = [ {} , {} , {} ,
                     {} , {} , {} ,
                     {} , {} , {} ]

let multipleDices = Array(3)

let amount = 0;

export default function Battlefield() {

  const [team, updateTeam] = useState(TeamSet)
  const [state, send] = useMachine(battleMachine)
  const [monsters, updateMonsters] = useState(MonsterSet)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOption, setModalOption] = useState("showHeroInfo")
  const [member, showMember] = useState({});
  const [monster, showMonster] = useState({})
  const [dice, updateDice] = useState(null);

  let uptMonsters = MonsterSet;
  let uptTeam = TeamSet;


  const SetMember = (member) => {
      switch (state.value) {
          default:
              setModalOption("showHeroInfo");
              showMember(member);
              setModalVisible(true);
              break;
          case "doNegotiation":
          case "doBribery":
          case "doFight":
              if(member.Name !== undefined) {
                  setModalOption("nextState")
                  showMember(member);
                  setModalVisible(true)
              } else {
                  Alert.alert("Player pressed on empty space! Please, choose the place where hero exist!")
              }
              break;
      }
  }

  const SetEnemy = (monster) => {
      setModalOption("showMonsterInfo");
      showMonster(monster);
      setModalVisible(true);
  }

  const ActionStates = () => {
    switch (state.value){
      case "idle":
        setModalOption("nextState");
        send("START");
        setModalVisible(true)
        break;
      case "doNegotiation":
          break;
    }
};

  const AfterDiceActionStates = (dice) => {
      switch (state.value){
          case "kindOfMonsters":
              setModalOption("nextState")
              send("NEXT")
              break;
          case "monstersAmount":
              setModalOption("nextState")
              send("NEXT")
              let choice = monsterType(dice[0],dice[1],dice[2])
              placeMonsters(choice)
              break;
          case "findMonstersHP":
              let index = 8 - amount;
              if (uptMonsters[index - 1].Name !== undefined) {
                  setModalOption("nextState")
              }
              else{
                  setModalVisible(false);
                  send("NEXT")
              }
              getMonsterHP(uptMonsters[index], dice);
              updateMonsters(uptMonsters)
              amount++;
              break;
          case "doNegotiation":
              let res = negotiation(dice, member, monsters[8])
              if (res <= 6) {
                  send("FAIL")
                  setModalVisible(false)
                  Alert.alert("You have failed negotiation with "+ res + " points. Try something else!")
              }
              else {
                  send("SUCCESS")
                  setModalVisible(false)
                  Alert.alert("You have succeeded negotiation with "+ res +" points! Monsters leave you alone! Victory! ")
              }
      }
  }

  const placeMonsters = (item) => {
      for (let i = 8; i > 8 - item.amount; i--) {
          uptMonsters[i] = JSON.parse(JSON.stringify(item.monster))
      }
      updateMonsters(uptMonsters)
  }

  function NextStateTemplate() {
  switch (state.value) {
    case "doNegotiation":
      return (
          <View>
            <Text style={styles.modalText}>{member.Name} will try to negotiate!</Text>
            <Text style={styles.modalText}>His negotiation value is: {member.Skill[0] === "Negotiation" ? member.Skill[1] : 0}</Text>
            <Text style={styles.modalText}>Do you want to try?</Text>
          </View>

      )
    case "doTrade":
      return (
          <View>
            <Text style={styles.modalText}>Try to trade!</Text>
            <Text style={styles.modalText}>Possible results:</Text>
            <Text style={styles.modalText}>1: Dagger</Text>
            <Text style={styles.modalText}>2: Throwing Dagger</Text>
            <Text style={styles.modalText}>3: Bow</Text>
            <Text style={styles.modalText}>4: Sword</Text>
            <Text style={styles.modalText}>5: Hammer</Text>
            <Text style={styles.modalText}>6: Axe</Text>
          </View>
      )
    case "doFight":
      return (
          <View>
            <Text style={styles.modalText}>Let's Fight!</Text>
            <Text style={styles.modalText}>Possible results:</Text>
            <Text style={styles.modalText}>1: Dagger</Text>
            <Text style={styles.modalText}>2: Throwing Dagger</Text>
            <Text style={styles.modalText}>3: Bow</Text>
            <Text style={styles.modalText}>4: Sword</Text>
            <Text style={styles.modalText}>5: Hammer</Text>
            <Text style={styles.modalText}>6: Axe</Text>
          </View>
      )
    case "monstersAmount":
              return (
          <View>
            <Text style={styles.modalText}>How many monsters there are?</Text>
            <Text style={styles.modalText}>The amount is calculated by dice result + monster's personal constants</Text>
          </View>
      )
    case "kindOfMonsters":
      return (
          <View>
            <Text style={styles.modalText}>What are your enemies?</Text>
            <Text style={styles.modalText}>You will roll two dices. Your enemy type will be chosen by the intersection of these numbers in the monster table: </Text>
          </View>
      )
    case "findMonstersHP":
          return (
          <View>
            <Text style={styles.modalText}>Find Wound Points for {amount + 1} {monsters[8].Name}:</Text>
            <Text style={styles.modalText}>The Wound Points are calculated by dice result + monster's personal constants.</Text>
          </View>
      )
  }
}

 const Dice = () => {
      switch (state.value) {
          case "kindOfMonsters":
              setModalOption("DiceRoll");
              multipleDices[0] = rollDice()
              multipleDices[1] = rollDice()
              updateDice(multipleDices)
              break;
          case "monstersAmount":
              setModalOption("DiceRoll");
              multipleDices[2] = rollDice()
              updateDice(multipleDices)
              break;
          default:
              setModalOption("DiceRoll");
              updateDice(rollDice())
              break;
      }

};

  function ModalButton() {
      switch (state.value){
          default:
              return(
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={Dice}
                    >
                      <Text style={styles.textStyle}>Roll a Dice!</Text>
                    </TouchableOpacity>
              )
          case "doNegotiation":
          case "doFight":
          case "doBribery":
              return(
                  <View style={{flexDirection:"row", paddingHorizontal:5}}>
                      <View style={{width:125}}>
                          <TouchableOpacity
                              onPress={() => {
                                  send("BACK")
                                  setModalVisible(false)
                              }}
                          >
                              <View style={[styles.button, {backgroundColor: "tomato", width:100}]}>
                                  <Text style={styles.textStyle}>Cancel</Text>
                              </View>

                          </TouchableOpacity>
                      </View>
                      <View style={{width:125}}>
                          <TouchableOpacity
                            onPress={Dice}
                          >
                              <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>Roll a Dice!</Text>
                              </View>
                          </TouchableOpacity>
                      </View>
                  </View>
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
                    <Text style={styles.modalText}>{member.Name ? "Name: " + member.Name : "Empty!"}</Text>
                    <Text style={styles.modalText}>{member.Race ? "Race: " + member.Race : undefined}</Text>
                    <Text style={[styles.modalText, {backgroundColor: member.WP ? "red" : null}]}>{member.WP ? "Wound Points / WP: " + member.WP : undefined}</Text>
                    <Text style={[styles.modalText, {backgroundColor: member.MP ? "aqua" : null}]}>{member.MP ? "Mana Points / MP (Red/Yellow/Blue): " + member.MP : undefined}</Text>
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
      case "showMonsterInfo":
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
                    <Text style={styles.modalText}>{monster.Name ? "Name: " + monster.Name : "Empty!"}</Text>
                    <Text style={[styles.modalText, {backgroundColor: monster.WP ? "red" : null}]}>{monster.WP ? "Wound Points / WP: " + monster.WP : undefined}</Text>
                    <Text style={styles.modalText}>{monster.RV ? "Resistance / RV: " + monster.RV : undefined}</Text>
                    <Text style={styles.modalText}>{monster.NV ? "Negotiation Resistance / NV: " + monster.NV : undefined}</Text>
                    <Text style={styles.modalText}>{monster.Weapon ? "Weapons: " + monster.Weapon : undefined}</Text>
                    <Text style={styles.modalText}>{monster.Spells ? "Spells: " + monster.Spells : undefined}</Text>
                    <Text style={styles.modalText}>{monster.Skill ? "Monster Specials: " + "+" + monster.Skill[1] + " in " + monster.Skill[0] : undefined}</Text>
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
                        <Text style={styles.modalText}>Your Result: {dice.isArray ? dice[0] + ", " +dice[1] + dice[3]===undefined? null : dice[3] : dice}</Text>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => AfterDiceActionStates(dice)}
                        >
                          <Text style={styles.textStyle}>Go Next Step!</Text>
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
    }
  }


  const itemSeparator = () => {
    return(<View style={styles.separator}/>)
  }

  function TeamField() {
    return(
        <View style={styles.list}>
        <FlatList
            style={styles.flatlist}
            scrollEnabled={false}
            ItemSeparatorComponent={itemSeparator}
            data={team}
            numColumns={3}
            renderItem={({item, index}) => (
                <View style={{alignSelf:"center", opacity: item.Name ? null : 0.6}}>
                  <TouchableOpacity onPress={() => SetMember(item)}>
                    <View style={[styles.textContainer, {backgroundColor: item.Name ? "silver" : "grey"}]}>
                      <Text style={styles.text}>{item.Name ? item.Name : "Empty"}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
            )}
        />
      </View>
    )
  }

  function MonstersField() {
    return(
        <View style={[styles.list, {paddingTop: 5}]}>
        <FlatList
            style={styles.flatlist}
            scrollEnabled={false}
            ItemSeparatorComponent={itemSeparator}
            data={monsters}
            numColumns={3}
            renderItem={({item, index}) => (
                <View style={{alignSelf:"center", opacity: item.Name ? null : 0.6}}>
                  <TouchableOpacity onPress={() => SetEnemy(item)}>
                    <View style={[styles.textContainer, {backgroundColor: item.Name ? "maroon" : "black"}]}>
                      <Text style={[styles.text, {color:"white"}]}>{item.Name ? item.Name : "Empty"}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
            )}
        />
      </View>
    )
  }

  function EventButton() {
    switch (state.value) {
      case "idle":
        return(
              <TouchableOpacity onPress={ActionStates}>
                <View style={styles.textButtonContainer}>
                  <Text style={styles.textButton}>Start!</Text>
                </View>
              </TouchableOpacity>
          )
      case "chooseAction":
        return(
            <View style={{flexDirection:"row", paddingHorizontal:5}}>
                <View style={{width:125}}>
                  <TouchableOpacity  onPress={() => {
                      send(state.context.isNoNegotiationWas ? "NEGOTIATE" : "BRIBE")
                      ActionStates()
                  }}>
                    <View style={[styles.textButtonContainer, {width: 100}]}>
                      <Text style={styles.textButton}>{state.context.isNoNegotiationWas ? "Negotiate!" : "Bribe!"}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{width:125}}>
                  <TouchableOpacity  onPress={() => {
                      send("FIGHT")
                      ActionStates()
                  }}>
                    <View style={[styles.textButtonContainer, {width: 100}]}>
                      <Text style={styles.textButton}>Fight!</Text>
                    </View>
                  </TouchableOpacity>
                </View>
            </View>
        );
      case "doNegotiation":
        return(
                <View style={[styles.textButtonContainer, {backgroundColor: null, width: 250}]}>
                  <Text style={[styles.textButton, {color: "black"}]}>Click on your negotiator!</Text>
                </View>
          );
      case "doBribery":
        return(
                <View style={[styles.textButtonContainer, {backgroundColor: null, width: 300}]}>
                  <Text style={[styles.textButton, {color: "black"}]}>Click on person who will bribe!</Text>
                </View>
          )
      case "doFight":
        return(
                <View style={[styles.textButtonContainer, {backgroundColor: null, width: 300}]}>
                  <Text style={[styles.textButton, {color: "black"}]}>Click on hero you want to attack!</Text>
                </View>
          )
    }
  }

  useEffect(() => {
    updateTeam(CompleteSquad);
    console.log(state.value);
    console.log("Dice: " + dice);
    console.log(uptMonsters);
    console.log("Amount: " + amount)
  }, [CompleteSquad, state, dice, uptMonsters, amount])


  return (
    <View style={styles.container}>
      <View style={{paddingBottom:10}}>
        <Text style={styles.textHeader}>FIGHT!</Text>
      </View>
      <MonstersField/>
      <ModalScreen/>
      <TeamField/>
      <View style={{paddingTop:10}}>
        <EventButton/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"center",
    alignItems:"center"
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
    height:35,
    backgroundColor:'#4040a1',

  },
  list: {
    alignItems: "center",
    height:250,
    width:300,
    borderColor:"red",
  },
  flatlist: {
    alignContent: "center"
  },
  textContainer: {
    alignContent: "center",
    alignItems:"center",
    width: 80,
    height: 80,
    borderWidth:2,
    borderColor:"grey",
    borderRadius: 10
  },
  text: {
    textAlign:"center",
    fontSize:18,
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
    textAlign: "center",
  },
  textHeader: {
    fontSize:22,
    alignSelf:"center"
  },
});
