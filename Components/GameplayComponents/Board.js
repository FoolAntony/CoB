import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {
  Alert,
  FlatList, KeyboardAvoidingView, Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ReactNativeZoomableView} from "@openspacelabs/react-native-zoomable-view";
import {useMachine} from "@xstate/react";
import {boardMachine} from "../StateMachine/StateMachine.Board";
import {battleResult, getTile, halfDiceRoll, idRandomTile, rollDice} from "../GameController";


let initBoard = Array(187).fill({})

let currentIndex = 93

let squad =  {
    type: "squad",
    src: "../assets/Tile_Images/The_Party_Marker.png",
    rotationAngle: 0
  }

const setInitBoard = (prms) =>{
  initBoard[93] = {
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
      level: prms.level

    }
  };
  return initBoard
}

export default function Board({route, navigation}) {

  const [boardMap, changeBoardMap] = useState(setInitBoard(route.params))
  const [state, send] = useMachine(boardMachine)
  const [tile, updateTile] = useState({})
  const [modalVisible, setModalVisible] = useState(false)
  const [modalOption, setModalOption] = useState("nextState")
  const [dice, updateDice] = useState(null)
  const [newIndex, setNewIndex] = useState(null)
  const [prevIndex, setPrevIndex] = useState(null)
  const [memberIndex, updateMemberIndex] = useState(null);
  const [trapType, setTrapType] = useState("")

  useEffect(() => {
   console.log(state.value)
   console.log(tile);
   if(route.params?.squad)
       if(state.value === "doBattle")
           send("WIN")
  }, [state, tile, route.params?.squad])

  useEffect(() => {
      if (route.params?.squad){
         console.log("Squad update!")
         let mod_board = JSON.parse(JSON.stringify(boardMap))
         mod_board[currentIndex].squad.squad = route.params.squad;
         changeBoardMap(mod_board)
       }
      if (route.params?.money){
         console.log("Money update!")
         let mod_board = JSON.parse(JSON.stringify(boardMap))
         mod_board[currentIndex].squad.money = route.params.money;
         changeBoardMap(mod_board)
       }
      if (route.params?.XP){
         console.log("XP update!")
         let mod_board = JSON.parse(JSON.stringify(boardMap))
         mod_board[currentIndex].squad.XP = route.params.XP;
         changeBoardMap(mod_board)
       }
  }, [route.params?.squad, route.params?.money, route.params?.XP])

  useEffect(() => {
        console.log(boardMap[currentIndex].squad.squad)
  }, [boardMap[currentIndex].squad.squad])

  useEffect(() => {
        console.log(boardMap[currentIndex].squad.money)
  }, [boardMap[currentIndex].squad.money])

  useEffect(() => {
        console.log(boardMap[currentIndex].squad.XP)
  }, [boardMap[currentIndex].squad.XP])


  function SetMember(index){
    if (boardMap[currentIndex].squad.squad[index].Skill[0] === "Detrap") {
      send("NEXT")
    } else {
      send("NEXT")
      send("FAIL")
    }
    updateMemberIndex(index)
    setModalOption("nextState")
    setModalVisible(true)
  }


  const RandomTile = () => {
    updateTile(JSON.parse(JSON.stringify(getTile(idRandomTile()))))
  }

  const RotateLeft = () => {
    if (tile.type === undefined) {
      return;
    }
    let modified = JSON.parse(JSON.stringify(tile));
    let t = modified.top;
    modified.top = modified.right;
    modified.right = modified.bottom;
    modified.bottom = modified.left;
    modified.left = t;
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
    let t = modified.top;
    modified.top = modified.left;
    modified.left = modified.bottom;
    modified.bottom = modified.right;
    modified.right = t;
     if (modified.rotationAngle === 270)
      modified.rotationAngle = 0
    else
      modified.rotationAngle += 90
    updateTile(modified)
  }

  function BoardTilesActions(index) {
    let mod_board = JSON.parse(JSON.stringify(boardMap))
    switch (state.value){
      default:
        console.log(boardMap[index]);
        break;
      case "chooseNewTile":
        if(tile.type === undefined){
          Alert.alert("Please, press on empty random tile field before choosing the place on the map!")
          break;
        }
        if (CheckTilesConnected(index) === true) {
          mod_board[index] = JSON.parse(JSON.stringify(tile));
          changeBoardMap(mod_board);
          send("NEXT")
          if(isCorridorConnection(index) === true)
            send("NONE")
          setNewIndex(index)
          setModalVisible(true)
        } else {
          Alert.alert("Player have chosen wrong board place for this tile. Please, check if sides of the connected tiles are the same and there is squad in one of them!")
        }
        break;
      case"moveSquad":
        boardMap[index].squad = boardMap[currentIndex].squad;
        boardMap[currentIndex].squad = {};
        setPrevIndex(currentIndex)
        currentIndex = index;
        send("NEXT");
        setModalOption("nextState")
        setModalVisible(true)
    }
  }

  function isCorridorConnection(index) {
    let res = false
    if(currentIndex === (index - 11)){
      if (boardMap[index].bottom === boardMap[currentIndex].top === "corr")
        res = true
    } else if(currentIndex === (index - 1)) {
      if (boardMap[index].left === boardMap[currentIndex].right === "corr")
        res = true
    } else if(currentIndex === (index + 1)) {
      if (boardMap[index].right === boardMap[currentIndex].left === "corr")
        res = true
    }else if(currentIndex === (index + 11)) {
      if (boardMap[index].top === boardMap[currentIndex].bottom === "corr")
        res = true
    }
      return res
  }

  function CheckTilesConnected(index) {
    let top_check = false
    let right_check = false
    let bottom_check = false
    let left_check = false
    if((index-1) === currentIndex || (index-11) === currentIndex || (index+1) === currentIndex || (index+11) === currentIndex) {
      if (boardMap[index - 1] !== undefined && (Math.floor((index - 1) / 11) === Math.floor(index / 11)) && boardMap[index - 1].type !== undefined) {
        if (boardMap[index - 1].type === "entry" || boardMap[index - 1].right === tile.left)
          left_check = true
        else
          console.log("Left error!")
      } else {
        left_check = true
      }
      if (boardMap[index - 11] !== undefined && boardMap[index - 11].type !== undefined) {
        if (boardMap[index - 11].type === "entry" || boardMap[index - 11].bottom === tile.top)
          top_check = true
        else
          console.log("Top error!")
      } else {
        top_check = true
      }
      if (boardMap[index + 1] !== undefined && (Math.floor((index + 1) / 11) === Math.floor(index / 11)) && boardMap[index + 1].type !== undefined) {
        if (boardMap[index + 1].type === "entry" || boardMap[index + 1].left === tile.right)
          right_check = true
        else
          console.log("Right error!")
      } else {
        right_check = true
      }
      if (boardMap[index + 11] !== undefined && boardMap[index + 11].type !== undefined) {
        if (boardMap[index + 11].type === "entry" || boardMap[index + 11].top === tile.bottom)
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
      if(state.value !== "doAction") {
          updateDice(rollDice());
      } else {
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
        if (dice < 1) {
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
        let max = boardMap[currentIndex].squad.squad[memberIndex].Skill[1]
        if (dice <= max) {
            send("SUCCESS")
            setModalVisible(false)
        }
        else {
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
                  mod_board[currentIndex].squad.squad[memberIndex].WP = mod_board[currentIndex].squad.squad[memberIndex].WP - damage_1;
                  changeBoardMap(mod_board);
                  break;
              case "Poison Arrows":
                  let damage_2 = battleResult(undefined, dice[0], "Bow") + halfDiceRoll(dice[1]);
                  mod_board[currentIndex].squad.squad[memberIndex].WP = mod_board[currentIndex].squad.squad[memberIndex].WP - damage_2;
                  changeBoardMap(mod_board);
                  break;
              case "Poison Gas":
                  let damage_3 = halfDiceRoll(dice);
                  mod_board[currentIndex].squad.squad[memberIndex].WP = mod_board[currentIndex].squad.squad[memberIndex].WP - damage_3;
                  changeBoardMap(mod_board);
                  break;
              case "Explosion":
                  for (let i = 0; i < mod_board[currentIndex].squad.squad.length; i++){
                      if(mod_board[currentIndex].squad.squad[i].Name !== undefined)
                          mod_board[currentIndex].squad.squad[i].WP = mod_board[currentIndex].squad.squad[i].WP - 1;
                  }
                  changeBoardMap(mod_board)
                  break;
          }
          navigation.setParams({
              squad: mod_board[currentIndex].squad.squad
          })
          setModalOption("nextState")
          setModalVisible(false)
          send("NEXT")
          break;
      case "checkMonsters":
        setModalOption("nextState")
        setModalVisible(false)
        if(state.context.goNewTile === true && isCorridorConnection(prevIndex) === false){
          if (dice < 4 || dice >= 4) {
            send("EXIST")
            navigation.navigate({
              name: "Battle",
              params: {
                  squad: boardMap[currentIndex].squad.squad,
                  money: boardMap[currentIndex].squad.money,
                  XP: boardMap[currentIndex].squad.XP
              }
            })
          }
          else
            send("NONE")
        } else {
          if(dice === 1) {
            send("EXIST")
            navigation.navigate({
              name: "Battle",
              params: {
                  squad: boardMap[currentIndex].squad.squad,
                  money: boardMap[currentIndex].squad.money,
                  XP: boardMap[currentIndex].squad.XP
              }
            })
          }
          else
            send("NONE")
        }

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
            <Text style={styles.modalText}>Your dice roll result must be lower that or equal to the skill value!</Text>
            <View style={styles.list}>
              <FlatList
                  style={styles.flatlist}
                  scrollEnabled={false}
                  data={boardMap[currentIndex].squad.squad}
                  numColumns={3}
                  renderItem={({item, index}) => (
                      <View>
                        <TouchableOpacity onPress={() => SetMember(index)}>
                          <View style={[styles.tileContainer, {backgroundColor: item.Name ? "silver" : "grey"}]}>
                            <Text style={[styles.textButton, {textAlign: "center", color:"black",fontSize: 14}]}>{item.Name ? item.Name : index < 6 ? "Lonely..." : "Empty"}</Text>
                            <Text style={[styles.textButton, {textAlign: "center", color:"black",fontSize: 14}]}>{item.Skill ? item.Skill[0] + ": " + item.Skill[1] : null}</Text>
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
    case "chooseMember":
      break;
  }
}


  function TileCheck(item) {
    if (item.type !== undefined) {
      return (
          <View style={[styles.textContainer, {borderColor: item.squad.squad !== undefined ? "red" : "silver"}]}>
            <Text style={[styles.text, {textAlign: "center"}]}>{item.top}</Text>
            <Text style={styles.text}>{item.left} {item.right}</Text>
            <Text style={[styles.text, {textAlign: "center"}]}>{item.bottom}</Text>
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
            <View style={{flexDirection:"row"}}>
              <TouchableOpacity onPress={ChooseNewTile}>
                <View style={styles.textButtonContainer}>
                  <Text style={styles.textButton}>Choose New Tile!</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={ChoosePrevTile}>
                <View style={styles.textButtonContainer}>
                  <Text style={styles.textButton}>Choose Previous!</Text>
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
      case "moveSquad":
        return(
            <View style={{flexDirection:"row"}}>
              <TouchableOpacity onPress={() => BoardTilesActions(newIndex)}>
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
                    data={boardMap}
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
    fontSize:4,
  },
  textContainer: {
    alignContent: "center",
    alignItems:"center",
    width: 30,
    height: 30,
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
    alignSelf: "center",
    height:405,
    width:360,
    borderColor:"red",
  },
  flatlist: {
    alignContent:"center"
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

