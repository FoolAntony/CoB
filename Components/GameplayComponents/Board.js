import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {
  Alert,
  FlatList, Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ReactNativeZoomableView} from "@openspacelabs/react-native-zoomable-view";
import {useMachine} from "@xstate/react";
import {boardMachine} from "../StateMachine/StateMachine.Board";
import {
    altarTypeList,
    artTypeList,
    battleResult,
    CheckRoomInside, FindHellGateDist, FindHellGateLevel,
    foutainTypeList,
    furnitureTypeList,
    getMagicItem,
    getTile,
    halfDiceRoll,
    idRandomTile,
    jewelryTable, magicItemsTable,
    rollDice, SquadIsOver,
    statueTypeList,
    trapdoorTypeList,
    treasureGoldTable,
    treasureJewelryTable,
    treasureMagicItemTable,
    weaponBonus
} from "../GameController";


let BoardTemplate = new Array(187).fill({})
let initBoard = JSON.parse(JSON.stringify(Array(3).fill(BoardTemplate)))

let jewelry_amount = 0

let magicItemsAmount = 0

let trappedHeroes = []

let currentIndex = 93

function setInitBoard(prms){
    initBoard[0][93] = {
        type: "entry",
        top: "",
        right: "",
        bottom: "",
        left: "",
        src: "",
        rotationAngle: 0,
        squad: {
            squad: prms.squad,
            money: prms.money,
            XP: prms.XP,
        }
    };
  return initBoard;
}

