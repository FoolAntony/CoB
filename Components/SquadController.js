import {monsterDataset} from "./GameController";

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

let Team = []
let TeamBattlePos = Array(3).fill(Array(3).fill({}))
let EnemiesBattlePos = Array(3).fill(Array(3).fill({}))

export function addTeamMember(item) {
    return Team.push(item)
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
