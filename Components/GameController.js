
interface SpellInfo{
  "id": number,
  "spell_name": string,
  "cost": number,
  "type": string
}

export const tileDataset = require('../Database/TilesDB.json')

export function idRandomTile() {
    let min = Math.ceil(1)
    let max = Math.floor(181)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getTile = (id => tileDataset.find(m => {
  return m.id === id;
}))


export const briberyMoneySet = [20, 40, 60, 80, 100, 150, 200, 300, 400]

export const spellsList = ["Charm", "Blast", "Explosion", "Thunderbolt", "Sleep", "Redemption", "Magic Shield", "Hesitate", "Cease Fire", "Mental Attack",
                            "Lock", "Magic Armor", "Neutralize Poison", "Stone-Flash", "Strength", "Teleport", "Heal", "Rejuvenate", "Thief", "Oratory",
                            "Harassment", "Daunt", "Deal", "Flattery"]

let board = Array(50).fill(Array(50).fill({}))
board[25][25] = {type: "Start"}


export const monsterDataset = require('../Database/monsters.json')

export const spellDataset = require('../Database/table_of_spells.json')

export const monst = (name => monsterDataset.find(m => {
  return m.Name === name;
}))

export const getSpell = (name => spellDataset.find(m => {
    return m.spell_name === name;
}))

export const foutainTypeList = ["Poison", "Potion", "Alcohol", "Diamond", "Water", "Blood"]
export const statueTypeList = ["Medusa", "Diamond", "Medallion", "Demon", "Talisman", "Unknown"]
export const trapdoorTypeList = ["Trap", "Room", "Hatch", "Hellgate"]
export const furnitureTypeList = ["Coffin", "Closet", "Desk", "Bed", "Harpsichord", "Mirror"]
export const altarTypeList = ["Alloces", "Vassago", "Anvas", "Malthus", "Lerae", "Asmodus"]
export const artTypeList = ["Gobelin", "Drawing", "Sculpture", "Cristal", "Icon", "Manuscript"]

export function CheckRoomInside(type, dice) {
    switch (type) {
        case "fountain":
            return foutainTypeList[dice - 1]
        case "statue":
            return statueTypeList[dice - 1]
        case "trapdoor":
            if(dice < 3)
                return trapdoorTypeList[0]
            else if (dice >= 3 && dice < 5)
                return trapdoorTypeList[1]
            else
                return trapdoorTypeList[dice - 3]
        case "furniture":
            return furnitureTypeList[dice - 1]
        case "altar":
            return altarTypeList[dice - 1]
        case "art":
            return artTypeList[dice - 1]
    }
}



export const monsterTable = [
    [monst("Evil Mage"), monst("Evil Hero"), monst("Cronk"),
      monst("Gargoyle"), monst("Chimera"), monst("Medusa")],
    [monst("Orc"), monst("Troll"), monst("Vampire"),
      monst("Harpy"), monst("Ogre"), monst("Minotaur")],
    [monst("Dire Wolf"), monst("Wight"), monst("Warg"),
      monst("Evil Mage"), monst("Evil Hero"), monst("Cronk")],
    [monst("Gargoyle"), monst("Chimera"), monst("Medusa"),
      monst("Orc"), monst("Hydra"), monst("Vampire")],
    [monst("Harpy"), monst("Ogre"), monst("Minotaur"),
      monst("Dire Wolf"), monst("Wight"), monst("Warg")],
    [monst("Skeleton"), monst("Ghost"), monst("Skeleton"),
      monst("Ghost"), monst("Troll"), monst("Hydra")]
];

export const monsterWanderingTable = [
  [monst("Evil Hero"), monst("Evil Mage"), monst("Chimera")],
  [monst("Gargoyle"), monst("Medusa"), monst("Orc")],
  [monst("Troll"), monst("Vampire"), monst("Harpy")],
  [monst("Ogre"), monst("Minotaur"), monst("Dire Wolf")],
  [monst("Wight"), monst("Warg"), monst("Ghost")],
  [monst("Hydra"), monst("Skeleton"), monst("Cronk")]
];

export const battleResultTable = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0],
    [1, 0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 2, 2, 2, 1],
    [2, 1, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 3, 3, 3, 2],
    [3, 2, 3, 3, 4, 4, 2],
    [3, 3, 3, 4, 4, 4, 3],
    [4, 3, 4, 4, 5, 5, 4],
    [4, 4, 4, 5, 5, 5, 5]
]