export default function Board({route, navigation}) {
  const [boardMap, changeBoardMap] = useState(setInitBoard(route.params))
  const [mapLevel, updateMapLevel] = useState(0)
  const [state, send] = useMachine(boardMachine)
  const [tile, updateTile] = useState({})
  const [modalVisible, setModalVisible] = useState(false)
  const [modalOption, setModalOption] = useState("nextState")
  const [dice, updateDice] = useState(null)
  const [newIndex, setNewIndex] = useState(null)
  const [prevIndex, setPrevIndex] = useState(null)
  const [memberIndex, updateMemberIndex] = useState(null);
  const [trapType, setTrapType] = useState("");
  const [roomType, currentRoomType] = useState("");
  const [magicItem, updateMagicItem] = useState({});
  const [jewelryCost, updateJewelryCost] = useState(null);
  const [numOfDices, changeNumOfDices] = useState(1);
  const [receivedWeaponDamage, updateReceivedWeaponDamage] = useState(0)
  const [levelHellGate, updateLevelHellGate] = useState(null)
  const [numOfTilesHellGate, updateNumOfTilesHellGate] = useState(null)


  useEffect(() => {
      console.log("HG Level: " + levelHellGate)
      console.log("HG dist: " + numOfTilesHellGate)
  }, [levelHellGate, numOfTilesHellGate])


  useEffect(() => {
   console.log(state.value)
   console.log(tile);
   console.log("isRoom: " + state.context.isRoom)
   console.log("Level: " + mapLevel)
  }, [state, tile])

   useEffect(() => {
       navigation.addListener('focus', () => {
           if(state.value === "doBattle") {
               if (state.context.isRoom === true) {
                   if(roomType !== "Room" && roomType !== "Hatch") {
                       if(route.params?.squad && SquadIsOver(route.params.squad) === true) {
                           send("LOSE")
                       } else
                           send("WINROOM")
                       setModalVisible(false)
                   }
                   else {
                       if(route.params?.squad && (route.params.squad[0].WP <= 0)) {
                           send("WINROOM")
                           setModalVisible(false)
                       }
                       else
                           send("TREASURE")
                   }
               }
               else {
                   if(route.params?.squad && SquadIsOver(route.params.squad) === true)
                       send("LOSE")
                   else
                       send("WIN")
               }
           }
       })
  }, [navigation, state, route.params?.squad])

  useEffect(() => {
      if (route.params?.squad) {
          console.log("Squad update!")
          let mod_board = JSON.parse(JSON.stringify(boardMap))
          if(roomType !== "Hatch" || roomType !== "Room")
              mod_board[mapLevel][currentIndex].squad.squad = route.params.squad;
          else {
              mod_board[mapLevel][currentIndex].squad.squad[memberIndex] = route.params.squad[0]
          }
          changeBoardMap(mod_board)
      }
  }, [route.params?.squad])

  useEffect(() => {
      if (route.params?.XP || route.params?.money) {
          console.log("XP & Money update!")
          let mod_board = JSON.parse(JSON.stringify(boardMap))
          mod_board[mapLevel][currentIndex].squad.XP = route.params.XP;
          mod_board[mapLevel][currentIndex].squad.money = route.params.money;
          changeBoardMap(mod_board)
      }
  }, [route.params?.XP, route.params?.money]);


  useEffect(() => {
        console.log(boardMap[mapLevel][currentIndex].squad.squad)
  }, [boardMap[mapLevel][currentIndex].squad.squad])

  useEffect(() => {
        console.log("Money: " + boardMap[mapLevel][currentIndex].squad.money)
  }, [boardMap[mapLevel][currentIndex].squad.money])

  useEffect(() => {
        console.log("XP: " + boardMap[mapLevel][currentIndex].squad.XP)
  }, [boardMap[mapLevel][currentIndex].squad.XP])


  function SetMember(index) {
      switch (state.value) {
          case "chooseMember":
              if(boardMap[mapLevel][currentIndex].squad.squad[index].Name !== undefined) {
                  let detrapSkill = boardMap[mapLevel][currentIndex].squad.squad[index].Skill.find((skill) => skill.Name === "Detrap")
                  if (detrapSkill !== undefined)
                      send("NEXT")
                  else {
                      send("NEXT")
                      send("FAIL")
                  }
                  updateMemberIndex(index)
                  setModalOption("nextState")
                  setModalVisible(true)
              } else
                  Alert.alert("Please choose the hero, not an empty space!")
              break;
          case "chooseRoomMember":
              if(boardMap[mapLevel][currentIndex].squad.squad[index].Name !== undefined) {
                  updateMemberIndex(index)
                  setModalOption("nextState")
                  send("NEXT")
              } else
                  Alert.alert("Please choose the hero, not an empty space!")
              break;
      }
  }


  const RandomTile = () => {
    updateTile(JSON.parse(JSON.stringify(getTile(idRandomTile()))))
  }

  const RotateLeft = () => {
    if (tile.type === undefined) {
      return;
    }
    let modified = JSON.parse(JSON.stringify(tile));
    [modified.top, modified.right, modified.bottom, modified.left] = [modified.right, modified.bottom, modified.left, modified.top];
    if (modified.rotationAngle === 0)
      modified.rotationAngle = 270
    else if (modified.rotationAngle === 90)
      modified.rotationAngle = 0
    else
      modified.rotationAngle -= 90
    updateTile(modified)

  }

    const RotateRight = () => {
    if (tile.type === undefined) {
      return;
    }
    let modified = JSON.parse(JSON.stringify(tile));
    [modified.top, modified.left, modified.bottom, modified.right] = [modified.left, modified.bottom, modified.right, modified.top];
     if (modified.rotationAngle === 270)
      modified.rotationAngle = 0
    else
      modified.rotationAngle += 90
    updateTile(modified)
  }

  function BoardTilesActions(index) {
    let mod_board = JSON.parse(JSON.stringify(boardMap))
    switch (state.value) {
        default:
            console.log(boardMap[mapLevel][index]);
            break;
        case "chooseNewTile":
            if (tile.type === undefined) {
                Alert.alert("Please, press on empty random tile field before choosing the place on the map!")
                break;
            }
            if (CheckTilesConnected(index, tile) === true) {
                mod_board[mapLevel][index] = JSON.parse(JSON.stringify(tile));
                changeBoardMap(mod_board);
                send("NEXT")
                if (isCorridorConnection(index) === true)
                    send("NONE")
                setNewIndex(index)
                setModalVisible(true)
            } else {
                Alert.alert("Player have chosen wrong board place for this tile. Please, check if sides of the connected tiles are the same and there is squad in one of them!")
            }
            break;
        case "choosePrevTile":
            if (mod_board[mapLevel][index].type === undefined) {
                Alert.alert("Please, press on non-empty tile!")
                break;
            }
            if (CheckTilesConnected(index, boardMap[mapLevel][index]) === true) {
                setNewIndex(index)
                send("NEXT")
            } else {
                Alert.alert("Please, choose the tile connected to the current squad position!")
            }
            break;
    }
  }

  function MoveSquad(index){
        boardMap[mapLevel][index].squad = boardMap[mapLevel][currentIndex].squad;
        boardMap[mapLevel][currentIndex].squad = {};
        setPrevIndex(currentIndex)
        currentIndex = index;
        if(numOfTilesHellGate > 0) {
            updateNumOfTilesHellGate((num) => num - 1)
        }
        send("NEXT");
        setModalOption("nextState")
        setModalVisible(true)
  }

  function isCorridorConnection(index) {
    let res = false
    if(currentIndex === (index - 11)){
      if (boardMap[mapLevel][index].bottom === boardMap[mapLevel][currentIndex].top && boardMap[mapLevel][currentIndex].top === "corr")
        res = true
    } else if(currentIndex === (index - 1)) {
      if (boardMap[mapLevel][index].left === boardMap[mapLevel][currentIndex].right && boardMap[mapLevel][currentIndex].right === "corr")
        res = true
    } else if(currentIndex === (index + 1)) {
      if (boardMap[mapLevel][index].right === boardMap[mapLevel][currentIndex].left && boardMap[mapLevel][currentIndex].left === "corr")
        res = true
    }else if(currentIndex === (index + 11)) {
      if (boardMap[mapLevel][index].top === boardMap[mapLevel][currentIndex].bottom && boardMap[mapLevel][currentIndex].bottom === "corr")
        res = true
    }
      return res
  }

  function CheckTilesConnected(index, tile) {
    let top_check = false
    let right_check = false
    let bottom_check = false
    let left_check = false
    if((index-1) === currentIndex || (index-11) === currentIndex || (index+1) === currentIndex || (index+11) === currentIndex) {
      if ((Math.floor((index - 1) / 11) === Math.floor(index / 11)) && boardMap[mapLevel][index - 1].type !== undefined) {
        if (boardMap[mapLevel][index - 1].type === "entry" || boardMap[mapLevel][index - 1].right === tile.left)
          left_check = true
        else
          console.log("Left error!")
      } else {
        left_check = true
      }
      if (boardMap[mapLevel][index - 11].type !== undefined) {
        if (boardMap[mapLevel][index - 11].type === "entry" || boardMap[mapLevel][index - 11].bottom === tile.top)
          top_check = true
        else
          console.log("Top error!")
      } else {
        top_check = true
      }
      if ((Math.floor((index + 1) / 11) === Math.floor(index / 11)) && boardMap[mapLevel][index + 1].type !== undefined) {
        if (boardMap[mapLevel][index + 1].type === "entry" || boardMap[mapLevel][index + 1].left === tile.right)
          right_check = true
        else
          console.log("Right error!")
      } else {
        right_check = true
      }
      if (boardMap[mapLevel][index + 11].type !== undefined) {
        if (boardMap[mapLevel][index + 11].type === "entry" || boardMap[mapLevel][index + 11].top === tile.bottom)
          bottom_check = true
        else
          console.log("Bottom error!")
      } else {
        bottom_check = true
      }
      return top_check && bottom_check && right_check && left_check
    } else
      return false;
  }


   const Dice = () => {
      setModalOption("DiceRoll");
      switch(state.value){
          default:
              updateDice(rollDice())
              break;
          case "doAction":
              switch (trapType) {
                  default:
                      updateDice(rollDice());
                      break;
                  case "Poison Arrows":
                      let a = rollDice()
                      let b = rollDice()
                      updateDice([a, b])
                      break;
              }
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
      }
  }

  const CheckTrapType = (dice) => {
      switch(dice){
          case 1:
              return "Arrows"
          case 2:
              return "Poison Arrows"
          case 3:
          case 5:
              return "Poison Gas"
          case 4:
          case 6:
              return "Explosion"
      }
  }


  const ChooseNewTile = () => {
    send("NEW")
  }

  const ChoosePrevTile = () => {
    send("OLD")
  }

  function AfterDiceActions(dice) {
    switch(state.value){
      case "checkTraps":
        if (dice === 1) {
          send("EXIST")
          setModalOption("nextState")
          setModalVisible(true)
        } else {
          send("NONE")
          setModalOption("nextState")
          setModalVisible(false)
        }
        break;
      case "doDetrap":
        let detrapSkill = boardMap[mapLevel][currentIndex].squad.squad[memberIndex].Skill.find((skill) => skill.Name === "Detrap")
        if (detrapSkill !== undefined && dice <= detrapSkill.Value) {
            if(state.context.isRoom === true)
                send("SUCCESSROOM")
            else {
                send("SUCCESS")
                setModalVisible(false)
            }
        } else {
            send("FAIL")
            setModalVisible(true)
        }
        setModalOption("nextState")
        break;
      case "findType":
          setTrapType(CheckTrapType(dice))
          setModalOption("nextState")
          send("NEXT")
          setModalVisible(true)
          break;
      case "doAction":
          let mod_board = JSON.parse(JSON.stringify(boardMap));
          switch (trapType){
              case "Arrows":
                  let damage_1 = battleResult( undefined, dice, "Bow");
                  mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP = mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP - damage_1;
                  changeBoardMap(mod_board);
                  break;
              case "Poison Arrows":
                  let damage_2 = battleResult(undefined, dice[0], "Bow") + halfDiceRoll(dice[1]);
                  mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP = mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP - damage_2;
                  changeBoardMap(mod_board);
                  break;
              case "Poison Gas":
                  let damage_3 = halfDiceRoll(dice);
                  mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP = mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP - damage_3;
                  changeBoardMap(mod_board);
                  break;
              case "Explosion":
                  for (let i = 0; i < mod_board[mapLevel][currentIndex].squad.squad.length; i++){
                      if(mod_board[mapLevel][currentIndex].squad.squad[i].Name !== undefined)
                          mod_board[mapLevel][currentIndex].squad.squad[i].WP = mod_board[mapLevel][currentIndex].squad.squad[i].WP - 1;
                  }
                  changeBoardMap(mod_board)
                  break;
          }
          navigation.setParams({
              squad: mod_board[mapLevel][currentIndex].squad.squad
          })
          setModalOption("nextState")

          if(state.context.isRoom === false) {
              send("NEXT")
              setModalVisible(false)
          }
          else {
              if(mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP <= 0)
                  send("FAILROOM")
              else
                  send("NEXTROOM")
          }
          break;
      case "checkMonsters":
        setModalOption("nextState")
        setModalVisible(false);
        if(numOfTilesHellGate === null || numOfTilesHellGate > 0){
            if(state.context.goNewTile === true && isCorridorConnection(prevIndex) === false) {
                if (dice < 4) {
                    send("EXIST")
                    navigation.navigate({
                        name: "Battle",
                        params: {
                            squad: boardMap[mapLevel][currentIndex].squad.squad,
                            money: boardMap[mapLevel][currentIndex].squad.money,
                            XP: boardMap[mapLevel][currentIndex].squad.XP,
                            battle: "normal"
                        }
                    })
                } else
                    send("NONE")
            } else {
                if (dice === 1) {
                    send("EXIST")
                    navigation.navigate({
                        name: "Battle",
                        params: {
                            squad: boardMap[mapLevel][currentIndex].squad.squad,
                            money: boardMap[mapLevel][currentIndex].squad.money,
                            XP: boardMap[mapLevel][currentIndex].squad.XP,
                            battle: "wondering"
                        }
                    })
                } else
                    send("NONE")
            }
        } else {
            send("EXIST")
            navigation.navigate({
                name: "Battle",
                params: {
                    squad: boardMap[mapLevel][currentIndex].squad.squad,
                    money: boardMap[mapLevel][currentIndex].squad.money,
                    XP: boardMap[mapLevel][currentIndex].squad.XP,
                    battle: "boss"
                }
            })
        }
        break;
      case "checkRoom":
          if(boardMap[mapLevel][currentIndex].type === "mirror") {
            GetMirrorEvent(dice)
          } else {
              let room = CheckRoomInside(boardMap[mapLevel][currentIndex].type, dice)
              currentRoomType(room)
              setModalOption("nextState")
              send("NEXT")
          }
          break;
      case "checkRoomType":
          if(foutainTypeList.includes(roomType))
              GetFountainEvent(dice)
          else if(altarTypeList.includes(roomType))
              GetAltarEvent(dice)
          else if(artTypeList.includes(roomType))
              GetArtEvent(dice)
          else if(furnitureTypeList.includes(roomType))
              GetFurnitureEvent(dice)
          else if(statueTypeList.includes(roomType))
              GetStatueEvent(dice)
          else if(trapdoorTypeList.includes(roomType))
              GetTrapdoorEvent(dice)
          break;
      case "getGold":
          if(treasureGoldTable[9][0] >= dice)
              send("EXIST")
          else
              send("NEXT")
          setModalOption("nextState")
          break;
      case "findGold":
          mod_board = JSON.parse(JSON.stringify(boardMap));
          let mult = treasureGoldTable[9][1]
          mod_board[mapLevel][currentIndex].squad.money += dice * mult
          changeBoardMap(mod_board[mapLevel])
          navigation.setParams({
            money: mod_board[mapLevel][currentIndex].squad.money,
          });
          send("NEXT")
          setModalOption("nextState")
          break;
      case "getJewelry":
          if(treasureJewelryTable[9][0] >= dice)
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
          }
          setModalOption("nextState")
          break;
      case "getMagicItem":
          if(treasureMagicItemTable[9][0] >= dice)
              send("EXIST")
          else {
              setModalVisible(false)
              send("DONE")
          }
          setModalOption("nextState")
          break;
      case "findMagicItem":
          if (magicItemsAmount === 0) {
              magicItemsAmount = halfDiceRoll(dice)
              setModalOption("nextState")
              break;
          }
          else if (magicItem.type === undefined) {
              let recievedMagicItem = getMagicItem(dice[0], dice[1])
              updateMagicItem(getMagicItem(dice[0], dice[1]))
              if (recievedMagicItem.type !== "Weapon" && recievedMagicItem.effect !== "Throw twice") {
                  send("NEXT")
              } else {
                  setModalOption("nextState")
              }
              setModalOption("nextState")
              break;
          } else {
              if (magicItem.type === "Weapon") {
                  if (dice === 6) {
                      changeNumOfDices((num) => num + 1)
                  } else {
                      updateReceivedWeaponDamage((dmg) => dmg + weaponBonus(dice))
                      if (numOfDices > 1)
                          changeNumOfDices((num) => num - 1)
                      else {
                          send("NEXT")
                      }
                  }
              } else if (magicItem.type === "Armor") {
                  if (dice === 6) {
                      changeNumOfDices((num) => num + 1)
                  } else {
                      updateMagicItem((item) => item.effect === "Throw twice" ? item.effect = magicItemsTable[1][dice - 1] : item.effect + magicItemsTable[1][dice - 1])
                      if (numOfDices > 1)
                          changeNumOfDices((num) => num - 1)
                      else {
                          send("NEXT")
                      }
                  }
              }
              setModalOption("nextState")
              break;
          }
    }
  }

    function GetFountainEvent(){
      let mod_board = JSON.parse(JSON.stringify(boardMap));
        switch (roomType){
            case "Poison":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP -= halfDiceRoll(dice)
                changeBoardMap(mod_board);
                break;
            case "Potion":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Inventory.push(getMagicItem(3, dice))
                changeBoardMap(mod_board);
                break;
            case "Alcohol":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].CB > 2 ? mod_board[mapLevel][currentIndex].squad.squad[memberIndex].CB -= 2 : mod_board[mapLevel][currentIndex].squad.squad[memberIndex].CB = 0
                changeBoardMap(mod_board);
                break;
            case "Diamond":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Treasure.push(jewelryTable(dice[0] + dice [2] + 2))
                changeBoardMap(mod_board);
                break;
            case "Water":
                break;
            case "Blood":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].CB < 2  ? mod_board[mapLevel][currentIndex].squad.squad[memberIndex].CB -= 1 : mod_board[mapLevel][currentIndex].squad.squad[memberIndex].CB = 0
                changeBoardMap(mod_board);
        }
        navigation.setParams({
              squad: mod_board[mapLevel][currentIndex].squad.squad
          })
        setModalVisible(false)
        send("NEXT")
    }

    function GetStatueEvent(dice){
      let mod_board = JSON.parse(JSON.stringify(boardMap));
      let resistance = mod_board[mapLevel][currentIndex].squad.squad[memberIndex].RV
        switch (roomType){
            case "Medusa":
                if(dice > resistance) {
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Effects.push("Stone")
                    changeBoardMap(mod_board)
                    navigation.setParams({
                        squad: mod_board[mapLevel][currentIndex].squad.squad
                    })
                }
                send("BATTLE")
                navigation.navigate({
                  name: "Battle",
                  params: {
                      squad: boardMap[mapLevel][currentIndex].squad.squad,
                      money: boardMap[mapLevel][currentIndex].squad.money,
                      XP: boardMap[mapLevel][currentIndex].squad.XP,
                      battle: "medusa"
                  }
                });
                break;
            case "Diamond":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Treasure.push(jewelryTable(rollDice() + rollDice() + 2))
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Treasure.push(jewelryTable(rollDice() + rollDice() + 2))
                changeBoardMap(mod_board);
                navigation.setParams({
                    squad: mod_board[mapLevel][currentIndex].squad.squad
                })
                break;
            case "Medallion":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Inventory.push(getMagicItem(5, dice))
                changeBoardMap(mod_board);
                navigation.setParams({
                    squad: mod_board[mapLevel][currentIndex].squad.squad
                })
                break;
            case "Demon":
                let demonType = CheckRoomInside("altar", dice)
                currentRoomType(demonType)
                break;
            case "Talisman":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Inventory.push(getMagicItem(4, dice))
                changeBoardMap(mod_board);
                navigation.setParams({
                    squad: mod_board[mapLevel][currentIndex].squad.squad
                })
                break;
            case "Unknown":
                if(dice > resistance) {
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Effects.push("Enemy")
                    navigation.setParams({
                        squad: mod_board[mapLevel][currentIndex].squad.squad
                    })
                    changeBoardMap(mod_board);
                    send("BATTLE")
                    navigation.navigate({
                      name: "Battle",
                      params: {
                          squad: mod_board[mapLevel][currentIndex].squad.squad,
                          money: boardMap[mapLevel][currentIndex].squad.money,
                          XP: boardMap[mapLevel][currentIndex].squad.XP,
                          battle: "unknown"
                      }
                    });
                } else
                    send("NEXT")
                break;
        }
        setModalOption("nextState")
        setModalVisible(false)
    }

    function GetTrapdoorEvent(dice){
      let mod_board = JSON.parse(JSON.stringify(boardMap));
        switch (roomType){
            case "Trap":
                send("TRAP")
                break;
            case "Room":
                let singleHeroSquadRoom = Array(9).fill({})
                singleHeroSquadRoom[0] = boardMap[mapLevel][currentIndex].squad.squad[memberIndex]
                if (dice < 4) {
                send("BATTLE")
                navigation.navigate({
                    name: "Battle",
                    params: {
                        squad: singleHeroSquadRoom,
                        money: boardMap[mapLevel][currentIndex].squad.money,
                        XP: boardMap[mapLevel][currentIndex].squad.XP,
                        battle: "normal"
                    }
                })
            } else
                send("TREASURE")
                break;
            case "Hatch":
                let singleHeroSquad = Array(9).fill({})
                singleHeroSquad[0] = boardMap[mapLevel][currentIndex].squad.squad[memberIndex]
                send("BATTLE")
                navigation.navigate({
                      name: "Battle",
                      params: {
                          squad: singleHeroSquad,
                          money: boardMap[mapLevel][currentIndex].squad.money,
                          XP: boardMap[mapLevel][currentIndex].squad.XP,
                          battle: "hatch"
                      }
                    });
                setModalVisible(false)
                break;
            case "Hellgate":
                trappedHeroes.push(mod_board[mapLevel][currentIndex].squad.squad[memberIndex])
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex] = {}
                changeBoardMap(mod_board);
                navigation.setParams({
                    squad: mod_board[mapLevel][currentIndex].squad.squad
                })
                send("NEXT")
                setModalVisible(false)
                break;
        }
        setModalOption("nextState")
    }

    function GetAltarEvent(dice){
      let mod_board = JSON.parse(JSON.stringify(boardMap));
      let resistance = mod_board[mapLevel][currentIndex].squad.squad[memberIndex].RV
        switch (roomType){
            case "Alloces":
                if(dice > resistance)
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].CB -= 1
                else
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Effects.push("NoWSpellCost")
                changeBoardMap(mod_board);
                break;
            case "Vassago":
                if(dice > resistance)
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Skill = mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Skill.filter((skill) => {return skill.Name !== "Detrap"});
                else {
                    let skillsList = mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Skill;
                    if (skillsList.some((skill) => skill.Name === "Detrap")){
                        let skillIndex = skillsList.findIndex((skill) => skill.Name === "Detrap")
                        skillsList[skillIndex].Value < 3 ?
                            mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Skill[skillIndex].Value += 3 :
                            mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Skill[skillIndex].Value = 5
                    } else {
                        mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Skill.push({Name:"Detrap", Value: 3})
                    }
                }
                changeBoardMap(mod_board);
                break;
            case "Anvas":
                if(dice > resistance) {
                    let damage = halfDiceRoll(rollDice()) * 2
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP -= damage
                }
                else {
                    if (!mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Spells.includes("Thunderbolt"))
                        mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Spells.push("Thunderbolt")
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Effects.push("ThunderboltLessCost")
                }
                changeBoardMap(mod_board[mapLevel]);
                break;
            case "Malthus":
                if(dice > resistance) {
                    let damage = rollDice() + rollDice() + 2
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP -= damage
                }
                else
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Spells.push("Wrath of God")
                changeBoardMap(mod_board);
                break;
            case "Lerae":
                if(dice > resistance) {
                    let damage = battleResult(undefined, rollDice(), "Bow") +
                        + battleResult(undefined, rollDice(), "Bow") +
                        + battleResult(undefined, rollDice(), "Bow")
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP -= damage
                }
                else{
                    let weaponSkillList = mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WS;
                    if (weaponSkillList.some((skill) => skill.Type === "Bow" && skill.Magic === undefined)){
                        let weaponSkillIndex = weaponSkillList.findIndex((skill) => skill.Type === "Bow" && skill.Magic === undefined)
                        mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WS[weaponSkillIndex].Damage += 3
                    } else {
                        mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WS.push({"Type": "Bow", "Damage": 3})
                    }
                }
                changeBoardMap(mod_board);
                break;
            case "Asmodus":
                if(dice > resistance)
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].MP = mod_board[mapLevel][currentIndex].squad.squad[memberIndex].MP.reduce((a,b) => {
                        return [...a, b === 0 ? b : b - 1]
                    }, [])
                else
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].CB += 3
                changeBoardMap(mod_board);
                break;
        }
        navigation.setParams({
              squad: mod_board[mapLevel][currentIndex].squad.squad
          })
        send("NEXT")
        setModalVisible(false)
        setModalOption("nextState")
        currentRoomType("")
    }

    function GetArtEvent(dice){
        let mod_board = JSON.parse(JSON.stringify(boardMap));
        switch (roomType){
            case "Gobelin":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Inventory.push(jewelryTable(dice + 4))
                changeBoardMap(mod_board);
                send("NEXT")
                setModalVisible(false)
                setModalOption("nextState")
                break;
            case "Drawing":
                setModalVisible(false)
                setModalOption("nextState")
                send("NEXT")
                break;
            case "Sculpture":
                let sculptureType = CheckRoomInside("statue", dice)
                currentRoomType(sculptureType)
                setModalOption("nextState")
                break;
            case "Cristal":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Inventory.push(getMagicItem(dice[0] < 4 ? 4 : 5, dice[1]))
                changeBoardMap(mod_board);
                send("NEXT")
                setModalVisible(false)
                setModalOption("nextState")
                break;
            case "Icon":
                let demonType = CheckRoomInside("altar", dice)
                currentRoomType(demonType)
                setModalOption("nextState")
                break;
            case "Manuscript":
                if(!mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Spells.includes("Wrath of God"))
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Spells.push("Wrath of God")
                changeBoardMap(mod_board);
                send("NEXT")
                setModalVisible(false)
                setModalOption("nextState")
                break;
        }
        navigation.setParams({
              squad: mod_board[mapLevel][currentIndex].squad.squad
          })
    }
    function GetFurnitureEvent(dice){
        let mod_board = JSON.parse(JSON.stringify(boardMap));
        switch (roomType){
            case "Coffin":
                send("BATTLE")
                navigation.navigate({
                  name: "Battle",
                  params: {
                      squad: boardMap[mapLevel][currentIndex].squad.squad,
                      money: boardMap[mapLevel][currentIndex].squad.money,
                      XP: boardMap[mapLevel][currentIndex].squad.XP,
                      battle: "vampire"
                  }
                });
                setModalVisible(false)

                break;
            case "Closet":
                if(dice < 4)
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP -= halfDiceRoll(rollDice())
                else
                    mod_board[mapLevel][currentIndex].squad.squad[memberIndex].Spells.push("Resurrect")
                changeBoardMap(mod_board);
                navigation.setParams({
                    squad: mod_board[mapLevel][currentIndex].squad.squad
                })
                send("NEXT")
                setModalVisible(false)
                break;
            case "Desk":
                send("TRAP")
                break;
            case "Bed":
                mod_board[mapLevel][currentIndex].squad.squad[memberIndex].WP += halfDiceRoll(dice)
                changeBoardMap(mod_board);
                navigation.setParams({
                    squad: mod_board[mapLevel][currentIndex].squad.squad
                })
                send("NEXT")
                setModalVisible(false)
                break;
            case "Harpsichord":
                break;
            case "Mirror":
                GetMirrorEvent(dice)
                break;
        }
        setModalOption("nextState")
    }

  function GetMirrorEvent(){
      if(levelHellGate === null){
          let level = FindHellGateLevel(dice)
          updateLevelHellGate(level)
          setModalOption("nextState")
          if(mapLevel !== level){
              send("NEXT")
              send("NEXT")
              setModalVisible(false)
          }
      } else if (numOfTilesHellGate === null) {
          updateNumOfTilesHellGate(FindHellGateDist(dice))
          setModalOption("nextState")
          send("NEXT")
          send("NEXT")
          setModalVisible(false)
      }
  }

  function UseStairsDown(){
      let mod_board = JSON.parse(JSON.stringify(boardMap))
      if(mod_board[mapLevel + 1][currentIndex].type !== "stairs") {
          if (mod_board[mapLevel + 1][currentIndex].type === undefined)
              mod_board[mapLevel + 1][currentIndex] = JSON.parse(JSON.stringify(mod_board[mapLevel][currentIndex]))
          else{
              Alert.alert("")
          }
          mod_board[mapLevel][currentIndex].squad = {};
          changeBoardMap(mod_board)
          send("NEXT")
          send("NEXT")
          setModalVisible(false)
      }
      else {
          mod_board[mapLevel + 1][currentIndex].squad = JSON.parse(JSON.stringify(mod_board[mapLevel][currentIndex].squad))
          mod_board[mapLevel][currentIndex].squad = {};
          changeBoardMap(mod_board)
          send("NEXT")
          send("NEXT")
          setModalVisible(false)
      }
  }

  function UseStairsUp(){
    let mod_board = JSON.parse(JSON.stringify(boardMap))
      if(mod_board[mapLevel - 1][currentIndex].type !== "stairs") {
          if (mod_board[mapLevel - 1][currentIndex].type === undefined)
              mod_board[mapLevel - 1][currentIndex] = JSON.parse(JSON.stringify(mod_board[mapLevel][currentIndex]))
          else{
              Alert.alert("")
          }
          mod_board[mapLevel][currentIndex].squad = {};
          changeBoardMap(mod_board)
          send("NEXT")
          send("NEXT")
          setModalVisible(false)
      }
      else {
          mod_board[mapLevel - 1][currentIndex].squad = JSON.parse(JSON.stringify(mod_board[mapLevel][currentIndex].squad))
          mod_board[mapLevel][currentIndex].squad = {};
          changeBoardMap(mod_board)
          send("NEXT")
          send("NEXT")
          setModalVisible(false)
      }
  }

  function NextStateTemplate() {
  switch (state.value){
    case "checkTraps":
      return(
          <View>
            <Text style={styles.modalText}>Check if there are any traps!</Text>
          </View>
      )
    case "checkMonsters":
      return(
          <View>
            <Text style={styles.modalText}>Check if there are any monsters!</Text>
          </View>
      )
    case "chooseMember":
      return(
          <View>
            <Text style={styles.modalText}>Choose who will detrap!</Text>
            <Text style={styles.modalText}>If hero does not have "Detrap" skill, detrap will be failed!</Text>
            <Text style={styles.modalText}>Your dice roll result must be lower than or equal to the skill value!</Text>
            <View style={styles.list}>
              <FlatList
                  style={styles.flatlist}
                  scrollEnabled={false}
                  data={boardMap[mapLevel][currentIndex].squad.squad}
                  numColumns={3}
                  renderItem={({item, index}) => (
                      <View>
                        <TouchableOpacity onPress={() => SetMember(index)}>
                          <View style={[styles.tileContainer, {backgroundColor: item.Name ? "silver" : "grey", width:100, height: 100}]}>
                            <Text style={[styles.textButton, {textAlign: "center", color:"black",fontSize: 14}]}>{item.Name ? item.Name : index < 6 ? "Lonely..." : "Empty"}</Text>
                              {item.Skill ? item.Skill.map((skill, skillIndex)=> {
                                  return(
                                      <Text key={skillIndex} style={[styles.textButton, {textAlign: "center", color:"black",fontSize: 14}]}>{skill.Name}: +{skill.Value}</Text>
                                  )
                              }) : null}
                            </View>
                        </TouchableOpacity>
                      </View>
                  )}
              />
            </View>
          </View>
      )
      case "doDetrap":
          return(
              <View>
                <Text style={styles.modalText}>Try to detrap!</Text>
              </View>
          )
      case "findType":
          return(
              <View>
                <Text style={styles.modalText}>Find the type of the trap!</Text>
              </View>
          )
      case "doAction":
          return(
              <View>
                <Text style={styles.modalText}>Roll dice to find damage!</Text>
              </View>
          )
      case "chooseRoomMember":
          return (
              <View>
                <Text style={styles.modalText}>There is some kind of a {boardMap[mapLevel][currentIndex].type} in this room!</Text>
                <Text style={styles.modalText}>Choose character to check it!</Text>
                <View style={styles.list}>
                  <FlatList
                      style={styles.flatlist}
                      scrollEnabled={false}
                      data={boardMap[mapLevel][currentIndex].squad.squad}
                      numColumns={3}
                      renderItem={({item, index}) => (
                          <View>
                            <TouchableOpacity onPress={() => SetMember(index)}>
                              <View style={[styles.tileContainer, {backgroundColor: item.Name ? "silver" : "grey"}]}>
                                <Text style={[styles.textButton, {textAlign: "center", color:"black",fontSize: 14}]}>{item.Name ? item.Name : index < 6 ? "Lonely..." : "Empty"}</Text>
                                  {item.Skill ? item.Skill.map((skill, skillIndex)=> {
                                  return(
                                      <Text key={skillIndex} style={[styles.textButton, {textAlign: "center", color:"black",fontSize: 14}]}>{skill.Name}: +{skill.Value}</Text>
                                  )
                              }) : null}
                                 <Text style={[styles.textButton, {textAlign: "center", color:"black",fontSize: 14}]}>{item.WP ? "WP: " + item.WP : null}</Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                      )}
                  />
                </View>
              </View>
          )
      case "checkRoom":
          if(boardMap[mapLevel][currentIndex].type === "stairs"){
               return (
                  <View>
                      <Text style={styles.modalText}>There are stairs in this room. Where do you want to go?</Text>
                  </View>
              )
          } else if(boardMap[mapLevel][currentIndex].type === "mirror"){
               return (
                  <View>
                    <Text style={styles.modalText}>There is a mirror on the wall.</Text>
                    <Text style={styles.modalText}>It can show how far are you from the Hell Gates.</Text>
                    <Text style={styles.modalText}>Roll dice to find the {levelHellGate === null ? "maze level where Hell Gates are!" : "distance from Hell Gates!"}</Text>
                </View>
              )
          } else {
              return (
                  <View>
                      <Text style={styles.modalText}>Check what kind of {boardMap[mapLevel][currentIndex].type} that
                          is!</Text>
                  </View>
              )
          }
      case "checkRoomType":
              return RoomTemplates()
      case "getGold":
          return(
              <View>
                  <Text style={styles.modalText}>Check if there is gold!</Text>
              </View>
          )
      case "findGold":
          return(
              <View>
                  <Text style={styles.modalText}>Check how much gold hero has found! </Text>
              </View>
          )
      case "getJewelry":
          return(
              <View>
                  <Text style={styles.modalText}>Check if there are any jewelries!</Text>
              </View>
          )
      case "findJewelry":
          return(
              <View>
                  <Text style={styles.modalText}>{jewelry_amount === 0 ? "Check how many jewelries founded!" : "Check the price of found jewelries!"}</Text>
              </View>
          )
      case "assignJewelry":
              let member_wallet = boardMap[mapLevel][currentIndex].squad.squad[memberIndex].Treasure.reduce((a, b) => a + b, 0)
              return(
                  <View>
                      <Text style={styles.modalText}>Hero gets this jewelry!</Text>
                      <Text style={styles.modalText}>His jewelries cost equals {JSON.stringify(member_wallet)}.</Text>
                      <Text style={styles.modalText}>Found jewelry costs {jewelryCost} golds.</Text>
                  </View>
              )
      case "getMagicItem":
          return(
              <View>
                  <Text style={styles.modalText}>Check if there are any Magic Items!</Text>
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
          } else if (magicItem.type === "Armor")
              return(
                  <View>
                      <Text style={styles.modalText}>Find the resistance of Armor!</Text>
                      <Text style={styles.modalText}>Current resistance value: {magicItem.effect}</Text>
                      <Text style={styles.modalText}>Remaining dice rolls: {numOfDices}</Text>
                  </View>
              )
      case "assignMagicItem":
          let member = boardMap[mapLevel][currentIndex].squad.squad[memberIndex]
          if (magicItem.type !== "Weapon") {
              return (
                  <View>
                      <Text style={styles.modalText}>Hero gets the {magicItem.type} of {magicItem.effect}!</Text>
                  </View>
              )
          } else {
              return (
                  <View>
                      <Text style={styles.modalText}>Hero gets the {magicItem.effect} +{receivedWeaponDamage}!</Text>
                      <Text style={styles.modalText}>Current hero's weapons: {member.Weapon[0]}, {member.Weapon[1]}</Text>
                      <Text style={styles.modalText}>Current weapon skills: {member.WS.map((weaponSkill) =>  {return "{" + weaponSkill.Type + ": +" + weaponSkill.Damage + (weaponSkill.Magic ?", Magic} " : "} ")})}</Text>
                      <Text style={styles.modalText}>REMEMBER: only magic weapon skill will be removed, common skills will remain.</Text>
                      <Text style={styles.modalText}>Do you accept it?</Text>
                  </View>
              )
          }
  }
}

