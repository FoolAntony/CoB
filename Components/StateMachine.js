import { createMachine, assign, actions } from "xstate";

// Action to increment the context amount
const addPerson = assign({
  amount: (context, event) => context.amount + 1,
});

// Guard to check if the team is full
function isHeroesFull(context, event) {
  return context.amount === 3;
}

function isFollowersFull(context, event) {
  return context.amount === 6;
}

const addNewWeapon = assign({
  weapons: (context, event) => context.weapons + 1
})

const restoreWeapons = assign({
  weapons: (context, event) => context.weapons = 0
})

function isWeaponsFull(context, event) {
  return context.weapons === 2
}



export const teamMachine = createMachine(
  {
    id: "team",
    initial: "empty",
    context: {
      amount: 0,
      weapons:0
    },
    states: {
      empty: {
        on: {
          ADD: {
            target: "addHeroes",
            actions: "addPerson",
          },
        },
      },
      addHeroes: {
        always: {
          target: "addFollowers",
          cond: "isHeroesFull",
        },
        on: {
          ADD: {
            target: "addHeroes",
            actions: "addPerson",
          },
        },
      },
      addFollowers: {
        always: {
          target: "full",
          cond: "isFollowersFull",
        },
        on: {
          NEXT: {
            target: "addName",
            actions: "restoreWeapons"
          },
        },
      },
      addName: {
        on: {
          NEXT: "addWeapon"
        }
      },
      addWeapon: {
        always: {
          target: "addMana",
          cond: "isWeaponsFull"
        },
        on: {
          ADD: {
            target: "addWeapon",
            actions: "addNewWeapon"
          }
        }
      },
      addMana: {
        on: {
          NEXT:{
            target: "addFollowers",
            actions: "addPerson"
          }
        }
      },
      full: {
        type: "final",
      },
    },
    predictableActionArguments:true
  },
  {
    guards: { isHeroesFull, isFollowersFull, isWeaponsFull },
    actions: { addPerson, addNewWeapon, restoreWeapons },
  }
);


