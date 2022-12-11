import {halfDiceRoll, monsterDataset} from "./GameController";

interface CharacterInfo {
    "id": number;
    "Name": string;
    "Race": string;
    "WP": number;
    "MP": [number, number, number];
    "RV": number;
    "CB": number;
    "Weapon": [string, string];
    "WS": [string, number];
    "Skill": [string, number];
}

interface MonsterInfo {
    "id": number;
    "Name": string;
    "RV": number;
    "NV": number;
    "Weapon": [string, number];
    "Spells": [string, number];
    "Treasure": [];
    "Special": string;
}

const CharactersList = require("../Database/heroes.json")

export function idRandomHero(save) {
    let min = Math.ceil(1)
    let max = Math.floor(23)
    let res = Math.floor(Math.random() * (max - min + 1)) + min;
    return res;
}

export const randomHero = (id => CharactersList.find(m => {
    return m.id === id;
}))

export const Team = Array(6).fill({})
let TeamBattlePos = Array(3).fill(Array(3).fill({}))
let EnemiesBattlePos = Array(3).fill(Array(3).fill({}))

export function addTeamMember(item) {
    return Team.push(item)
}

export function chooseFollowerRace(dice) {
   let res = halfDiceRoll(dice)
    switch (res) {
        case 1:
            return "Elf"
            break;
        case 2:
            return "Dwarf";
            break;
        case 3:
            return "Human";
            break;
    }
}

export function setTeamSquadPos(item, x, y){
    return TeamBattlePos[x][y] = item;
}

export function setEnemySquadPos(item, x, y){
    return EnemiesBattlePos[x][y] = item;
}

export function updateEnemySquad(){
    EnemiesBattlePos = Array(3).fill(Array(3).fill({}))
}