function GetJewelry() {
    let board_map = (JSON.parse(JSON.stringify(boardMap)))
    board_map[currentIndex].squad.squad[memberIndex].Treasure.push(jewelryCost)
    changeBoardMap(board_map)
    navigation.setParams({
        squad: board_map[currentIndex].squad.squad
    })
    jewelry_amount -= 1
    setModalOption("nextState")
    if(jewelry_amount > 0)
        send("REPEAT")
    else
        send("NEXT")
}

function RoomTemplates() {
      if(boardMap[mapLevel][currentIndex].type === "stairs")
          return(
                <View>
                    <Text style={styles.modalText}>There are stairs in this room!</Text>
                    <Text style={styles.modalText}>Looks like they lead to the other citadel's level!</Text>
                    <Text style={styles.modalText}>Do you want to use them?</Text>
                </View>
          )

      else if (boardMap[mapLevel][currentIndex].type === "mirror" || roomType === "Mirror")
          return(
                <View>
                    <Text style={styles.modalText}>There is a mirror on the wall.</Text>
                    <Text style={styles.modalText}>It can show how far are you from the Hell Gates.</Text>
                    <Text style={styles.modalText}>Roll dice to find the {levelHellGate === null ? "maze level where Hell Gates are!" : "distance from Hell Gates!"}</Text>
                </View>
          )
      else
          switch (roomType){
              case "Poison":
                  return(
                      <View>
                        <Text style={styles.modalText}>Enjoy your Poison! Hero will get damage equals half of your dice roll!</Text>
                      </View>
                  )
              case "Potion":
                  return(
                        <View>
                            <Text style={styles.modalText}>There is a Potion in this fountain!</Text>
                            <Text style={styles.modalText}>Roll dice to find what kind of Potion it is and collect it!</Text>
                        </View>
                  )
              case "Alcohol":
                  return(
                      <View>
                        <Text style={styles.modalText}>There is a fountain full of very strong Alcohol!</Text>
                        <Text style={styles.modalText}>Hero drinks it and his Combat Bonus (CB) decreases by 2!</Text>
                      </View>
                  )
              case "Diamond":
                  return(
                      <View>
                        <Text style={styles.modalText}>There is something shines {boardMap[mapLevel][currentIndex].type === "fountain" ? "inside the fountain" : "on the bull's statue"}!</Text>
                        <Text style={styles.modalText}>Hero has found diamonds!</Text>
                        <Text style={styles.modalText}>Roll dice to find their price!</Text>
                      </View>
                  )
              case "Water":
                  return(
                      <View>
                        <Text style={styles.modalText}>Fountain with normal water. Nothing interesting...</Text>
                      </View>
                  )
              case "Blood":
                  return(
                      <View>
                        <Text style={styles.modalText}>Enjoy the Blood fountain!</Text>
                        <Text style={styles.modalText}>Hero gets sick and his Combat Bonus (CB) decreases by 2!</Text>
                      </View>
                  )
              case "Medusa":
                  return(
                      <View>
                        <Text style={styles.modalText}>There is a Statue of Medusa in this room.</Text>
                        <Text style={styles.modalText}>Statue gets alive and looks at the hero!</Text>
                        <Text style={styles.modalText}>Roll dice to try resist the gaze and prepare to fight!</Text>
                      </View>
                  )
              case "Medallion":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero has found Medallion on the neck of the statue.</Text>
                        <Text style={styles.modalText}>Roll dice to find its effect!</Text>
                      </View>
                  )
              case "Demon":
                  return(
                      <View>
                        <Text style={styles.modalText}>This is a statue of Demon. The effects are the same as for altar!</Text>
                      </View>
                  )
              case "Talisman":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero has found Talisman on the neck of the statue.</Text>
                        <Text style={styles.modalText}>Roll dice to find its effect!</Text>
                      </View>
                  )
              case "Unknown":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds the statue of X the Unknown, the merciless enemy of all living things! </Text>
                        <Text style={styles.modalText}>It sets hero up against the squad!</Text>
                        <Text style={styles.modalText}>Roll a dice to try to resist its power!</Text>
                      </View>
                  )
              case "Trap":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds a trap guarding the treasure under the trapdoor!</Text>
                        <Text style={styles.modalText}>Try to detrap it!</Text>
                      </View>
                  )
              case "Room":
                  return(
                      <View>
                        <Text style={styles.modalText}>There is a hidden room under that trapdoor!</Text>
                      </View>
                  )
              case "Hatch":
                  return(
                      <View>
                        <Text style={styles.modalText}>There is some hatch leading to the hidden room with Cronks guarding some treasure!</Text>
                      </View>
                  )
              case "Hellgate":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero enters the room and disappears! Looks like the Hell Gates got him!</Text>
                        <Text style={styles.modalText}>Hero can be saved only of the Hell Gates will be destroyed!</Text>
                      </View>
                  )
              case "Coffin":
                  return(
                      <View>
                        <Text style={styles.modalText}>There is a coffin in the middle of this room.</Text>
                        <Text style={styles.modalText}>Hero sees how a Vampire rises from it!</Text>
                        <Text style={styles.modalText}>Squad has to kill it!</Text>
                      </View>
                  )
              case "Closet":
                  return(
                      <View>
                        <Text style={styles.modalText}>Nothing interesting in this room except the closet.</Text>
                        <Text style={styles.modalText}>Hero approaches the closet and it starts to fall!</Text>
                        <Text style={styles.modalText}>Roll a dice to dodge it!</Text>
                        <Text style={styles.modalText}>If this works, hero will get the Resurrect spell!</Text>
                      </View>
                  )
              case "Desk":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds a desk in the middle of this room.</Text>
                        <Text style={styles.modalText}>Looks like there is some trap hidden under it.</Text>
                      </View>
                  )
              case "Bed":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds a bed and decides to take a nap.</Text>
                        <Text style={styles.modalText}>His wounds heal for 2!</Text>
                      </View>
                  )
              case "Harpsichord":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds a bed and decides to take a nap.</Text>
                        <Text style={styles.modalText}>His wounds heal for 2!</Text>
                      </View>
                  )
              case "Mirror":
                  return(
                       <View>
                            <Text style={styles.modalText}>There is a mirror on the wall.</Text>
                            <Text style={styles.modalText}>It can show how far are you from the Hell Gates.</Text>
                            <Text style={styles.modalText}>Roll dice to find the {levelHellGate === null ? "maze level where Hell Gates are!" : "distance from Hell Gates!"}</Text>
                        </View>
                  )
              case "Alloces":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds an altar of Alloces.</Text>
                        <Text style={styles.modalText}>Try to dodge the spell!</Text>
                        <Text style={styles.modalText}>Success: Battle spells cost drops to 0 for next battle!</Text>
                        <Text style={styles.modalText}>Fail: Hero's combat bonus decreases by 1.</Text>
                      </View>
                  )
              case "Vassago":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds an altar of Vassago.</Text>
                        <Text style={styles.modalText}>Try to dodge the spell!</Text>
                        <Text style={styles.modalText}>Success: Hero gets/increases the Detrap +3 skill!</Text>
                        <Text style={styles.modalText}>Fail: Hero loses his Detrap skill.</Text>
                      </View>
                  )
              case "Anvas":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds an altar of Anvas.</Text>
                        <Text style={styles.modalText}>Try to dodge the spell!</Text>
                        <Text style={styles.modalText}>Success: Hero learns Thunderbolt spell that costs 1 wounds.</Text>
                        <Text style={styles.modalText}>Fail: Hero gets attacked by Thunderbolt spell.</Text>
                      </View>
                  )
              case "Malthus":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds an altar of Malthus.</Text>
                        <Text style={styles.modalText}>Try to dodge the spell!</Text>
                        <Text style={styles.modalText}>Success: Hero learns the Wrath of Gods spell!</Text>
                        <Text style={styles.modalText}>Fail: Hero gets attacked by the Wrath of Gods spell.</Text>
                      </View>
                  )
              case "Lerae":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds an altar of Lerae.</Text>
                        <Text style={styles.modalText}>Try to dodge the spell!</Text>
                        <Text style={styles.modalText}>Success: Hero gets Bow +3 permanent skill!</Text>
                        <Text style={styles.modalText}>Fail: Hero gets attacked by 3 magical arrows.</Text>
                      </View>
                  )
              case "Asmodus":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds an altar of Asmodus.</Text>
                        <Text style={styles.modalText}>Try to dodge the spell!</Text>
                        <Text style={styles.modalText}>Success: Hero's combat bonus increases by 3 and he gets Thunderbolt spell that costs 1.</Text>
                        <Text style={styles.modalText}>Fail: Hero's every magical coefficient decreases by 1.</Text>
                      </View>
                  )
              case "Gobelin":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero sees a elf's gobelin on the wall.</Text>
                        <Text style={styles.modalText}>Find its price!</Text>
                      </View>
                  )
              case "Drawing":
                  return(
                      <View>

                      </View>
                  )
              case "Sculpture":
                  return(
                      <View>
                        <Text style={styles.modalText}>There is a sculpture that looks exactly like these statues...</Text>
                      </View>
                  )
              case "Cristal":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds a crystal decorated with scenes from the labyrinth.</Text>
                        <Text style={styles.modalText}>Find what kind of  special effect it has!</Text>
                        <Text style={styles.modalText}>1-3: Random Talisman.</Text>
                        <Text style={styles.modalText}>4-6: Random Medallion.</Text>
                      </View>
                  )
              case "Icon":
                  return(
                      <View>
                        <Text style={styles.modalText}>There is an icon on the wall which looks exactly like these demon's altars...</Text>
                      </View>
                  )
              case "Manuscript":
                  return(
                      <View>
                        <Text style={styles.modalText}>Hero finds some manuscript on the desk.</Text>
                        <Text style={styles.modalText}>He learns the Wrath of Gods spell from it.</Text>
                      </View>
                  )
          }
}