export const briberyTable = [
    [4, 2, 1, 1, 0, 0],
    [4, 3, 2, 1, 1, 0],
    [5, 4, 2, 2, 1, 1],
    [6, 5, 4, 2, 2, 1],
    [6, 6, 4, 3, 2, 1],
    [6, 6, 5, 4, 3, 2],
    [6, 6, 6, 4, 4, 2],
    [6, 6, 6, 5, 4, 3],
    [6, 6, 6, 5, 5, 4]
]

export const treasureGoldTable = [
    [0,0],
    [6,1],
    [6,1],
    [1,1],
    [2,10],
    [3,5],
    [6,5],
    [6,1],
    [6,5],
    [6,20],
    [6,20],
    [6,20]
]

export const treasureJewelryTable = [
    [0,0],
    [0,0],
    [0,0],
    [1,1],
    [2,2],
    [3,1],
    [3,2],
    [1,1],
    [2,2],
    [3,2],
    [4,2]
]

export const treasureMagicItemTable = [
    [0,0],
    [0,0],
    [1,1],
    [0,0],
    [2,1],
    [1,1],
    [2,1],
    [1,1],
    [2,1],
    [3,2],
    [3,2],
    [4,2]
]

export const magicItemsTable = [
    ["Sword", "Hammer", "Axe", "Bow", "Dagger", "T-Dagger"],
    [1,1,1,2,2,"Throw twice"],
    ["Poison", "Power", "Power", "Charm Person", "Charm Monster", "Heal"],
    ["Wise", "Yellow Sun", "Blue Sun", "Red Sun", "All Suns", "Evil"],
    ["Neutralize Poison", "Potion Check", "Oratory", "Combat Bonus","Neutralize Poison", "Asphyxiation"],
    ["Resistance +1", "Resistance +2", "Dream", "Neutralize Poison", "Heal", "Resurrection"],
]

export function rollDice() {
  return 1 + Math.floor(Math.random() * 6);
}

export function rollTwoDices() {
  let a = rollDice();
  let b = rollDice();
  return a + b;
}

export function halfDiceRoll(dice){
  let q = Math.floor(dice/2);
  let rem = dice % 2;
  if (rem === 1){
    q += 1
  }
  return q
}

export function magicPotential(dice){
  switch (dice){
    case 3:
      return [2,1,0]
    case 4:
      return [0,1,2]
    case 5:
      return [1,1,1]
    case 6:
      return [2,2,2]
    default:
      return [0,0,0]
  }
}

export function findPrimarySun(dice) {
  if(dice < 3){
    return 0
  } else if (dice >= 3 && dice < 5) {
    return 1
  } else if (dice >= 5) {
    return 2
  }
}

export function negotiation(dice, hero, monster){
  let spell_buff = 0
  if (hero.Skill[0] === "Negotiation") {
    return dice + spell_buff + hero.Skill[1] - monster.NV
  } else {
    return dice + spell_buff - monster.NV
  }
}

