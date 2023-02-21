import React, {useEffect, useState} from "react";
import {Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {
    battleResult,
    briberyMoneySet,
    briberyResult, getMagicItem,
    getMonsterHP, halfDiceRoll, jewelryTable, magicItemsTable,
    monsterType,
    negotiation,
    rollDice, treasureGoldTable, treasureJewelryTable, treasureMagicItemTable, weaponBonus
} from "../GameController";
import {useMachine} from "@xstate/react";
import {battleMachine} from "../StateMachine/StateMachine.Battle";

const MonsterSet = [ {} , {} , {} ,
                     {} , {} , {} ,
                     {} , {} , {} ]

let multipleDices = Array(3)

let total_WP = 0;

let amount = 0;

let brib = 0

let turn_index = 0

let usedMembers = Array(9).fill({})

let jewelry_amount = 0

let magicItemsAmount = 0


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
  const [gold, updateGold] = useState(route.params.money)
  const [team, updateTeam] = useState(route.params.squad);
  const [xp, updateXP] = useState(route.params.XP)
  const [state, send] = useMachine(battleMachine)
  const [monsters, updateMonsters] = useState(MonsterSet)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOption, setModalOption] = useState("showHeroInfo")
  const [member, showMember] = useState({});
  const [monster, showMonster] = useState({});
  const [dice, updateDice] = useState(null);
  const [chosenWeapon, setChosenWeapon] = useState(null);
  const [chosenSpell, setChosenSpell] = useState(null);
  const [jewelryCost, updateJewelryCost] = useState(null);
  const [magicItem, updateMagicItem] = useState({});
  const [numOfDices, changeNumOfDices] = useState(1);
  const [receivedWeaponDamage, updateReceivedWeaponDamage] = useState(0)


  let uptMonsters = MonsterSet;


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
          case "assignJewelry":
              if(member.Name !== undefined){
                  setModalOption("nextState")
                  setModalVisible(true)
                  showMember(member)
              } else
                  Alert.alert("Please, choose the place where the hero exist!")
              break;
          case "assignMagicItem":
              if(member.Name !== undefined){
                  setModalOption("nextState")
                  setModalVisible(true)
                  showMember(member)
              } else
                  Alert.alert("Please, choose the place where the hero exist!")
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
              if (member.Name !== undefined && monster.Name !== undefined) {
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
         showMonster(monsters[8])
         setModalOption("nextState");
         setModalVisible(true);
         break;
      case "monstersTurn":
          if(monsters[8 - turn_index].WP <= 0) {
              do {
                  turn_index += 1
                  usedMembers[turn_index - 1] = monsters[8 - turn_index + 1]
              } while (monsters[8 - turn_index].WP <= 0)
          }
         showMonster(monsters[8])
         setModalOption("nextState");
         setModalVisible(true);
         break;
      case "getGold":
         setModalVisible(true)
         setModalOption("nextState")
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
                  amount++;
              } else {
                  setModalVisible(false);
                  send("NEXT")
                  amount = 0
              }
              getMonsterHP(uptMonsters[index], dice);
              total_WP += uptMonsters[index].WP
              updateMonsters(uptMonsters)
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
              if (brib > gold) {
                  Alert.alert("Sorry, but you have not enough gold. You need " + (brib - gold) + " more. The only way is to fight, I guess...")
              } else {
                  let strongest_monster = checkStrongestMonster()
                  let b_res = briberyResult(strongest_monster, brib)
                  if (dice > b_res) {
                      send("FAIL")
                      setModalVisible(false)
                      Alert.alert("You have failed bribery with result higher than " + b_res + ". Try something else!")
                  } else {
                      let gold_left = gold - brib
                      updateGold(gold_left)
                      navigation.setParams({
                          money: gold_left
                      });
                      send("SUCCESS")
                      setModalVisible(false)
                      Alert.alert("You have succeeded bribery with result lower than " + b_res + "! Monsters leave you alone! Victory! ")
                  }
              }
              break;
          case "heroesTurn":
              let damage = 0
              if(chosenWeapon !== null) {
                  damage = battleResult(member, dice, chosenWeapon)
              } else if (chosenSpell !== null){

              }
              monster.WP = monster.WP - damage;
              monster.WP = 0
              usedMembers[turn_index] = member;
              setChosenWeapon(null)
              setChosenSpell(null)
              showMember({})
              updateDice(null)
              if (SquadIsOver(monsters) === true) {
                  setModalVisible(false)
                  usedMembers = Array(9).fill({})
                  turn_index = 0
                  updateXP((xp) => xp + total_WP * 6)
                  navigation.setParams({
                      XP: xp
                  });
                  // placeMonsters({monster: {}, amount: 9})
                  send("DONE")
              } else if (SquadIsOver(monsters) === false) {
                  if (areEqual(team, usedMembers) === true) {
                      send("FINISH")
                      usedMembers = Array(9).fill({})
                      turn_index = 0
                      setModalOption("showMonsterInfo")

                  } else if (areEqual(team, usedMembers) === false) {
                      setModalOption("showMonsterInfo")
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
                  let m_damage = battleResult(monster, dice,monster.Weapon ? monster.Weapon : "Monster")
                  member.WP = member.WP - m_damage;
                  usedMembers[turn_index] = monster;
                  if(monsters[8 - turn_index - 1].WP <= 0) {
                      do {
                          turn_index += 1
                          usedMembers[turn_index] = monsters[8 - turn_index]
                      } while (monsters[8 - turn_index - 1].WP <= 0 && turn_index <= 8)
                      turn_index -= 1
                  }
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
          case "getGold":
              total_WP = 0
              if(treasureGoldTable[monsters[8].Treasure[0]][0] >= dice)
                  send("EXIST")
              else
                  send("NEXT")
              setModalOption("nextState")
              break;
          case "findGold":
              let mult = treasureGoldTable[monsters[8].Treasure[0]][1]
              let gold_added = gold
              switch(monsters[8].Treasure[0]){
                  default:
                      gold_added += dice * mult
                      updateGold(gold_added)
                      navigation.setParams({
                        money: gold_added,
                        XP: xp
                      });
                      break;
                  case 3:
                  case 6:
                  case 11:
                  case 7:
                  case 10:
                      gold_added += dice.reduce((a, b) => a + b, 0) * mult
                      updateGold(gold_added)
                      navigation.setParams({
                        money: gold_added,
                        XP: xp
                      });
                      break;
              }
              send("NEXT")
              setModalOption("nextState")
              break;
          case "getJewelry":
              if(treasureJewelryTable[monsters[8].Treasure[0]][0] >= dice)
                  send("EXIST")
              else
                  send("NEXT")
              setModalOption("nextState")
              break;
          case "findJewelry":
              if (jewelry_amount === 0)
                  jewelry_amount = dice;
              else {
                  updateJewelryCost(jewelryTable(dice[0] + dice[1]))
                  send("NEXT")
                  setModalVisible(false)
              }
              setModalOption("nextState")
              break;
          case "getMagicItem":
              if(treasureMagicItemTable[monsters[8].Treasure[0]][0] >= dice)
                  send("EXIST")
              else {
                  if(monsters[8 - turn_index - 1].Name !== undefined) {
                      send("NEXT")
                      turn_index += 1
                  }
                  else {
                      setModalVisible(false)
                      send("DONE")
                      turn_index = 0
                  }
              }
              setModalOption("nextState")
              break;
          case "findMagicItem":
              if (magicItemsAmount === 0) {
                  if (monsters[8].Treasure[0] !== 11 && monsters[8].Treasure[0] !== 10 && monsters[8].Treasure[0] !== 9)
                      magicItemsAmount = 1
                  else
                      magicItemsAmount = halfDiceRoll(dice)
                  setModalOption("nextState")
                  break;
              }
              else if (magicItem.type === undefined) {
                  let recievedMagicItem = getMagicItem(dice[0], dice[1])
                  updateMagicItem(getMagicItem(dice[0], dice[1]))
                  if (recievedMagicItem.type !== "Weapon" && recievedMagicItem.effect !== "Throw twice") {
                      send("NEXT")
                      setModalVisible(false)
                  } else {
                      setModalOption("nextState")
                  }
                  setModalOption("nextState")
                  break;
              } else {
                  if(magicItem.type === "Weapon"){
                      if (dice === 6){
                          changeNumOfDices((num) => num + 1)
                      } else {
                          updateReceivedWeaponDamage((dmg) => dmg + weaponBonus(dice))
                          if(numOfDices > 1)
                              changeNumOfDices((num) => num - 1)
                          else {
                              send("NEXT")
                              setModalVisible(false)
                          }
                      }
                  } else if (magicItem.type === "Armor"){
                      if (dice === 6){
                          changeNumOfDices((num) => num + 1)
                      } else {
                          updateMagicItem((item) => item.effect === "Throw twice"? item.effect = magicItemsTable[1][dice - 1] : item.effect + magicItemsTable[1][dice - 1])
                          if(numOfDices > 1)
                              changeNumOfDices((num) => num - 1)
                          else {
                              send("NEXT")
                              setModalVisible(false)
                          }
                      }
                  }
                  setModalOption("nextState")
                  break;
              }
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
          if(state.value === "monstersAmount")
              uptMonsters[i].id = i
      }
      updateMonsters(uptMonsters)
  }


  function NextStateTemplate() {
      switch (state.value) {
        case "doNegotiation":
            let negotiationSkill = member.Skill.find((skill) => skill.Name === "Negotiation")
          return (
              <View>
                <Text style={styles.modalText}>{member.Name} will try to negotiate!</Text>
                <Text style={styles.modalText}>His negotiation value is: {negotiationSkill.Name === "Negotiation" ? negotiationSkill.Value : 0}</Text>
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
                <Text style={styles.modalText}>You have {gold} gold.</Text>
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
          case "getGold":
              return(
                  <View>
                      <Text style={styles.modalText}>Check if there is gold with {turn_index + 1} {monsters[8].Name}</Text>
                  </View>
              )
          case "findGold":
              return(
                  <View>
                      <Text style={styles.modalText}>Check how much gold {turn_index + 1} {monsters[8].Name} has! </Text>
                  </View>
              )
          case "getJewelry":
              return(
                  <View>
                      <Text style={styles.modalText}>Check if there are any jewelries with {turn_index + 1} {monsters[8].Name}</Text>
                  </View>
              )
          case "findJewelry":
              return(
                  <View>
                      <Text style={styles.modalText}>{jewelry_amount === 0 ? "Check how many jewelries founded!" : "Check the price of found jewelries!"}</Text>
                  </View>
              )
          case "assignJewelry":
              let member_wallet = member.Treasure.reduce((a, b) => a + b, 0)
              return(
                  <View>
                      <Text style={styles.modalText}>{member.Name} will get this jewelry!</Text>
                      <Text style={styles.modalText}>His jewelries cost equals {JSON.stringify(member_wallet)}.</Text>
                      <Text style={styles.modalText}>Found jewelry costs {jewelryCost} golds.</Text>
                      <Text style={styles.modalText}>Do you accept it?</Text>
                  </View>
              )
          case "getMagicItem":
              return(
                  <View>
                      <Text style={styles.modalText}>Check if there are any Magic Items with {turn_index + 1} {monsters[8].Name}</Text>
                  </View>
              )
          case "findMagicItem":
              if(magicItemsAmount === 0) {
                  return (
                      <View>
                          <Text style={styles.modalText}>Check how many magic items there are!</Text>
                      </View>
                  )
              } else if (magicItem.type === undefined){
                  return(
                      <View>
                          <Text style={styles.modalText}>Check what kind of magic item there is!</Text>
                      </View>
                  )
              } else if (magicItem.type === "Weapon"){
                  return(
                      <View>
                          <Text style={styles.modalText}>Find the damage for {magicItem.effect}</Text>
                          <Text style={styles.modalText}>Current damage: {receivedWeaponDamage}</Text>
                          <Text style={styles.modalText}>Remaining dice rolls: {numOfDices}</Text>
                      </View>
                  )
              } else if (magicItem.type === "Armor"){
                  return(
                      <View>
                          <Text style={styles.modalText}>Find the resistance of Armor!</Text>
                          <Text style={styles.modalText}>Current resistance value: {magicItem.effect}</Text>
                          <Text style={styles.modalText}>Remaining dice rolls: {numOfDices}</Text>
                      </View>
                  )
              }
          case "assignMagicItem":
              if (magicItem.type !== "Weapon") {
                  return (
                      <View>
                          <Text style={styles.modalText}>{member.Name} will
                              get {magicItem.type} of {magicItem.effect}!</Text>
                          <Text style={styles.modalText}>Do you accept it?</Text>
                      </View>
                  )
              } else {
                  return (
                      <View>
                          <Text style={styles.modalText}>{member.Name} will get {magicItem.effect} +{receivedWeaponDamage}!</Text>
                          <Text style={styles.modalText}>Current {member.Name}'s weapons: {member.Weapon[0]}, {member.Weapon[1]}</Text>
                          <Text style={styles.modalText}>Current weapon skills: {member.WS.map((weaponSkill) => {return weaponSkill.Type + ": +" + weaponSkill.Damage})}</Text>
                          <Text style={styles.modalText}>REMEMBER: only magic weapon skill will be removed, common skills will remain.</Text>
                          <Text style={styles.modalText}>Do you accept it?</Text>
                      </View>
                  )
              }
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
                      d = []
                      break;
                  case "Gargoyle":
                      setModalOption("DiceRoll");
                      let dg = []
                      dg[0] = rollDice()
                      dg[1] = rollDice()
                      dg[2] = rollDice()
                      updateDice(dg)
                      dg = []
                      break;
                  default:
                      setModalOption("DiceRoll");
                      updateDice(rollDice())
                      break;
              }
              break;
          case "findGold":
              switch(monsters[8].Treasure[0]) {
                  default:
                      updateDice(rollDice())
                      break;
                  case 3:
                  case 6:
                  case 11:
                      let arr_dice = []
                      arr_dice[0] = rollDice()
                      arr_dice[1] = rollDice()
                      arr_dice[2] = rollDice()
                      updateDice(arr_dice)
                      arr_dice = []
                      break;
                  case 7:
                  case 10:
                      let arrdice = []
                      arrdice[0] = rollDice()
                      arrdice[1] = rollDice()
                      updateDice(arrdice)
                      arrdice = []
                      break;
              }
              setModalOption("DiceRoll")
              break;
          case "findJewelry":
              if (jewelry_amount === 0)
                  updateDice(rollDice())
              else{
                  let jwl_d = []
                  jwl_d[0] = rollDice()
                  jwl_d[1] = rollDice()
                  updateDice(jwl_d)
                  jwl_d = []
              }
              setModalOption("DiceRoll");
              break;
          case "findMagicItem":
              if (magicItemsAmount === 0 || magicItem.type !== undefined)
                  updateDice(rollDice())
              else {
                  let magicItemArr = []
                  magicItemArr[0] = rollDice()
                  magicItemArr[1] = rollDice()
                  updateDice(magicItemArr)
                  magicItemArr = []
              }
              setModalOption("DiceRoll");
              break;
          default:
              setModalOption("DiceRoll");
              updateDice(rollDice())
              break;
      }
};

  function IsSomething(weapon, weaponFound){
    return weapon.Type === weaponFound.Type && weapon.Magic === true
  }

  function CollectMagicItem(num){
    if (magicItem.type !== "Weapon") {
        member.Inventory.push(magicItem)
    } else {
        let weaponFound = {"Type": magicItem.effect, "Damage": receivedWeaponDamage, "Magic": true}
        if (member.Weapon[num === 0 ? 1 : 0] !== weaponFound.Type)
            member.Weapon[num] = weaponFound.Type
        else {
            Alert.alert("Hero must have two different kind of weapon!")
            return;
        }
        if (member.WS.some((weapon) => IsSomething(weapon, weaponFound))) {
            let weaponSkillIndex = member.WS.findIndex((weapon) => IsSomething(weapon, weaponFound))
            member.WS[weaponSkillIndex].Damage = weaponFound.Damage
        } else {
            member.WS.push(weaponFound)
        }
        member.WS = member.WS.filter((weapon) => {
            return weapon.Magic === undefined || weapon.Type === member.Weapon[0] || weapon.Type === member.Weapon[1]
        })
    }
    updateMagicItem({})
    updateReceivedWeaponDamage(0)
    magicItemsAmount -= 1
    setModalOption("nextState")
    if (magicItemsAmount > 0)
        send("REPEAT")
    else if (monsters[8 - turn_index - 1].Name !== undefined) {
        turn_index += 1
        send("NEXT")
    } else {
        turn_index = 0
        setModalVisible(false)
        send("DONE")
    }
  }


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
                                  if(member.Spells.length !== 0) {
                                      setModalOption("UseSpell")
                                  } else {
                                      Alert.alert("This hero cannot cast any spell, choose another option!")
                                  }
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
          case "assignJewelry":
              return(
                  <View style={{flexDirection:"row", paddingHorizontal:5}}>
                      <View style={{width:125}}>
                          <TouchableOpacity
                              onPress={() => {
                                  setModalVisible(false)
                              }}
                          >
                              <View style={[styles.button, {backgroundColor: "tomato", width:100}]}>
                                  <Text style={styles.textStyle}>No</Text>
                              </View>

                          </TouchableOpacity>
                      </View>
                      <View style={{width:125}}>
                          <TouchableOpacity
                            onPress={() => {
                                member.Treasure.push(jewelryCost)
                                jewelry_amount -= 1
                                setModalOption("nextState")
                                if(jewelry_amount > 0)
                                    send("REPEAT")
                                else
                                    send("NEXT")
                            }}
                          >
                              <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>Yes</Text>
                              </View>
                          </TouchableOpacity>
                      </View>
                  </View>
              )
          case "assignMagicItem":
              if(magicItem.type !== "Weapon")
              return(
                  <View style={{flexDirection:"row", paddingHorizontal:5}}>
                      <View style={{width:125}}>
                          <TouchableOpacity
                              onPress={() => {
                                  setModalVisible(false)
                              }}
                          >
                              <View style={[styles.button, {backgroundColor: "tomato", width:100}]}>
                                  <Text style={styles.textStyle}>No</Text>
                              </View>

                          </TouchableOpacity>
                      </View>
                      <View style={{width:125}}>
                          <TouchableOpacity
                            onPress={() => CollectMagicItem(null)}
                          >
                              <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>Yes</Text>
                              </View>
                          </TouchableOpacity>
                      </View>
                  </View>
              )
              else
                  return(
                  <View style={{flexDirection:"row", paddingHorizontal:5}}>
                      <View style={{width:125}}>
                          <TouchableOpacity
                              onPress={() => {
                                  setModalVisible(false)
                              }}
                          >
                              <View style={[styles.button, {backgroundColor: "tomato", width:100}]}>
                                  <Text style={styles.textStyle}>No</Text>
                              </View>

                          </TouchableOpacity>
                      </View>
                      <View style={{width:125}}>
                          <TouchableOpacity
                            onPress={() => CollectMagicItem(0)}
                          >
                              <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>Replace {member.Weapon[0]}!</Text>
                              </View>
                          </TouchableOpacity>
                      </View>
                      <View style={{width:125}}>
                          <TouchableOpacity
                            onPress={() => CollectMagicItem(1)}
                          >
                              <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>Replace {member.Weapon[1]}!</Text>
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
                    <Text style={styles.modalText}>{member.WS ? "Weapon Skills: " + member.WS.map((weaponSkill) => {return weaponSkill.Type + ": +" + weaponSkill.Damage}) : undefined}</Text>
                    <Text style={styles.modalText}>{member.Skill ? "Hero Skills: " + member.Skill.map((skill) => {return skill.Name + ": +" + skill.Value}) : undefined}</Text>
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
                                scrollEnabled={false}
                                renderItem={({item, index}) => (
                          <TouchableOpacity key={index} onPress={() => {
                              Dice()
                              setChosenWeapon(item)
                          }}>
                              <View  style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>{item}</Text>
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
                     <Text>Choose {member.Name}'s Spell to use!</Text>
                      <FlatList data={member.Spells}
                                scrollEnabled={false}
                                renderItem={({item, index}) => (
                          <TouchableOpacity key={index} onPress={() => {
                              Dice()
                              setChosenSpell(item)
                          }}>
                           <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>{item}</Text>
                           </View>
                          </TouchableOpacity>
                    )}/>
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
                      <Text style={[styles.text, {fontSize: 14}]}>{item.WP ? "WP: " + item.WP : undefined}</Text>
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
                      <Text style={[styles.text, {color:"white", fontSize: 14}]}>{item.WP ? "WP: " + item.WP : undefined}</Text>
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
        case "getGold":
            return (
                <TouchableOpacity onPress={ActionStates}>
                    <View style={styles.textButtonContainer}>
                      <Text style={styles.textButton}>Find Treasures!</Text>
                    </View>
                </TouchableOpacity>
            )
        case "assignJewelry":
            return (
                <View style={[styles.textButtonContainer, {backgroundColor: null, width: 300}]}>
                  <Text style={[styles.textButton, {color: "black"}]}>Choose who will get the treasure!</Text>
                  <Text style={[styles.textButton, {color: "black"}]}>(Remaining treasures: {jewelry_amount})</Text>
                </View>
            )
        case "assignMagicItem":
            return (
                <View style={[styles.textButtonContainer, {backgroundColor: null, width: 300}]}>
                  <Text style={[styles.textButton, {color: "black"}]}>Choose who will get the</Text>
                  <Text style={[styles.textButton, {color: "black"}]}>{magicItem.type === "Weapon" ? magicItem.effect + " +" + receivedWeaponDamage : magicItem.type + " of " + magicItem.effect}</Text>
                  <Text style={[styles.textButton, {color: "black"}]}>(Remaining magic items: {magicItemsAmount})</Text>
                </View>
            )
        case "endSession":
            return(
                <View style={{width: 300}}>
                    <Text style={[styles.textButton, {color: "black"}]}>Fight Completed!</Text>
                    <TouchableOpacity onPress={() => {
                        updateDice(0)
                        placeMonsters({monster: {}, amount: 9})
                        navigation.setParams({
                            squad: team,
                            money: gold,
                            XP: xp
                        })
                        navigation.navigate({
                          name: "Board",
                          params: {
                              level: 1,
                              squad: team,
                              money: gold,
                              XP: xp
                          }
                        });
                    }}>
                        <View style={styles.textButtonContainer}>
                            <Text style={styles.textButton}>End Session!</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
    }
  }

  useEffect(() => {
        console.log("XP: "+xp)
  }, [xp])

  useEffect(() => {
        console.log("Gold: "+gold)
  }, [gold])

  useEffect(() => {
        console.log(state.value)
  }, [state.value])

  useEffect(() => {
        console.log(magicItem)
  }, [magicItem])
  useEffect(() => {
        console.log(receivedWeaponDamage)
  }, [receivedWeaponDamage])

  useEffect(() => {
      if (route.params?.squad)
          updateTeam(route.params.squad)
  },[route.params?.squad])
  useEffect(()=> {
        if (route.params?.money || route.params?.XP) {
            updateGold(route.params.money)
            updateXP(route.params.XP)
        }
  },[route.params?.money, route.params?.XP])

  useEffect(() => {
    console.log(usedMembers);
    console.log(turn_index);
    console.log(team);
  }, [usedMembers, turn_index, team])


  return (
    <View style={[styles.container]}>
      <View style={{paddingBottom:10, paddingTop: 10, flexDirection:"row"}}>
        <Text style={[styles.textHeader, {flex:1, alignSelf: 'flex-start'}]}>Money:{JSON.stringify(gold)}</Text>
        <Text style={[styles.textHeader, {flex:1, alignSelf: 'center'}]}>FIGHT!</Text>
        <Text style={[styles.textHeader, {alignSelf: 'flex-end'}]}>XP:{JSON.stringify(xp)}</Text>
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
  },
});
