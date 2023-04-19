import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import {
    Alert, Button,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useMachine} from "@xstate/react";
import {
    Team,
} from "../SquadController";
import {hubMachine} from "../StateMachine/StateMachine.SquadHub";
import {getSpell, halfDiceRoll, rollDice} from "../GameController";



export default function SquadHub({route, navigation}) {
    const [state, send] = useMachine(hubMachine);
    const [squad, updateSquad] = useState(route.params.squad);
    const [money, updateMoney] = useState(route.params.money);
    const [xp, updateXP] = useState(route.params.XP);
    const [modalVisible, setModalVisible] = useState(false);
    const [member, showMember] = useState({});
    const [modalOption, setModalOption] = useState("showHeroInfo");
    const [chosenSpell, updateChosenSpell] = useState(null)
    const [chosenItem, updateChosenItem] = useState({})
    const [dice, updateDice] = useState(null)

    useEffect(() => {
      navigation.setOptions({
          headerLeft: () => (
            <Button
                title={"Return to Board"}
                onPress={() => {
                    navigation.navigate({
                      name: "Board",
                      params: {
                          squad: squad,
                          money: money,
                          XP: xp
                      }
                });
            }}/>
          )
      })
  }, [navigation])

    useEffect(() => {
        console.log(squad)
        console.log(state.value);
        console.log(member)
  }, [state, squad, member])

    useEffect(() => {
        updateSquad(route.params.squad)
    }, [route.params?.squad])

    let upTeam = Team;


 const SetMember = (memb, index) => {
     switch(state.value){
         case "idle":
             if(memb.Name !== undefined) {
                 setModalOption("idle");
                 showMember(memb);
                 setModalVisible(true);
             } else {
                 Alert.alert("User pressed on empty field!")
             }
              break;
         case "startReorganize":
             if(!Number.isInteger(member)){
                  showMember(index)
              } else {
                  [squad[member], squad[index]] = [squad[index], squad[member]]
                  showMember({})
             }
             break;
         case "useSpell":
             if(memb !== member) {
                 switch (chosenSpell.spell_name) {
                     case "Heal":
                         memb.WP += halfDiceRoll(rollDice()) + 1
                         member.WP -= chosenSpell.cost
                         break;
                     case "Rejuvenate":
                         memb.WP += rollDice() + 1
                         member.WP -= chosenSpell.cost
                         break;
                     case "Thief":
                         if(!memb.Effects.includes(chosenSpell.spell_name) && memb.Skill.some((skill) => skill.Name === "Detrap")) {
                             memb.Effects.push(chosenSpell.spell_name)
                             member.WP -= chosenSpell.cost
                         } else
                             Alert.alert(`Hero already has ${chosenSpell.spell_name} of there is no Detrap skill!`)
                         break;
                     default:
                         if(!memb.Effects.includes(chosenSpell.spell_name)) {
                             memb.Effects.push(chosenSpell.spell_name)
                             member.WP -= chosenSpell.cost
                         } else
                             Alert.alert(`Hero already has ${chosenSpell.spell_name} effect!`)
                 }
                 send("DONE")
             } else {
                 Alert.alert("Hero can cast spell only on another hero!")
             }
             break;
         case "useItem":
             switch(chosenItem.effect){
                 case "Heal":
                     memb.WP += rollDice()
             }
             let itemIndex = member.Inventory.findIndex((item) => item === chosenItem)
             member.Inventory.splice(itemIndex, 1);
             send("DONE")
             break;
     }

}

function CheckChosenSpell(spell){
     switch(spell){
         default:
             Alert.alert("You can use only healing or buffing spells here!")
             break;
         case "Heal":
         case "Rejuvenate":
         case "Thief":
         case "Oratory":
             updateChosenSpell(JSON.parse(JSON.stringify(getSpell(spell))))
             send("USE")
             setModalVisible(false)
             break;
     }
}

function CheckChosenItem(item){
     switch(item.type){
         default:
             Alert.alert("You can use only potions here!")
             break;
         case "Potion":
             switch(item.effect){
                 case "Heal":
                     updateChosenItem(JSON.parse(JSON.stringify(item)))
                     send("USE")
                     setModalVisible(false)
             }
     }
}

  const itemSeparator = () => {
    return(<View style={styles.separator}/>)
  }

  function NextStateTemplate() {
     switch (state.value) {
         case "checkInventory":
             return(
                 <View>
                    <Text style={styles.modalText}>{member.Name}'s Inventory</Text>
                     {member.Inventory ? member.Inventory.map((item, index) => {
                        return(
                            <View key={index} style={{paddingTop:5}}>
                                <TouchableOpacity
                                    onPress={() => CheckChosenItem(item)}
                                    style={[styles.button, styles.buttonClose]}
                                >
                                    <Text style={styles.textStyle}>{item.type} of {item.effect}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                     }) : null}
                 </View>
             )
         case "checkSpells":
             return(
                 <View>
                    <Text style={styles.modalText}>{member.Name}'s list of Spells</Text>
                     {member.Spells ? member.Spells.map((item, index) => {
                        return(
                            <View key={index} style={{paddingTop:5}}>
                                <TouchableOpacity
                                    onPress={()=>CheckChosenSpell(item)}
                                    style={[styles.button, styles.buttonClose, {backgroundColor:"limegreen"}]}
                                >
                                    <Text style={styles.textStyle}>{item}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                     }) : null}
                 </View>
             )
     }
  }

  function ModalButton() {
        switch (state.value) {
            case "checkInventory":
            case "checkSpells":
                return(
                    <View style={{paddingTop:10}}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose, {backgroundColor:"tomato"}]}
                            onPress={() => {
                                send("CANCEL")
                                setModalOption("idle")
                            }}
                        >
                          <Text style={styles.textStyle}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                )
        }
  }

  function ErrorMessage() {

  }

  function ScreenButton(){
     switch(state.value) {
         case "idle":
             return(
                 <View style={{paddingTop: 25}}>
                     <TouchableOpacity onPress={() => send("REORGANIZE")}>
                         <View style={styles.textButtonContainer}>
                             <Text style={styles.textButton}>Reorganize</Text>
                         </View>
                     </TouchableOpacity>
                 </View>
                 )
         case "startReorganize":
             return(
                 <View style={{paddingTop: 15}}>
                     <View style={styles.headerTextContainer}>
                        <Text style={styles.textHeader}>{!Number.isInteger(member) ? "Choose the person to swap places!" : (squad[member].Name ? "Choose who will swap with " + squad[member].Name : "Choose who will be moved on empty place!")}</Text>
                     </View>
                     <TouchableOpacity style={{paddingTop:20}} onPress={() => send("FINISH")}>
                         <View style={styles.textButtonContainer}>
                             <Text style={styles.textButton}>Complete</Text>
                         </View>
                     </TouchableOpacity>
                 </View>
             )
         case "useSpell":
             return(
                 <View style={{paddingTop: 15}}>
                     <View style={styles.headerTextContainer}>
                        <Text style={styles.textHeader}>Choose hero to cast the {chosenSpell.spell_name} spell on!</Text>
                     </View>
                     <TouchableOpacity style={{paddingTop:20}} onPress={() => {
                         send("CANCEL")
                         setModalVisible(true)
                     }}>
                         <View style={[styles.textButtonContainer, {backgroundColor: "tomato"}]}>
                             <Text style={styles.textButton}>Cancel</Text>
                         </View>
                     </TouchableOpacity>
                 </View>
             )
         case "useItem":
             return(
                 <View style={{paddingTop: 15}}>
                     <View style={styles.headerTextContainer}>
                        <Text style={styles.textHeader}>Choose hero to use the {chosenItem.type} of {chosenItem.effect} on!</Text>
                     </View>
                     <TouchableOpacity style={{paddingTop:20}} onPress={() => {
                         send("CANCEL")
                         setModalVisible(true)
                     }}>
                         <View style={[styles.textButtonContainer, {backgroundColor: "tomato"}]}>
                             <Text style={styles.textButton}>Cancel</Text>
                         </View>
                     </TouchableOpacity>
                 </View>
             )

     }
  }

  function DisplayStats(){
     return(
         <View style={{flexDirection:"row", justifyContent:"space-between"}}>
             <Text style={styles.textHeader}>Money: {money}</Text>
             <Text style={styles.textHeader}>XP: {xp}</Text>
         </View>
     )
  }
  function TitleText() {
     switch(state.value){
         default:
             return(
                 <View style={styles.headerTextContainer}>
                    <Text style={styles.textHeader}>Welcome to Squad Hub!</Text>
                 </View>
             )
         case "startReorganize":
             return(
                 <View style={styles.headerTextContainer}>
                    <Text style={styles.textHeader}>Reorganize your Squad!</Text>
                 </View>
             )
         case "useSpell":
             return(
                 <View style={styles.headerTextContainer}>
                    <Text style={styles.textHeader}>Cast Spell!</Text>
                 </View>
             )
         case "useItem":
             return(
                 <View style={styles.headerTextContainer}>
                    <Text style={styles.textHeader}>Use Item!</Text>
                 </View>
             )
     }
  }


  function ModalScreen() {
    switch (modalOption) {
        case "idle":
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
                      <View>
                          <Text style={styles.modalText}>{member.Name}</Text>
                          <View style={{paddingTop:5}}>
                               <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => setModalOption("showHeroInfo")}
                                >
                                  <Text style={styles.textStyle}>Info</Text>
                                </TouchableOpacity>
                          </View>
                          <View style={{paddingTop:5}}>
                              <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => {
                                        send("INVENTORY")
                                        setModalOption("nextState")
                                    }}
                                >
                                  <Text style={styles.textStyle}>Inventory</Text>
                                </TouchableOpacity>
                          </View>
                          <View style={{paddingTop:5}}>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose,{backgroundColor:"limegreen"}]}
                                    onPress={() => {
                                        send("SPELLS")
                                        setModalOption("nextState")
                                    }}
                                >
                                  <Text style={styles.textStyle}>Spells</Text>
                                </TouchableOpacity>
                          </View>
                            <View style={{paddingTop:10}}>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose,{backgroundColor:"tomato", paddingTop:10}]}
                                    onPress={() => setModalVisible(false)}
                                >
                                  <Text style={styles.textStyle}>Close</Text>
                                </TouchableOpacity>
                            </View>
                      </View>
                  </View>
                </View>
              </Modal>
          );
      case "showHeroInfo":
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
                    <Text style={styles.modalText}>{member.Name ? "Name: " + member.Name : "Add new member here to see his info!"}</Text>
                    <Text style={styles.modalText}>{member.Race ? "Race: " + member.Race : null}</Text>
                    <Text style={styles.modalText}>{member.WP ? "Wound Points / WP: " + member.WP : null}</Text>
                    <Text style={styles.modalText}>{member.MP ? "Mana Points / MP (Red/Yellow/Blue): " + member.MP : null}</Text>
                    <Text style={styles.modalText}>{member.Spells ? "Spells: " + member.Spells : null}</Text>
                    <Text style={styles.modalText}>{member.RV ? "Resistance / RV: " + member.RV : null}</Text>
                    <Text style={styles.modalText}>{member.CB ? "Combat Bonus : " + member.CB : null}</Text>
                    <Text style={styles.modalText}>{member.Weapon ? "Weapons: " + member.Weapon : null}</Text>
                    <Text style={styles.modalText}>{member.Effects ? "Effects: " + member.Effects : null}</Text>
                    <Text style={styles.modalText}>{member.WS ? "Weapon Skills: " + member.WS.map((weaponSkill) => {return "{" + weaponSkill.Type + ": +" + weaponSkill.Damage + (weaponSkill.Magic ? ", Magic} " : "} ")}) : undefined}</Text>
                    <Text style={styles.modalText}>{member.Skill ? "Hero Skills: " + member.Skill.map((skill) => {return "{" + skill.Name + ": +" + skill.Value + "} "}) : undefined}</Text>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalOption("idle")}
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


  return (
    <View style={styles.container}>
        <ModalScreen/>
        <DisplayStats/>
        <TitleText/>
      <View style={styles.list}>
        <FlatList
            style={styles.flatlist}
            scrollEnabled={false}
            ItemSeparatorComponent={itemSeparator}
            data={squad}
            numColumns={3}
            renderItem={({item, index}) => (
                <View>
                  <TouchableOpacity onPress={() => SetMember(item, index)}>
                    <View style={[styles.textContainer, {backgroundColor: item.Name ? "silver" : "grey"}]}>
                      <Text style={styles.text}>{item.Name ? item.Name : index < 6 ? "Lonely..." : "Empty"}</Text>
                      <Text style={styles.text}>{item.WP ? "WP: " + item.WP : null}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
            )}
        />
      </View>
        <ScreenButton/>
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
      paddingTop: 10
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
    width:150,
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

