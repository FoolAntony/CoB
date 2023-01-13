import React, {useEffect, useState} from "react";
import {Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {
    battleResult,
    briberyMoneySet,
    briberyResult,
    getMonsterHP,
    monsterType,
    negotiation,
    rollDice
} from "../GameController";
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

let brib = 0

let turn_index = 0

let usedMembers = Array(9).fill({})


  function SquadIsOver(arr) {
    return arr.every(element => {
      if (element.WP === undefined) {
          return true
      } else return element.WP <= 0;
    });
}


function areEqual(array1, array2) {
    let values = (o) => Object.keys(o).sort().map(k => o[k]).join('|');
    let mapped1 = array1.map(o => values(o));
    let mapped2 = array2.map(o => values(o));

    return mapped1.every(v => mapped2.includes(v));
}




export default function Battlefield({route, navigation}) {
  const [money, updateMoney] = useState(CompleteSquad.money)
  const [team, updateTeam] = useState(TeamSet)
  const [state, send] = useMachine(battleMachine)
  const [monsters, updateMonsters] = useState(MonsterSet)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOption, setModalOption] = useState("showHeroInfo")
  const [member, showMember] = useState({});
  const [monster, showMonster] = useState({});
  const [dice, updateDice] = useState(null);
  const [chosenWeapon, setChosenWeapon] = useState(null);
  const [chosenSpell, setChosenSpell] = useState(null);



  let uptMonsters = MonsterSet;
  let uptTeam = JSON.parse(JSON.stringify(team));


  const SetMember = (member) => {
      switch (state.value) {
          default:
              setModalOption("showHeroInfo");
              showMember(member);
              setModalVisible(true);
              break;
          case "doNegotiation":
          case "doBribery":
              if(member.Name !== undefined) {
                  setModalOption("nextState")
                  showMember(member);
                  setModalVisible(true)
              } else {
                  Alert.alert("Player pressed on empty space! Please, choose the place where hero exist!")
              }
              break;
          case "heroesTurn":
              if(member.Name !== undefined && usedMembers.includes(member) === false) {
                  showMember(member);
              } else {
                  Alert.alert("Player pressed on empty space or hero must be already chosen!")
              }
              break;
      }
  }

  const SetEnemy = (monster) => {
      switch(state.value) {
          default:
              setModalOption("showMonsterInfo");
              showMonster(monster);
              setModalVisible(true);
              break;
          case "heroesTurn":
              if (member.Name !== undefined) {
                  setModalOption("nextState")
                  showMonster(monster)
                  setModalVisible(true)
              } else {
                  Alert.alert("Hero is not chosen yet or there is no monster!")
              }
      }
  }

  const ActionStates = () => {
    switch (state.value){
      case "idle":
        setModalOption("nextState");
        send("START");
        setModalVisible(true)
        break;
      case "doFight":
      case "monstersTurn":
         showMonster(monsters[8])
         setModalOption("nextState");
         setModalVisible(true);
         break;

    }
};

  const AfterDiceActionStates = (dice) => {
      switch (state.value) {
          case "kindOfMonsters":
              setModalOption("nextState")
              send("NEXT")
              break;
          case "monstersAmount":
              setModalOption("nextState")
              send("NEXT")
              let choice = monsterType(dice[0], dice[1], dice[2])
              placeMonsters(choice)
              break;
          case "findMonstersHP":
              let index = 8 - amount;
              if (uptMonsters[index - 1].Name !== undefined) {
                  setModalOption("nextState")
              } else {
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
                  Alert.alert("You have failed negotiation with " + res + " points. Try something else!")
              } else {
                  send("SUCCESS")
                  setModalVisible(false)
                  Alert.alert("You have succeeded negotiation with " + res + " points! Monsters leave you alone! Victory! ")
              }
              break;
          case "doBribery":
              if (brib > money) {
                  Alert.alert("Sorry, but you have not enough gold. You need " + (brib - money) + " more. The only way is to fight, I guess...")
              } else {
                  let strongest_monster = checkStrongestMonster()
                  let b_res = briberyResult(strongest_monster, brib)
                  if (dice > b_res) {
                      send("FAIL")
                      setModalVisible(false)
                      Alert.alert("You have failed bribery with result higher than " + b_res + ". Try something else!")
                  } else {
                      send("SUCCESS")
                      setModalVisible(false)
                      Alert.alert("You have succeeded bribery with result lower than " + b_res + "! Monsters leave you alone! Victory! ")
                  }
              }
              break;
          case "heroesTurn":
              let damage = battleResult((member.CB + dice + (member.WS !== null ? (member.WS[0] === chosenWeapon ? member.WS[1] : 0) : 0)), chosenWeapon)
              monster.WP = monster.WP - damage;
              usedMembers[turn_index] = member;
              if (SquadIsOver(monsters) === true) {
                  send("DONE")
                  setModalVisible(false)
              } else if (SquadIsOver(monsters) === false) {
                  if (areEqual(team, usedMembers) === true) {
                      send("FINISH")
                      usedMembers = Array(9).fill({})
                      turn_index = 0
                      setModalOption("showMonsterInfo")
                      showMember({})
                  } else if (areEqual(team, usedMembers) === false) {
                      setModalOption("showMonsterInfo")
                      showMember({})
                      turn_index += 1
                  }
              }
              break;
          case "monstersTurn":
              showMonster(monsters[8 - turn_index])
              if (member.Name === undefined) {
                  let id = 0
                  if (team[1].Name !== undefined) {
                      if (team[2].Name !== undefined) {
                          if (dice > 2 && dice < 5)
                              id = 1;
                          else if (dice > 4 && dice < 7)
                              id = 2;
                      } else if (team[2].Name === undefined) {
                          if (dice > 3)
                              id = 1;
                      }
                  }
                  showMember(team[id])
                  setModalOption("nextState")
              } else {
                  let m_damage = battleResult((monster.CB + dice), monster.Weapon ? monster.Weapon : "Monster")
                  member.WP = member.WP - m_damage;
                  usedMembers[turn_index] = monster;
                  if (SquadIsOver(team) === true) {
                      send("DONE")
                      setModalVisible(false)
                  } else if (areEqual(monsters, usedMembers) === true) {
                      send("FINISH")
                      usedMembers = Array(9).fill({})
                      turn_index = 0
                      setModalOption("showHeroInfo")
                      showMonster({})
                  } else if (areEqual(monsters, usedMembers) === false) {
                      setModalOption("showHeroInfo")
                      showMonster({})
                      turn_index += 1
                  }
              }
              break;
      }
  }

  function checkStrongestMonster () {
      let strongest = uptMonsters[8]
      for (let i = 0; i < uptMonsters.length; i++) {
          if (uptMonsters[i].WP > strongest.WP) {
              strongest = uptMonsters[i]
          }
      }
      return strongest
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
        case "doBribery":
            const [bribeIndex, changeBribeIndex] = useState(0)
            brib = briberyMoneySet[bribeIndex]
          return (
              <View>
                <Text style={styles.modalText}>Try to bribe!</Text>
                <Text style={styles.modalText}>You have to choose how much money you will give to the monsters!</Text>
                <Text style={styles.modalText}>Remember! Higher result (Highest WP over the squad + NV) require more money to succeed bribery.</Text>
                <Text style={styles.modalText}>You have {money} gold.</Text>
                <View style={{flexDirection:"row", height:50}}>
                    <TouchableOpacity
                        style={{marginLeft:10}}
                          onPress={() => {
                              changeBribeIndex(bribeIndex !== 0? bribeIndex - 1 : 8)
                          }}
                      >
                          <View style={[styles.button, {backgroundColor: "crimson", width:100}]}>
                              <Text style={styles.textStyle}>Decrease</Text>
                          </View>

                      </TouchableOpacity>
                    <View>
                        <Text style={styles.modalText}>You offer: {briberyMoneySet[bribeIndex]} gold.</Text>
                    </View>
                    <TouchableOpacity
                        style={{marginRight:10}}
                          onPress={() => {
                              changeBribeIndex(bribeIndex !== 8? bribeIndex + 1 : 0)
                          }}
                      >
                          <View style={[styles.button, {backgroundColor: "steelblue", width:100}]}>
                              <Text style={styles.textStyle}>Increase</Text>
                          </View>

                      </TouchableOpacity>
                </View>

              </View>
          )
        case "doFight":
          return (
              <View>
                <Text style={styles.modalText}>Let's Fight!</Text>
                <Text style={styles.modalText}>Are you sure you want to start battle?</Text>
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
          case "heroesTurn":
              return (
                  <View>
                    <Text style={styles.modalText}>{member.Name} is going to hit {monster.Name}</Text>
                    <Text style={styles.modalText}>What would you choose?</Text>
                  </View>
              )
          case "monstersTurn":
              return(
                  <View>
                      <Text style={styles.modalText}>{turn_index + 1} {monster.Name} {member.Name !== undefined ? " is going to hit " + member.Name : " is looking for a target!" + "\n" + "Find who will be chosen!"}</Text>
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
          case "findMonstersHP":
              switch(uptMonsters[8].Name) {
                  case "Troll":
                  case "Hydra":
                  case "Chimera":
                  case "Minotaur":
                      setModalOption("DiceRoll");
                      let d = []
                      d[0] = rollDice()
                      d[1] = rollDice()
                      updateDice(d)
                      break;
                  case "Gargoyle":
                      setModalOption("DiceRoll");
                      let dg = []
                      dg[0] = rollDice()
                      dg[1] = rollDice()
                      dg[2] = rollDice()
                      updateDice(dg)
                      break;
                  default:
                      setModalOption("DiceRoll");
                      updateDice(rollDice())
                      break;
              }
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
          case "doFight":
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
                            onPress={() => {
                                setModalVisible(false)
                                showMember({})
                                showMonster({})
                                send("HEROES")
                            }}
                          >
                              <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>Let's GO!</Text>
                              </View>
                          </TouchableOpacity>
                      </View>
                  </View>
              )
          case "heroesTurn":
              return(
                  <View style={{flexDirection:"row", paddingHorizontal:5}}>
                      <View style={{width:125}}>
                          <TouchableOpacity
                              onPress={() => {
                                  setModalOption("UseSpell")
                              }}
                          >
                              <View style={[styles.button, {backgroundColor: "tomato", width:100}]}>
                                  <Text style={styles.textStyle}>Cast Spell!</Text>
                              </View>

                          </TouchableOpacity>
                      </View>
                      <View style={{width:125}}>
                          <TouchableOpacity
                            onPress={() => {
                                setModalOption("UseWeapon")
                            }}
                          >
                              <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>Use Weapons!</Text>
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
                        onPress={() => {
                            setModalVisible(false)
                            showMember({})
                        }}
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
                        onPress={() => {
                            setModalVisible(false)
                            showMonster({})
                        }}
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
                        <Text style={styles.modalText}>Your Result: {"\n"} {Array.isArray(dice) ? dice[0] + " " + dice[1] + (dice[2]===undefined?"\n"  : " " + dice[2]) : dice}</Text>
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
        case "Message":
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
                    <ModalMessage/>
                  </View>
                </View>
              </Modal>
            )
        case "UseWeapon":
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
                    <Text>Choose {member.Name}'s Weapon to use!</Text>
                      <FlatList data={member.Weapon}
                                renderItem={({item, index}) => (
                          <TouchableOpacity onPress={() => {
                              Dice()
                              setChosenWeapon(item)
                          }}>
                            <View style={[styles.buttonClose]}>
                              <Text style={styles.textButton}>{item}</Text>
                            </View>
                          </TouchableOpacity>
                    )}/>
                  </View>
                </View>
              </Modal>
        );

        case "UseSpell":
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
                      setModalOption("nextState")
                      setModalVisible(true)
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
      case "heroesTurn":
        return(
                <View style={[styles.textButtonContainer, {backgroundColor: null, width: 300}]}>
                  <Text style={[styles.textButton, {color: "black"}]}>{member.Name ? "Choose monster to attack ":"Choose hero who attack!"}</Text>
                </View>
          )
        case "monstersTurn":
            return(
              <TouchableOpacity onPress={ActionStates}>
                <View style={styles.textButtonContainer}>
                  <Text style={styles.textButton}>Enemies Turn!</Text>
                </View>
              </TouchableOpacity>
          )
        case "endSession":
            return(
                <View style={[styles.textButtonContainer, {backgroundColor: null, width: 300}]}>
                      <Text style={[styles.textButton, {color: "black"}]}>Fight Completed!</Text>
                </View>
            )
    }
  }


  useEffect(() => {
    updateTeam(CompleteSquad.squad);
    console.log(state.value);
    console.log(usedMembers);
    console.log(turn_index);
    console.log(team)
  }, [CompleteSquad, state, uptMonsters, usedMembers, turn_index, team])


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
