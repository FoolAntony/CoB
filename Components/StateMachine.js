import { createMachine, assign, actions } from "xstate";

// Action to increment the context amount
const addPerson = assign({
  amount: (context, event) => context.amount + 1,
});

// Guard to check if the team is full
function teamIsFull(context, event) {
  return context.amount >= 6;
}

export const teamMachine = createMachine(
  {
    id: "team",
    initial: "empty",
    context: {
      amount: 0,
    },
    states: {
      empty: {
        on: {
          ADD: {
            target: "adding",
            actions: "addPerson",
          },
        },
      },
      adding: {
        always: {
          target: "full",
          cond: "teamIsFull",
        },
        on: {
          ADD: {
            target: "adding",
            actions: "addPerson",
          },
        },
      },
      full: {
        type: "final",
      },
    },
        predictableActionArguments: true
  },
  {
    guards: { teamIsFull },
    actions: { addPerson }
  }
);