export function monsterType(d1, d2, dice){
  let i = d1 - 1;
  let j = d2 - 1;
  let res = monsterTable[i][j]
  let a = 1;
  if ((d1 === 4 && d2 === 1) || (d1 === 4 && d2 === 2) || (d1 === 5 && d2 === 2) || (d1 === 5 && d2 === 5)) {
    a = 2;
  } else if ((d1 === 1 && d2 === 3) || (d1 === 3 && d2 === 1) || (d1 === 5 && d2 === 4) || (d1 === 5 && d2 === 6) || (d1 === 6 && d2 === 4)) {
    a = dice;
  } else if ((d1 === 2 && d2 === 1) || (d1 === 6 && d2 === 1) || (d1 === 6 && d2 === 2)) {
    a = halfDiceRoll(dice);
  } else if ((d1 === 2 && d2 === 4) || (d1 === 6 && d2 === 4)) {
    a = halfDiceRoll(dice) + 2;
  } else if ((d1 === 3 && d2 === 6) || (d1 === 4 && d2 === 4)) {
    a = dice + 1;
  }
  return {monster: res, amount: a};
}

export function monsterWanderingType(d1,d2,dice){
  let a = 1;
  let i = d1 - 1;
  let j = halfDiceRoll(d2) - 1;
  let res = monsterWanderingTable[i][j]
  if ((d1 === 2 && d2 === 5) || (d1 === 2 && d2 === 6) || (d1 === 5 && d2 === 3) || (d1 === 5 && d2 === 4) || (d1 === 5 && d2 === 5) || (d1 === 5 && d2 === 6)) {
    a = halfDiceRoll(dice);
  } else if ((d1 === 3 && d2 === 5) || (d1 === 3 && d2 === 6)) {
    a = halfDiceRoll(dice) + 2;
  } else if ((d1 === 4 && d2 === 5) || (d1 === 4 && d2 === 6) || (d1 === 6 && d2 === 5) || (d1 === 6 && d2 === 6)) {
    a = dice;
  }

  return {monster: res, amount: a};
}

export function battleResultNum(item, dice, type){
  let res = 0
  if (item !== undefined)
      res = (item.CB !== undefined && item.CB !== null ? item.CB : 0) + dice +
          + (item.WS !== undefined ? item.WS.filter(skill => skill.Type === type).reduce((a,b) => a + b.Damage, 0) : 0) +
        + (item.Inventory !== undefined && item.Inventory.includes((object) => (object.effect === "Combat Bonus")) ? 2 : 0);
  else
      res = dice
  let index = 0
  switch (res){
    case 1:
    case 2:
    case 3:
      break;
    case 4:
      index = 1;
      break;
    case 5:
      index = 2;
      break;
    case 6:
    case 7:
    case 8:
    case 9:
      index = 3;
      break;
    case 10:
      index = 4;
      break;
    case 11:
      index = 5;
      break;
    case 12:
      index = 6;
      break;
    case 13:
      index = 7;
      break;
    case 14:
      index = 8;
      break;
    case 15:
      index = 9;
      break;
    case 16:
      index = 10;
      break;
    default:
      index = 11;
      break;
  }
  console.log("GameController result: "+res)
  return index
}

export function getWeapon(dice) {
  switch (dice){
    case 1:
      return "Dagger";
    case 2:
      return "T-Dagger";
    case 3:
      return "Bow";
    case 4:
      return "Sword";
    case 5:
      return "Hammer";
    case 6:
      return "Axe";
  }
}

export function battleResultType(type){
  let index = 0
  switch (type){
    case "Dagger":
      break;
    case "T-Dagger":
      index = 1;
      break;
    case "Bow":
      index = 2;
      break;
    case "Sword":
      index = 3;
      break;
    case "Hammer":
      index = 4;
      break;
    case "Axe":
      index = 5;
      break;
    case "Monster":
      index = 6;
      break;
    default:
      console.log("Error in battleResultType() function!")
  }
  return index
}

export function battleResult(item, dice, type){
  let i = battleResultNum(item, dice, type);
  let j = battleResultType(type);
  return battleResultTable[i][j];
}

export function briberyWP_N(sum) {
  let index = 0
  if (sum > 5 && sum < 10)
    index = 1
  if (sum > 9 && sum < 13)
    index = 2
  if (sum > 12 && sum < 17)
    index = 3
  if (sum > 16 && sum < 21)
    index = 4
  if (sum >= 21)
    index = 5
  return index
}

