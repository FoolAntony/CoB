import { createMachine, assign } from 'xstate';

function isNoNegotiation(context,event) {
  return context.isNoNegotiationWas && context.isNoBriberyWas
}

function isNoBribery(context, event) {
  return context.isNoBriberyWas && context.isNoNegotiationWas === false
}

const setBriberyIsFailed = assign({
  isNoBriberyWas: (context,event) => context.isNoBriberyWas = false
})

const setNegotiationIsFailed = assign({
  isNoNegotiationWas: (context,event) => context.isNoNegotiationWas = false
});

export const battleMachine = createMachine({
  id: 'battle',
  initial: 'idle',
  context: {
    isNoNegotiationWas: true,
    isNoBriberyWas: true
  },
  states: {
    idle: {
      on: {
        START: "kindOfMonsters"
      }
    },
    kindOfMonsters: {
      on:{
        NEXT: "monstersAmount"
      }
    },
    monstersAmount: {
      on:{
        NEXT: "findMonstersHP"
      }
    },
    findMonstersHP: {
      on: {
        REPEAT: {
          target: "findMonstersHP"
        },
        NEXT: "chooseAction"
      },
    },
    chooseAction: {
      on: {
        NEGOTIATE: {
          target: "doNegotiation",
          cond: "isNoNegotiation"
          },
        BRIBE: {
          target: "doBribery",
          cond: "isNoBribery"
          },
        FIGHT: "doFight"
      }
    },
    doNegotiation: {
      on: {
        BACK: "chooseAction",
        SUCCESS: "endSession",
        FAIL: {
          target: "chooseAction",
          actions: "setNegotiationIsFailed"
        }
      }
    },
    doBribery: {
      on:{
        BACK: "chooseAction",
        SUCCESS: "endSession",
        FAIL: {
          target: "chooseAction",
          actions: "setBriberyIsFailed"
        }
      }
    },
    doFight: {
      on: {
        BACK: "chooseAction",
        WIN: "endSession",
        LOSE: "endSession"
      }
    },
    endSession: {
      type: 'final'
    },
  },
  predictableActionArguments: true
},
{
  guards: { isNoNegotiation, isNoBribery },
  actions: { setNegotiationIsFailed, setBriberyIsFailed },
});