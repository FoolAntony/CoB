
interface SpellInfo{
  "id": number,
  "spell_name": string,
  "cost": number,
  "type": string
}

export const boardMap = Array(50).fill(Array(50).fill({}))
boardMap[25][25] = {type: "Start"}

export const monsterDataset = require('../Database/monsters.json')

let monst = (name => monsterDataset.find(m => {
  return m.Name === name;
}))

const monsterTable = [
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

const monsterWanderingTable = [
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

export function rollDice() {
  return 1 + Math.floor(Math.random() * 6);
}

export function rollTwoDices() {
  let a = rollDice();
  let b = rollDice();
  return a + b;
}

function halfDiceRoll(dice){
  let q = Math.floor(dice/2);
  let rem = dice % 2;
  if (rem == 1){
    q += 1
  }
  return q
}

export function magicPotential(dice, hero){
  switch (dice){
    case 3:
      return hero.MP = [2,1,0]
    case 4:
      return hero.MP = [0,1,2]
    case 5:
      return hero.MP = [1,1,1]
    case 6:
      return hero.MP = [2,2,2]
    default:
      return hero.MP = [0,0,0]
  }
}

export function negotiation(dice, hero, monster, spell){
  let spell_buff = 0

  if (spell.spell_name === "Oratory") {
    spell_buff = 4
  }

  if (hero.Skill[0] === "Negotiation") {
    return dice + spell_buff + hero.Skill[1] - monster.NV
  } else {
    return dice + spell_buff - monster.NV
  }
}

export function monsterType(d1, d2, dice){
  let i = d1 - 1;
  let j = d2 - 1;
  let dices = [d1,d2];
  let amount = 1;
  switch (dices){
    case([4,1]):
    case([4,2]):
    case([5,2]):
    case([5,5]):
      amount = 2;
      break;
    case([1,3]):
    case([3,1]):
    case([5,4]):
    case([5,6]):
    case([6,3]):
      amount = dice;
      break;
    case([2,1]):
    case([6,1]):
    case([6,2]):
      amount = halfDiceRoll(dice);
      break;
    case([2,4]):
    case([6,4]):
      amount = halfDiceRoll(dice) + 2;
      break;
    case([3,6]):
    case([4,4]):
      amount = dice + 1;
      break;
    default:
      break;
  }
  return {monster: monsterTable[i][j], amount: amount};
}

export function monsterWanderingType(d1,d2,dice){
  let amount = 1;
  let i = d1 - 1;
  let j = halfDiceRoll(d2) - 1;
  let dices = [d1,d2]
  switch (dices){
    case [2,5]:
    case [2,6]:
    case [5,3]:
    case [5,4]:
    case [5,5]:
    case [5,6]:
      amount = halfDiceRoll(dice);
      break;
    case [3,5]:
    case [3,6]:
      amount = halfDiceRoll(dice) + 2
      break;
    case [4,5]:
    case [4,6]:
    case [6,5]:
    case [6,6]:
      amount = dice;
      break;
    default:
      break;
  }
  return {monster:monsterWanderingTable[i][j], amount: amount};
}

export function battleResultNum(res){
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
  return index
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

export function battleResult(res, type){
  let i = battleResultNum(res);
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

export function jewelryTable(dice) {
  let table = [1, 5, 10, 15, 20, 25, 35, 50, 75, 100, 150];
  let i = dice - 2;
  return table[i];
}