export function briberyGold(value) {
  let index = 0;
  switch (value){
    case 20:
      break;
    case 40:
      index = 1;
      break
    case 60:
      index = 2;
      break;
    case 80:
      index = 3;
      break;
    case 100:
      index = 4;
      break;
    case 150:
      index = 5;
      break;
    case 200:
      index = 6;
      break;
    case 300:
      index = 7;
      break;
    default:
      break;
  }
  if (value >= 400)
    index = 8

  return index
}

export function briberyResult(monster, gold){
  let sum = monster.WP + monster.NV
  let i = briberyWP_N(sum)
  let j = briberyGold(gold)
  return briberyTable[j][i]
}

export function weaponBonus(d) {
  let bonus = 0;
  switch (d) {
    case 1:
      bonus = 1;
      break;
    case 2:
    case 3:
      bonus = 2;
      break;
    case 4:
    case 5:
      bonus = 3;
      break;
    default:
      break;
  }
  return bonus;
}

let jewelry_table = [1, 5, 10, 15, 20, 25, 35, 50, 75, 100, 150];

export function jewelryTable(res) {
  let i = res - 2;
  if (i > 10)
      i = 10
  return jewelry_table[i];
}

export function getMagicItem(d1, d2) {
  let i = d1 - 1;
  let item_type = ""
  switch (d1){
      case 1:
          item_type = "Weapon"
          break;
      case 2:
          item_type = "Armor"
          break;
      case 3:
          item_type = "Potion"
          break;
      case 4:
          item_type = "Talisman"
          break;
      case 5:
          item_type = "Medallion"
          break;
      case 6:
          item_type = "Ring"

  }
  let j = d2 - 1
  return {type: item_type, effect: magicItemsTable[i][j]}
}

export function FindHellGateLevel(dice){
    switch (dice){
        case 1:
            return 0;
        case 2:
        case 3:
            return 1;
        case 4:
        case 5:
        case 6:
            return 2;
    }
}

export function FindHellGateDist(dice){
    return dice + 2;
}

export function getMonsterHP(item, dice){
  if (Array.isArray(dice) === false){
    switch(item.Name) {
      case "Harpy":
        item.WP = halfDiceRoll(dice)
        break;
      case "Evil Hero":
        item.WP = dice + 4;
        break;
      case "Cronk":
      case "Skeleton":
        item.WP = dice + 1;
        break;
      case "Medusa":
      case "Wight":
        item.WP = dice * 2;
        break;
      case "Vampire":
        item.WP = dice * 3;
        break;
      case "Orc":
        item.WP = dice;
        break;
      case "Ogre":
      case "Demon":
        item.WP = dice + 2;
        break;
      case "Dire Wolf":
      case "Warg":
        item.WP = halfDiceRoll(dice) + 2;
        break;
      case "Ghost":
      case "Evil Mage":
        item.WP = dice + 3;
        break;
      case "X the Unknown":
        item.WP = dice + 6;
        break;
    }
  }
  else if(Array.isArray(dice) === true) {
    switch (item.Name) {
      case "Troll":
      case "Hydra":
        item.WP = dice[0] + dice[1] + 3;
        break;
      case "Gargoyle":
        item.WP = dice[0] + dice[1] + dice[2] + 1;
        break;
      case "Chimera":
      case "Minotaur":
        item.WP = dice[0] + dice[1] + 2;
        break;
    }
  }
}

export function SquadIsOver(arr) {
    return arr.every(element => {
      if (element.WP === undefined) {
          return true
      } else return element.WP <= 0;
    });
}


export function areEqual(array1, array2) {
    let values = (o) => Object.keys(o).sort().map(k => o[k]).join('|');
    let mapped1 = array1.map(o => values(o));
    let mapped2 = array2.map(o => values(o));

    return mapped1.every(v => mapped2.includes(v));
}