function IsSomething(weapon, weaponFound){
    return weapon.Type === weaponFound.Type && weapon.Magic === true
  }

function CollectMagicItem(num){
    let board_map = JSON.parse(JSON.stringify(boardMap))
    if (magicItem.type !== "Weapon") {
        board_map[currentIndex].squad.squad[memberIndex].Inventory.push(magicItem)
    } else {
        let weaponFound = {"Type": magicItem.effect, "Damage": receivedWeaponDamage, "Magic": true}
        if (board_map[currentIndex].squad.squad[memberIndex].Weapon[num === 0 ? 1 : 0] !== weaponFound.Type)
            board_map[currentIndex].squad.squad[memberIndex].Weapon[num] = weaponFound.Type
        else {
            Alert.alert("Hero must have two different kind of weapon!")
            return;
        }
        if (board_map[currentIndex].squad.squad[memberIndex].WS.some((weapon) => IsSomething(weapon, weaponFound))) {
            let weaponSkillIndex = board_map[currentIndex].squad.squad[memberIndex].WS.findIndex((weapon) => IsSomething(weapon, weaponFound))
            board_map[currentIndex].squad.squad[memberIndex].WS[weaponSkillIndex].Damage = weaponFound.Damage
        } else {
            board_map[currentIndex].squad.squad[memberIndex].WS.push(weaponFound)
        }
        board_map[currentIndex].squad.squad[memberIndex].WS = board_map[currentIndex].squad.squad[memberIndex].WS.filter((weapon) => {
            return weapon.Magic === undefined || weapon.Type === board_map[currentIndex].squad.squad[memberIndex].Weapon[0] || weapon.Type === board_map[currentIndex].squad.squad[memberIndex].Weapon[1]
        })
    }
    changeBoardMap(board_map)
    navigation.setParams({
        squad: board_map[currentIndex].squad.squad
    })
    FinishCollectingMagicItem()
  }

  function FinishCollectingMagicItem(){
      updateMagicItem({})
      updateReceivedWeaponDamage(0)
      magicItemsAmount -= 1
      setModalOption("nextState")
      if (magicItemsAmount > 0)
        send("REPEAT")
      else {
        setModalVisible(false)
        send("DONE")
      }
  }


