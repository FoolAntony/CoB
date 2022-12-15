import React, {useState} from "react";
import {FlatList, Modal, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {randomHero, Team} from "../SquadController";
import {getMonsterCopy} from "../GameController";

const TeamSet = [ JSON.parse(JSON.stringify(randomHero(1))), JSON.parse(JSON.stringify(randomHero(2))), JSON.parse(JSON.stringify(randomHero(3))),
                  JSON.parse(JSON.stringify(randomHero(4))), JSON.parse(JSON.stringify(randomHero(5))), JSON.parse(JSON.stringify(randomHero(6))),
                  {}, {}, {}]

const MonsterSet = [ {} , {} , {} , {} , {} , {} , JSON.parse(JSON.stringify(getMonsterCopy("Ghost"))) , JSON.parse(JSON.stringify(getMonsterCopy("Ghost"))) , JSON.parse(JSON.stringify(getMonsterCopy("Ghost")))]


export default function Battlefield() {

  const [team, updateTeam] = useState(TeamSet)
  const [monsters, updateMonsters] = useState(MonsterSet)
  const [modalVisible, setModalVisible] = useState(false);
  const [member, showMember] = useState({});

  const SetMember = (member) => {
  showMember(member);
  setModalVisible(true);
}

  function ModalScreen() {

    return (
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
                <View style={{alignSelf:"center"}}>
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
        <View style={styles.list}>
        <FlatList
            style={styles.flatlist}
            scrollEnabled={false}
            ItemSeparatorComponent={itemSeparator}
            data={monsters}
            numColumns={3}
            renderItem={({item, index}) => (
                <View style={{alignSelf:"center", opacity:0.2}}>
                  <TouchableOpacity onPress={() => SetMember(item)}>
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


  return (
    <View style={styles.container}>
      <View style={{paddingBottom:20}}>
        <Text style={styles.textHeader}>FIGHT!</Text>
      </View>
      <MonstersField/>
      <ModalScreen/>
      <TeamField/>
      <View style={{paddingTop:30}}>
        <TouchableOpacity  onPress={() => console.log("Hello!")}>
          <View style={styles.textButtonContainer}>
            <Text style={styles.textButton}>Start Battle!</Text>
          </View>
        </TouchableOpacity>
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
    height:40,
    backgroundColor:'#4040a1',
    marginBottom: 100,
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
