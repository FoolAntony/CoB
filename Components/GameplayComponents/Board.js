import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ReactNativeZoomableView} from "@openspacelabs/react-native-zoomable-view";
import {useMachine} from "@xstate/react";
import {boardMachine} from "../StateMachine/StateMachine.Board";
import {getTile, idRandomTile} from "../GameController";

let initBoard = Array(187).fill({})

let squad =  {
    type: "squad",
    src: "../assets/Tile_Images/The_Party_Marker.png",
    rotationAngle: 0
  }

const setInitBoard = (squad) =>{
  initBoard[93] = {
    type: "entry",
    src: "",
    rotationAngle: 0,
    squad: {
      type:"squad",
      team: squad
    }
  };
  return initBoard
}


export default function Board({route, navigation}) {

  const [boardMap, changeBoardMap] = useState(setInitBoard(route.params.squad))
  const [state, send] = useMachine(boardMachine)
  const [tile, updateTile] = useState({})

  function Actions() {
    switch (state.value) {
      case "":
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
        } else {
          Alert.alert("Player have chosen wrong board place for this tile. Please, check if sides of the connected tiles are the same and there is squad in one of them!")
        }
        break;
    }
  }

  function CheckTilesConnected(index) {
    let top_check = false
    let right_check = false
    let bottom_check = false
    let left_check = false
    if(boardMap[index - 1] !== undefined && (Math.floor((index - 1) / 11) === Math.floor(index / 11)) && boardMap[index - 1].type !== undefined){
      if(boardMap[index - 1].type === "entry" || boardMap[index - 1].right === tile.left)
        left_check = true
      else
        console.log("Left error!")
    } else {
      left_check = true
    }
    if(boardMap[index - 11] !== undefined && boardMap[index - 11].type !== undefined){
      if(boardMap[index - 11].type === "entry" || boardMap[index - 11].bottom === tile.top)
        top_check = true
      else
        console.log("Top error!")
    } else {
      top_check = true
    }
    if(boardMap[index + 1] !== undefined && (Math.floor((index + 1) / 11) === Math.floor(index / 11)) && boardMap[index + 1].type !== undefined){
      if(boardMap[index + 1].type === "entry" || boardMap[index + 1].left === tile.right)
        right_check = true
      else
        console.log("Right error!")
    } else {
      right_check = true
    }
    if(boardMap[index + 11] !== undefined && boardMap[index + 11].type !== undefined){
      if(boardMap[index + 11].type === "entry" || boardMap[index + 11].top === tile.bottom)
        bottom_check = true
      else
        console.log("Bottom error!")
    } else {
      bottom_check = true
    }

    return top_check && bottom_check && right_check && left_check
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
    updateTile(modified)
  }


  const ChooseNewTile = () => {
    send("NEW")
  }

  const ChoosePrevTile = () => {
    send("OLD")
  }

  function TileCheck(item) {
    if (item.type !== undefined) {
      return (
          <View style={[styles.textContainer, {borderColor: item.squad.type === "squad" ? "red" : "silver"}]}>
            <Text style={[styles.text, {textAlign: "top"}]}>{item.top}</Text>
            <Text style={styles.text}>{item.left} {item.right}</Text>
            <Text style={[styles.text, {textAlign: "bottom"}]}>{item.bottom}</Text>
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
            <Text style={[styles.textButton, {textAlign: "top", color:"black", fontSize: 14}]}>{tile.top}</Text>
            <Text style={[styles.textButton,{color:"black",fontSize: 14}]}>{tile.left} {tile.right}</Text>
            <Text style={[styles.textButton, {textAlign: "bottom", color:"black",fontSize: 14}]}>{tile.bottom}</Text>
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
    }
 }

 useEffect(() => {
   console.log(state.value)
   console.log(tile)
 }, [state, tile])

  return (
      <View style={styles.container}>
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
    textAlign:"center",
    fontSize:5,
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