function ModalButton() {
  if(state.value === "checkRoom" && (boardMap[mapLevel][currentIndex].type === "stairs"))
      return(
              <View style={{flexDirection:"row", paddingHorizontal:5}}>
                  <View style={{width:125}}>
                      <TouchableOpacity
                          onPress={() => {
                              setModalVisible(false)
                              send("NEXT")
                          }}
                      >
                          <View style={[styles.button, {backgroundColor: "tomato", width:100}]}>
                              <Text style={styles.textStyle}>Skip</Text>
                          </View>

                      </TouchableOpacity>
                  </View>
                  <View style={{width:125}}>
                      <TouchableOpacity
                        onPress={() => {
                            if(mapLevel > 0) {
                                UseStairsUp()
                                updateMapLevel((level) => level - 1)
                            }
                            else
                                Alert.alert("You are on the top level of the maze!")

                        }}
                      >
                          <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                              <Text style={styles.textStyle}>Go Upstairs!</Text>
                          </View>
                      </TouchableOpacity>
                  </View>
                  <View style={{width:125}}>
                      <TouchableOpacity
                        onPress={() => {
                            if(mapLevel < 2) {
                                UseStairsDown()
                                updateMapLevel((level) => level + 1)
                            }
                            else
                                Alert.alert("You are on the bottom level of the maze!")
                        }}
                      >
                          <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                              <Text style={styles.textStyle}>Go Downstairs!</Text>
                          </View>
                      </TouchableOpacity>
                  </View>
              </View>
          )
  else
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
    case "chooseMember":
    case "chooseRoomMember":
      break;
    case "assignJewelry":
              return(
                  <View style={{flexDirection:"row", paddingHorizontal:5}}>
                      <View style={{width:125}}>
                          <TouchableOpacity
                            onPress={() => GetJewelry()}
                          >
                              <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                                  <Text style={styles.textStyle}>OK</Text>
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
                        onPress={() => CollectMagicItem(null)}
                      >
                          <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                              <Text style={styles.textStyle}>Receive</Text>
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
                          onPress={() => FinishCollectingMagicItem()}
                      >
                          <View style={[styles.button, {backgroundColor: "tomato", width:100}]}>
                              <Text style={styles.textStyle}>Destroy</Text>
                          </View>

                      </TouchableOpacity>
                  </View>
                  <View style={{width:125}}>
                      <TouchableOpacity
                        onPress={() => CollectMagicItem(0)}
                      >
                          <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                              <Text style={styles.textStyle}>Replace {boardMap[mapLevel][currentIndex].squad.squad[memberIndex].Weapon[0]}!</Text>
                          </View>
                      </TouchableOpacity>
                  </View>
                  <View style={{width:125}}>
                      <TouchableOpacity
                        onPress={() => CollectMagicItem(1)}
                      >
                          <View style={[styles.button, {backgroundColor: "limegreen", width: 100}]}>
                              <Text style={styles.textStyle}>Replace {boardMap[mapLevel][currentIndex].squad.squad[memberIndex].Weapon[1]}!</Text>
                          </View>
                      </TouchableOpacity>
                  </View>
              </View>
          )
  }
}


  function TileCheck(item) {
    if (item.type !== undefined) {
      return (
          <View style={[styles.textContainer, {borderColor: item.squad.squad !== undefined ? "red" : "silver"}]}>
            <Text style={[styles.text]}>{item.top}</Text>
              <View style={{flexDirection:"row", width:"100%", height:"60%", justifyContent: "space-around", alignItems:"center"}}>
                <Text style={[styles.text, {transform:[{rotate: "90 deg"}]}]}>{item.left}</Text>
                <Text style={[styles.text]}>{item.type !== "path" ? item.type : undefined}</Text>
                <Text style={[styles.text, {transform:[{rotate: "90 deg"}]}]}>{item.right}</Text>
              </View>
              <View style={{justifyContent:"flex-end"}}>
                <Text style={[styles.text]}>{item.bottom}</Text>
              </View>
          </View>
      )
    } else {
      return (
          <View style={[styles.textContainer, {backgroundColor: "silver"}]}>
            <Text style={styles.text}>Empty</Text>
          </View>
      )
    }
  }

    function RandomTileCheck() {
    if (tile.type !== undefined) {
      return (
          <View style={[styles.tileContainer]}>
            <Text style={[styles.textButton, {textAlign: "center", color:"black", fontSize: 14}]}>{tile.top}</Text>
            <Text style={[styles.textButton,{color:"black",fontSize: 14}]}>{tile.left} {tile.right}</Text>
            <Text style={[styles.textButton, {textAlign: "center", color:"black",fontSize: 14}]}>{tile.bottom}</Text>
          </View>
      )
    } else {
      return (
          <View style={[styles.tileContainer, {backgroundColor: "grey"}]}>
            <Text style={styles.textButton}>Empty</Text>
          </View>
      )
    }
  }

  function ModalScreen() {
    switch (modalOption) {
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
                            onPress={() => AfterDiceActions(dice)}
                        >
                          <Text style={styles.textStyle}>Go Next Step!</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
            );
    }
  }

  function BoardButtons() {
    switch (state.value){
     case "idle":
        return(
            <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                <TouchableOpacity onPress={ChoosePrevTile}>
                    <View style={styles.textButtonContainer}>
                        <Text style={styles.textButton}>Choose Previous!</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={ChooseNewTile}>
                  <View style={styles.textButtonContainer}>
                    <Text style={styles.textButton}>Choose New Tile!</Text>
                </View>
              </TouchableOpacity>
            </View>
        )
      case "chooseNewTile":
        return(
            <View style={{flexDirection:"row", justifyContent:"center"}}>
              <TouchableOpacity onPress={RotateLeft}>
                <View style={[styles.textTileButtonContainer]}>
                  <Text style={styles.textButton}>{"<<<"}</Text>
                </View>
              </TouchableOpacity>
              <View style={{width:50}}></View>
              <TouchableOpacity onPress={RandomTile}>
                  <RandomTileCheck/>
              </TouchableOpacity>
              <View style={{width:50}}></View>
              <TouchableOpacity onPress={RotateRight}>
                <View style={[styles.textTileButtonContainer]}>
                  <Text style={styles.textButton}>{">>>"}</Text>
                </View>
              </TouchableOpacity>
            </View>
        )
      case "choosePrevTile":
             return(
                <View style={{}}>
                  <Text style={[styles.textButton, {color: "black"}]}>Choose the tile you want to go!</Text>
                </View>
        )
      case "chooseAfterBattleAction":
          if(boardMap[mapLevel][currentIndex].type !== "path")
            return(
                <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                  <TouchableOpacity onPress={() => send("NEXT")}>
                    <View style={styles.textButtonContainer}>
                      <Text style={styles.textButton}>Continue</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                      send("CHECK")
                      setModalVisible(true)
                      setModalOption("nextState")
                  }}>
                    <View style={styles.textButtonContainer}>
                      <Text style={styles.textButton}>Check Room!</Text>
                    </View>
                  </TouchableOpacity>
                </View>
            )
          else
           return(
            <View style={{justifyContent:"center"}}>
              <TouchableOpacity onPress={() => send("NEXT")}>
                <View style={styles.textButtonContainer}>
                  <Text style={styles.textButton}>Continue</Text>
                </View>
              </TouchableOpacity>
            </View>
            )
      case "moveSquad":
        return(
            <View style={{justifyContent:"center"}}>
              <TouchableOpacity onPress={() => MoveSquad(newIndex)}>
                <View style={styles.textButtonContainer}>
                  <Text style={styles.textButton}>Move Squad!</Text>
                </View>
              </TouchableOpacity>
            </View>
        )
    }
 }


  return (
      <View style={styles.container}>
          <View style={{height:50,flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
              <Text style={{fontSize:20}}>
                  {levelHellGate === null ? null : "HG Level: " + levelHellGate}
              </Text>
              <Text style={{fontSize:20}}>
                  {numOfTilesHellGate === null ? null : "HG Distance: " + numOfTilesHellGate}
              </Text>

          </View>
        <ModalScreen/>
        <View style={styles.zoomWrapper}>
            <ReactNativeZoomableView
              zoomEnabled={true}
              maxZoom={4}
              minZoom={1}
              zoomStep={0.25}
              initialZoom={2}
              bindToBorders={true}
              style={styles.zoomableView}
            >
                <FlatList
                    style={styles.flatlist}
                    scrollEnabled={false}
                    data={boardMap[mapLevel]}
                    numColumns={11}
                    renderItem={({item, index}) => (
                        <View>
                          <TouchableOpacity onPress={() => BoardTilesActions(index)}>
                            {TileCheck(item)}
                          </TouchableOpacity>
                        </View>
                    )}
                />
            </ReactNativeZoomableView>
        </View>
        <BoardButtons/>
      </View>
      )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e7e7e7',
  },
  header: {
    backgroundColor: '#5569ff',
    paddingTop: 50,
    paddingBottom: 15,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
  },
  box: {
    width: 150,
    height: 150,
    backgroundColor:"green"
  },
  zoomWrapper: {
    flex: 1,
    width:"100%",
    justifyContent:"center"
  },
  zoomableView: {
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '80%',
    marginBottom: 10,
  },
  caption: {
    fontSize: 10,
    color: '#444',
    alignSelf: 'center',
  },
  text: {
    textAlign:"center",
    fontSize:4,
  },
  textContainer: {
    justifyContent:"center",
    alignItems:"center",
    width: 33,
    height: 33,
    borderWidth:2,
    borderColor:"silver",
    borderRadius: 3
  },
    tileContainer: {
    alignContent: "center",
    alignItems:"center",
    width: 90,
    height: 90,
    borderWidth:2,
    borderColor:"silver",
    borderRadius: 3
  },
  tileImage: {
    width:30,
    height:30
  },
  textHeader: {
    fontSize:22,
    alignSelf:"center",
  },
  list: {
    justifyContent: "center",
    height:405,
    width:360,
    borderColor:"red",
  },
  flatlist: {
    alignSelf:"center"
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
    width:190,
    alignSelf:'center',
    justifyContent:"center",
    backgroundColor:'#4040a1',
    paddingBottom:50
  },
    textTileButtonContainer: {
    borderColor:'grey',
    borderRadius:4,
    height:90,
    width:90,
    alignSelf:'center',
    justifyContent:"center",
    backgroundColor:'#4040a1',
    paddingBottom:50
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
      width: 150
  },
  tileImageButton: {
    width:90,
    height:90
  }


});

