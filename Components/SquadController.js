import {halfDiceRoll} from "./GameController";

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
const FollowersList = require("../Database/heroes_followers.json")
const spellsTable = require("../Database/table_of_spells.json")

export function idRandomHero() {
    let min = Math.ceil(1)
    let max = Math.floor(23)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomHero = (id => CharactersList.find(m => {
    return m.id === id;
}))


export const getRandomHero = (id) => {
    return JSON.parse(JSON.stringify(randomHero(id)))
}

const chooseFollowerRace = (Race => FollowersList.find(m => {
   return m.Race === Race
}))

export const Team = Array(9).fill({})
let TeamBattlePos = Array(3).fill(Array(3).fill({}))
let EnemiesBattlePos = Array(3).fill(Array(3).fill({}))


export function chooseFollowerTemplate(dice) {
   let res = halfDiceRoll(dice)
    switch (res) {
        case 1:
            return chooseFollowerRace("Elf")
        case 2:
            return chooseFollowerRace("Dwarf");
        case 3:
            return chooseFollowerRace("Human");
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

