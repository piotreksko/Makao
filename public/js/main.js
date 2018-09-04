let gameState, player, cpuPlayer, deck, pile, statsCounter;

const cardTypes = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king",
  "ace"
];
const cardWeights = ["clubs", "diamonds", "spades", "hearts"];
const ref = firebase.database().ref("/winCounter");

/*--- Classes ---*/

class StatsCounter {
  constructor() {
    this.totalPlayerWinCount = 0;
    this.totalComputerWinCount = 0;
    this.totalMovesCount = 0;
    this.macaoCallCount = 0;
  }
  getGlobalCounters() {
    ref.on("value", snapshot => {
      this.totalComputerWinCount = snapshot.val().computerWinCount;
      this.totalPlayerWinCount = snapshot.val().playerWinCount;

      //Only overwrite at the game start - dont overwrite from realtime database updates
      if (this.totalMovesCount == 0) {
        this.totalMovesCount = snapshot.val().totalMovesCount;
      }
      if (this.macaoCallCount == 0) {
        this.macaoCallCount = snapshot.val().macaoCallCount;
      }
      this.setTotalCounters();
    });
  }
  setTotalCounters() {
    document.getElementById(
      "total-player-win-counter"
    ).textContent = this.totalPlayerWinCount;
    document.getElementById(
      "total-cpu-win-counter"
    ).textContent = this.totalComputerWinCount;
    document.getElementById(
      "total-moves-counter"
    ).textContent = this.totalMovesCount;
    document.getElementById(
      "macao-call-counter"
    ).textContent = this.macaoCallCount;
    $("#total-player-win-counter")
      .animate({ fontSize: "10px" }, 200)
      .animate({ fontSize: "14px" }, 200);
    $("#total-cpu-win-counter")
      .animate({ fontSize: "10px" }, 200)
      .animate({ fontSize: "14px" }, 200);
    $("#total-moves-counter")
      .animate({ fontSize: "10px" }, 200)
      .animate({ fontSize: "14px" }, 200);
    $("#macao-call-counter")
      .animate({ fontSize: "10px" }, 200)
      .animate({ fontSize: "14px" }, 200);
  }
}

class GameState {
  constructor() {}
  initState() {
    this.nextTurn = Math.round(Math.random() * 1);
    this.chosenWeight = 0;
    this.chosenType = 0;
    this.jackActive = 0;
    this.aceActive = 0;
    this.cardsToTake = 1;
    this.waitTurn = 0;
    this.battleCardActive = 0;
    this.changeDemand = 0;
    this.winner = 0;
    this.gameOver = false;
    this.movesCount = -1;
  }
  //Check if a battle card was used - 2, 3, king of hearts or king of spades
  checkCardsToTake() {
    this.cardsToTake > 1
      ? (this.battleCardActive = 1)
      : (this.battleCardActive = 0);
  }
  checkMacao(whoToCheck) {
    const macaoWindow = $("#macao");

    if (whoToCheck == "Player" && player.cards.length == 1 && !player.wait) {
      showMacao();
    }
    if (
      whoToCheck == "Computer" &&
      cpuPlayer.cards.length == 1 &&
      !cpuPlayer.wait
    ) {
      cpuPlayer.cards.length == 1 && player.cards.length == 1
        ? showMacao(true)
        : showMacao();
    }
    function showMacao(isDouble) {
      while (macaoWindow.children().length) {
        macaoWindow
          .children()
          .last()
          .remove();
      }
      if (isDouble) {
        macaoWindow.stop();
        macaoWindow.append(
          `<h4 style="color: white; margin: 10px; padding: 10px">Player: Macao!</h4><h4 style="color: white; margin: 10px; padding: 10px">Computer: Macao!</h4>`
        );
        macaoCallCount += 2;
        ref.child("macaoCallCount").set(macaoCallCount);
        document.getElementById(
          "macao-call-counter"
        ).textContent = macaoCallCount;
        $("#macao-call-counter")
          .animate({ fontSize: "10px" }, 200)
          .animate({ fontSize: "14px" }, 200);
      } else {
        macaoWindow.append(
          `<h4 style="color: white; margin: 10px; padding: 10px">${whoToCheck}: Macao!</h4>`
        );
        macaoCallCount += 1;
        ref.child("macaoCallCount").set(macaoCallCount);
        document.getElementById(
          "macao-call-counter"
        ).textContent = macaoCallCount;
        $("#macao-call-counter")
          .animate({ fontSize: "10px" }, 200)
          .animate({ fontSize: "14px" }, 200);
      }
      macaoWindow.fadeIn(600).fadeOut(900);
    }
  }
  checkWin() {
    if (!cpuPlayer.cards.length) {
      gameState.winner = true;
      openWinnerBox("cpu");
      $("#waitTurn").addClass("invisible");
    }
    if (!player.cards.length) {
      throwConfetti();
      gameState.winner = true;
      openWinnerBox("player");
      $("#waitTurn").addClass("invisible");
    }
  }
  nobodyIsWaiting() {
    return !cpuPlayer.wait && !player.wait;
  }
}

class Deck {
  constructor() {
    this.cards = [];
  }
  init() {
    function card(type, weight) {
      this.type = type;
      this.weight = weight;
    }

    function CreateDeck() {
      cardWeights.forEach(function(weight) {
        cardTypes.forEach(function(type) {
          deck.cards.push(new card(type, weight));
        });
      });
    }

    let getRandomInt = function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    CreateDeck();
    shuffle(this.cards);
    assignCards();
    //Give out cards
    function assignCards(assignedCards) {
      let assignedCards1 = deck.cards.splice(0, 5);
      let assignedCards2 = deck.cards.splice(0, 5);

      //Always start game with a neutral card
      for (let i = 0; i < deck.cards.length; i++) {
        switch (deck.cards[i].type) {
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
          case "10":
          case "queen":
            pile.cards = deck.cards.splice(i, 1);
        }
        if (pile.cards[0]) {
          break;
        }
      }

      player.cards = sortCards(assignedCards1);
      cpuPlayer.cards = assignedCards2;
    }
    return deck;
  }
  style() {
    !player.availableCards.length &&
    !player.possibleCards.length &&
    !player.selectedCards.length &&
    !player.wait
      ? $("#deck").addClass("available")
      : $("#deck").addClass("no-cards");
    if (player.wait) {
      $("#deck").removeClass("no-cards");
      $("#deck").removeClass("available");
    }
  }
}

class Pile {
  constructor() {
    this.cards = [];
    this.lastCard = 0;
  }
  render() {
    if (this.cards.length) {
      $("#pile").empty();

      const numberOnPile = this.cards.length - 1;
      const fileName =
        this.cards[numberOnPile].type +
        "_of_" +
        this.cards[numberOnPile].weight;
      const url =
        "https://res.cloudinary.com/bosmanone/image/upload/v1477397924/cards/" +
        fileName +
        ".png";
      const lastCardImg =
        "<div class='card " +
        "'style='background-image: url(" +
        url +
        ");'></div>";
      $("#pile").append(lastCardImg);
    } else {
      return;
    }
  }
  updateLastCard() {
    this.lastCard = this.cards[this.cards.length - 1];
  }
}

class Player {
  constructor() {
    this.cards = [];
    this.wait = 0;
    this.availableCards = [];
    this.possibleCards = [];
    this.selectedCards = [];
  }
  render() {
    $("#playerCards").empty();
    this.cards = sortCards(this.cards);
    this.cards.forEach(function(card, i) {
      const fileName = card.type + "_of_" + card.weight;
      const url =
        "https://res.cloudinary.com/bosmanone/image/upload/v1477397924/cards/" +
        fileName +
        ".png";
      const cardDiv =
        "<div " +
        "id='" +
        i +
        "' class='card " +
        fileName +
        " cardsInHand' onclick='pickCard(this)' style='background-image: url(" +
        url +
        ");" +
        ");'></div>";
      $("#playerCards").append(cardDiv);
    });
  }
  checkAvailableCards() {
    this.availableCards = []; //Clear available cards
    this.possibleCards = []; //Clear possible cards
    pile.updateLastCard();
    if (pile.lastCard.type == "ace") {
      const lastCardAfterAce = {
        type: "ace",
        weight: gameState.chosenWeight
      };
      pile.lastCard = Object.assign({}, lastCardAfterAce);
    }

    this.clearClasses();

    gameState.aceActive = 0;

    //No cards have been chosen
    if (this.selectedCards.length == 0) {
      player.cards.forEach((card, idx) => {
        //Battle card is active - the same cardtype available + 2, 3, kings of given weight
        if (
          !gameState.jackActive &&
          !gameState.waitTurn &&
          !this.wait &&
          gameState.battleCardActive
        ) {
          //Card of same type is available
          if (
            card.type == pile.lastCard.type ||
            //Cards of same weight + it's a 2 or 3
            (card.weight == pile.lastCard.weight &&
              (card.type == "2" || card.type == "3")) ||
            //Available kings - spades and hearts
            (card.type == "king" &&
              card.weight == pile.lastCard.weight &&
              (card.weight == "spades" || card.weight == "hearts")) ||
            //If last card was a king, make king of diamond and clubs available
            (card == pile.lastCard.type &&
              (card.weight == "diamond" || card.weight == "clubs"))
          ) {
            this.availableCards.push(this.cards[idx]);
          }
        }

        //Make 4 available if it was used
        if (
          card.type == "4" &&
          !gameState.jackActive &&
          gameState.waitTurn &&
          !gameState.battleCardActive
        ) {
          this.availableCards.push(this.cards[idx]);
        }

        //Jack demand is active
        if (
          card.type == gameState.chosenType &&
          gameState.jackActive &&
          !gameState.waitTurn &&
          !gameState.battleCardActive
        ) {
          this.availableCards.push(this.cards[idx]);
        }

        //Make jack available if it was used
        if (
          card.type == "jack" &&
          gameState.jackActive &&
          !gameState.waitTurn &&
          !gameState.battleCardActive &&
          pile.lastCard.type == "jack"
        ) {
          this.availableCards.push(this.cards[idx]);
        }

        //No special conditions
        if (
          card.type == pile.lastCard.type &&
          !gameState.jackActive &&
          !gameState.waitTurn &&
          !gameState.playerWait &&
          !gameState.battleCardActive
        ) {
          this.availableCards.push(this.cards[idx]);
        }
        if (
          card.weight == pile.lastCard.weight &&
          card.type !== pile.lastCard.type &&
          !gameState.jackActive &&
          !gameState.waitTurn &&
          !this.wait &&
          !gameState.battleCardActive
        ) {
          this.availableCards.push(this.cards[idx]);
        }
      });
    } else if (this.selectedCards.length > 0) {
      let chosenCard = this.selectedCards[0];
      let topCard = this.selectedCards[this.selectedCards.length - 1];

      //Style top card
      this.cards.forEach(function(card, i) {
        if (topCard.type == card.type && topCard.weight == card.weight) {
          $("#playerCards")
            .find("#" + i)
            .addClass("topCard");
        }
      });

      //Adjust available cards according to chosen card

      this.cards.forEach(function(card, idx) {
        //Get available cards with the same type as chosen card
        if (card.type == gameState.chosenCard.type) {
          this.availableCards.push(this.cards[idx]);
        }

        //If type or weight is the same last card and it does not have .available class and jack is not active
        if (
          card.type == pile.lastCard.type ||
          (this.cards[idx].weight == pile.lastCard.weight &&
            !gameState.battleCardActive &&
            !gameState.jackActive &&
            (card.type !== chosenCard.type &&
              card.weight !== chosenCard.weight))
        ) {
          //And is not in availableCards yet
          this.possibleCards.push(this.cards[idx]);
        }

        //Make jack possible if it was used
        if (
          card.type == "jack" &&
          gameState.jackActive &&
          !gameState.waitTurn &&
          !this.wait
        ) {
          this.possibleCards.push(playerCards[idx]);
        }
        //Make 4 possible if it was used
        if (
          card.type == "4" &&
          !gameState.jackActive &&
          gameState.waitTurn &&
          !this.wait
        ) {
          this.availableCards.push(this.cards[idx]);
        }
      });
    }
    this.styleAvailableCards();
    this.stylePossibleCards();
    this.styleSelectedCards();
    deck.style();
  }
  styleAvailableCards() {
    this.availableCards.forEach(availableCard => {
      player.cards.forEach((playerCard, idx) => {
        if (
          availableCard.type == playerCard.type &&
          availableCard.weight == playerCard.weight
        ) {
          $("#playerCards")
            .find("#" + idx)
            .addClass("available");
        }
      });
    });
  }
  stylePossibleCards() {
    this.possibleCards.forEach((card, idx) => {
      const cardToStyle = $("#playerCards").find("#" + idx);
      if (!cardToStyle.hasClass("available")) {
        cardToStyle.addClass("possible");
      }
    });
  }

  styleSelectedCards() {
    this.selectedCards.forEach(selectedCard => {
      playerCards.forEach((playerCard, idx) => {
        if (
          selectedCard.type == playerCard.type &&
          selectedCard.weight == playerCard.weight
        ) {
          $("#playerCards")
            .find("#" + idx)
            .addClass("selected");
        }
      });
    });
  }
  clearClasses() {
    //Clear classes
    $("#playerCards")
      .children()
      .removeClass("available possible selected topCard removed");
    $("#deck").removeClass("no-cards");
    //If 4 was used make wait button visible
    if (gameState.waitTurn && gameState.nextTurn == 0) {
      $("#waitTurn").removeClass("invisible");
    }
    if (this.wait == 0) {
      $("#waitTurn").addClass("invisible");
      $("#confirmCards").removeClass("invisible");
      $("#resetCards").removeClass("invisible");
    } else {
      $("#waitTurn").removeClass("invisible");
      $("#confirmCards").addClass("invisible");
      $("#resetCards").addClass("invisible");
    }
    if (gameState.waitTurn) $("#waitTurn").removeClass("invisible");
  }
}

class CpuPlayer {
  constructor() {
    this.cards = [];
    this.wait = 0;
    this.availableCards = [];
  }
  //CPU move
  move() {
    this.cards = sortCards(this.cards);

    //Do nothing if its not CPU`s turn
    if (!gameState.nextTurn) return;

    let cardsToUse = [];
    this.availableCards = [];

    pile.lastCard.type == "ace"
      ? (this.availableCards = this.cards.filter(
          card => card.weight == chosenWeight || card.type == pile.lastCard.type
        ))
      : (this.availableCards = this.cards.filter(
          card =>
            card.weight == lastCard.weight || card.type == pile.lastCard.type
        ));

    if (gameState.jackActive) {
      this.availableCards = this.cards.filter(
        card => "jack" == card.type || card.type == gameState.chosenType
      );
    }

    //IF CPU does have available cards
    if (this.availableCards.length) {
      //console.log("cpu had available cards");

      //Map all cards to get information about cards of same type & weight
      let cpuPossibleMoves = this.availableCards.map(card => {
        return {
          type: card.type,
          weight: card.weight,
          sameTypeAmount: (function() {
            let amount = 0;
            this.cards.forEach(function(e) {
              if (e.type === card.type) {
                amount += 1;
              }
            });
            return amount - 1;
          })(),
          sameWeightAmount: (function() {
            let moves = 0;
            this.cards.forEach(function(e) {
              if (e.weight === card.weight) {
                moves += 1;
              }
            });
            return moves - 1;
          })()
        };
      });

      let neutralCards = cpuPossibleMoves.filter(
        card =>
          card.type == "5" ||
          card.type == "6" ||
          card.type == "7" ||
          card.type == "8" ||
          card.type == "9" ||
          card.type == "10" ||
          card.type == "queen" ||
          (card.type == "king" && card.weight == "diamonds") ||
          (card.type == "king" && card.weight == "clubs")
      );

      let battleCards = cpuPossibleMoves.filter(
        card =>
          card.type == "2" ||
          card.type == "3" ||
          (card.type == "king" && card.weight == "hearts") ||
          (card.type == "king" && card.weight == "spades")
      );

      let fours = cpuPossibleMoves.filter(card => card.type == "4");

      let jacks = cpuPossibleMoves.filter(card => card.type == "jack");

      let aces = cpuPossibleMoves.filter(card => card.type == "ace");

      let kings = cpuPossibleMoves.filter(
        card =>
          (card.type == "king" && card.weight == "diamonds") ||
          (card.type == "king" && card.weight == "clubs")
      );

      //Use jack if one neutral card is available
      if (
        jacks.length &&
        !gameState.battleCardActive &&
        !this.wait &&
        neutralCards.length === 1
      ) {
        cardsToUse = jacks;
      }

      let cardsDifference;
      this.cards.length - player.cards.length > 0
        ? (cardsDifference = this.cards.length - player.cards.length)
        : (cardsDifference = 0);
      if (this.cards.length == playerCards.length) {
        cardsDifference = 1;
      }

      let neutralChance = neutralValue();
      let battleChance = battleValue();
      let foursChance = foursValue();
      let jacksChance = jacksValue();
      let acesChance = acesValue();
      let kingsChance = kingsValue();

      function neutralValue() {
        if (
          neutralCards.length === 0 ||
          gameState.battleCardActive ||
          gameState.waitTurn ||
          this.wait
        ) {
          return 0;
        } else {
          let weight = 15;
          let value = neutralCards.length * weight;
          return value;
        }
      }
      function battleValue() {
        if (
          battleCards.length === 0 ||
          gameState.waitTurn ||
          this.wait ||
          gameState.jackActive
        ) {
          return 0;
        } else {
          let weight = 6;
          let value =
            battleCards.length * weight +
            (Math.pow(cardsDifference, 2) / 10) * weight;
          return value;
        }
      }
      function foursValue() {
        if (
          fours.length === 0 ||
          gameState.battleCardActive ||
          gameState.jackActive ||
          this.wait
        ) {
          return 0;
        } else {
          let weight = 1;
          let foursOnPile = pile.filter(x => x.type === "4").length;
          let foursLeft = checkFours();

          function checkFours() {
            if (4 - foursOnPile - fours.length === 0) {
              weight = 500;
            } else if (4 - foursOnPile - fours.length === 1) {
              weight = 20;
            } else if (4 - foursOnPile - fours.length === 2) {
              weight = 5;
            } else {
              weight = 2;
            }
          }

          let value = (weight * deck.cards.length) / player.cards.length;
          return value;
        }
      }
      function jacksValue() {
        if (
          jacks.length === 0 ||
          gameState.battleCardActive ||
          gameState.waitTurn ||
          this.Wait
        ) {
          return 0;
        } else {
          let jacksWeight = 24;
          let jackNeutralRatio = 1;
          if (neutralCards.length) {
            jackNeutralRatio = jacksWeight / neutralCards.length;
          }
          let value =
            jacks.length * jackNeutralRatio +
            (cardsDifference / jacksWeight) * 3 +
            (jacksWeight / player.cards.length) * 2;
          return value;
        }
      }
      function acesValue() {
        if (
          aces.length === 0 ||
          gameState.battleCardActive ||
          gameState.waitTurn ||
          this.wait ||
          gameState.jackActive
        ) {
          return 0;
        } else {
          let weight = 3;
          let value =
            aces.length * weight +
            (this.cards.length / this.availableCards.length) * weight;
          return value;
        }
      }
      function kingsValue() {
        if (
          kings.length &&
          ((pile.lastCard.type == "king" && pile.lastCard.weight == "hearts") ||
            (pile.lastCard.type == "king" && pile.lastCard.weight == "spades"))
        ) {
          return 15;
        } else {
          return 0;
        }
      }
      //For AI improvement
      //console.log(neutralChance);
      //console.log(battleChance);
      //console.log(foursChance);
      //console.log(jacksChance);
      //console.log(acesChance);

      let min = 0;
      let max =
        neutralChance +
        battleChance +
        foursChance +
        jacksChance +
        acesChance +
        kingsChance;
      let previousUpperRange = 0;

      let neutralRange = calculateRange(neutralChance);
      let battleRange = calculateRange(battleChance);
      let foursRange = calculateRange(foursChance);
      let jacksRange = calculateRange(jacksChance);
      let acesRange = calculateRange(acesChance);
      let kingsRange = calculateRange(kingsChance);

      function calculateRange(rangeWidth) {
        previousUpperRange = previousUpperRange + rangeWidth;
        if (rangeWidth) {
          previousUpperRange += rangeWidth;
          return previousUpperRange;
        } else {
          return 0;
        }
      }

      let rand = function(min, max) {
        return Math.random() * (max - min) + min;
      };

      let randomNumber = rand(min, max);
      let weightPicked;
      if (randomNumber < neutralRange) {
        cardsToUse = neutralCards;
        weightPicked = 1;
      } else if (randomNumber < battleRange) {
        cardsToUse = battleCards;
        weightPicked = 2;
      } else if (randomNumber < foursRange) {
        cardsToUse = fours;
        weightPicked = 3;
      } else if (randomNumber < jacksRange) {
        cardsToUse = jacks;
        weightPicked = 4;
      } else if (randomNumber < acesRange) {
        cardsToUse = aces;
        weightPicked = 5;
      } else if (randomNumber < kingsRange) {
        cardsToUse = kings;
        weightPicked = 6;
      }

      if (jacks.length && neutralCards.length === 1) {
        cardsToUse = jacks;
        weightPicked = 4;
      }

      if (jackActive && weightPicked !== 4) {
        jackActive -= 1;
      }

      if (randomNumber == 0) {
        this.noCardsToUse();
      } else {
        let mostMoves = cardsToUse.reduce(
          (prev, curr) =>
            prev.possibleCardsAfter < curr.possibleCardsAfter ? prev : curr
        );

        let cpuSelectedCards = [];

        if (!mostMoves.sameTypeAmount) {
          this.availableCards = [];
          cpuSelectedCards.push(mostMoves);
        } else {
          cpuSelectedCards = cpuCards.filter(e => e.type == mostMoves.type);

          //While the first selected card does not match the card on pile - move it to the end of array
          if (
            pile.lastCard.type !== cpuSelectedCards[0].type &&
            pile.lastCard.type !== "ace" &&
            !gameState.jackActive
          ) {
            while (cpuSelectedCards[0].weight !== pile.lastCard.weight) {
              const firstCard = cpuSelectedCards.shift();
              cpuSelectedCards.push(firstCard);
            }
          }
          if (
            gameState.chosenType !== cpuSelectedCards[0].type &&
            pile.lastCard.type == "ace" &&
            !gameState.jackActive
          ) {
            while (cpuSelectedCards[0].weight !== chosenWeight) {
              const firstCard = cpuSelectedCards.shift();
              cpuSelectedCards.push(firstCard);
            }
          }
        }
        //console.log(cpuSelectedCards);
        cpuSelectedCards.forEach(card => {
          let notCheckedYet = 1;
          switch (card.type) {
            case "2":
              if (gameState.nobodyIsWaiting()) gameState.cardsToTake += 2;
              break;
            case "3":
              if (gameState.nobodyIsWaiting()) gameState.cardsToTake += 3;
              break;
            case "4":
              waitTurn += 1;
              break;
            case "jack":
              if (neutralCards.length) {
                gameState.chosenType = neutralCards.reduce(
                  (prev, curr) =>
                    prev.sameTypeAmount < curr.sameTypeAmount ? prev : curr
                ).type;
                if (gameState.chosenType.type == "king") {
                  gameState.chosenType = 0;
                }
                //console.log("chosenType");
                //console.log(chosenType);
              }
              gameState.chosenType
                ? (gameState.jackActive = 2)
                : (gameState.jackActive = 0);
              break;
            case "ace":
              if (notCheckedYet) {
                let cpuCardsWithoutMostMoves = [...this.cards];
                cpuCardsWithoutMostMoves.splice(
                  cpuCardsWithoutMostMoves.indexOf(mostMoves),
                  1
                );
                if (this.ards.length > 1)
                  gameState.chosenWeight = cpuCardsWithoutMostMoves.reduce(
                    (prev, curr) =>
                      prev.sameWeightAmount < curr.sameWeightAmount
                        ? prev
                        : curr
                  ).weight;
                //console.log("chosenWeight");
                //console.log(chosenWeight);
              }
              break;
            case "king":
              if (
                card.weight === "hearts" ||
                (card.weight === "spades" && gameState.nobodyIsWaiting())
              ) {
                gameState.cardsToTake += 5;
                break;
              }

              //Kings of clubs and diamonds nullify amount of cards to be taken
              else {
                gameState.cardsToTake = 1;
                break;
              }
          }

          let indexInCpuCards = cpuCards.findIndex(
            x => x.type == card.type && x.weight == card.weight
          );
          this.cards.splice(indexInCpuCards, 1);
          pile.cards.push(card);
        });
        this.availableCards = [];
      }
    } else {
      this.noCardsToUse();
    }
    nextTurn = 0;
  }
  noCardsToUse() {
    //console.log("no cards available");
    //Take cards from pile and shuffle the deck if there is one card left

    if (gameState.jackActive) {
      gameState.jackActive -= 1;
    }

    //Do nothing if last card was 4
    if (gameState.waitTurn > 0) {
      this.wait = gameState.waitTurn - 1;
      gameState.waitTurn = 0;
      return;
    } else if (this.wait) {
      this.wait -= 1;
    } else {
      //Repeat the loop as many times as there are cards to be taken
      if (gameState.cardsToTake > 1) {
        //Shuffle the deck if there are not enough cards remaining in the deck
        if (gameState.cardsToTake >= deck.cards.length) {
          let cardsForShuffle = pile.cards;
          cardsForShuffle.pop();
          let shuffledCards = shuffle(cardsForShuffle);
          deck.cards = deck.cards.concat(shuffledCards);
          pile.cards.slice(-1);
        }
        for (let i = 1; i < gameState.cardsToTake; i++) {
          cardFromDeck = deck.cards[0];
          deck.cards.shift();
          this.cards.push(cardFromDeck);
        }
      }

      //Take one card - default amount
      else {
        if (deck.cards.length === 1) {
          let cardsForShuffle = pile.cards;
          cardsForShuffle.pop;
          let shuffledCards = shuffle(cardsForShuffle);
          deck.cards = deck.cards.concat(shuffledCards);
          pile.cards.splice(0, deck.cards.length - 2);
        }
        cardFromDeck = deck.cards[0];
        deck.cards.shift();
        this.cards.push(cardFromDeck);
      }
      cardsToTake = 1;
    }
  }
  /*Show CPU cards
  
    render() {
    $('#cpuCards').empty();
    this.cards.forEach(function (card, i) {
        const fileName = card.type + "_of_" + card.weight;
        const url = 'https://res.cloudinary.com/bosmanone/image/upload/v1477397924/cards/' + fileName + '.png';
        const cardDiv = "<div " + "id='" + i + "' class='card " + fileName + " cardsInHand' onclick='pickCard(this)' style='background-image: url(" + url + ");" + ");'></div>";
        $('#cpuCards').append(cardDiv);
    });
};
*/
  render() {
    $("#cpuCards").empty();
    this.cards.forEach(function(card, i) {
      const url = "https://bfa.github.io/solitaire-js/img/card_back_bg.png";
      const cardDiv =
        "<div " +
        "id='" +
        i +
        "' class='card cardsInHand" +
        "'style='background-image: url(" +
        url +
        ");" +
        ");'></div>";
      $("#cpuCards").append(cardDiv);
    });
  }
}

//Init game
function initGame() {
  statsCounter = new StatsCounter();
  gameState = new GameState();
  player = new Player();
  cpuPlayer = new CpuPlayer();
  deck = new Deck();
  pile = new Pile();

  deck.init();
  showWhoStarts();
}

initGame();
statsCounter.getGlobalCounters();

function showWhoStarts() {
  player.render();
  pile.render();
  cpuPlayer.render();
  const whoStartsWindow = $("#who-starts");
  while (whoStartsWindow.children().length) {
    whoStartsWindow
      .children()
      .last()
      .remove();
  }
  gameState.nextTurn
    ? whoStartsWindow.append(
        `<h4 style="color: white; margin: 10px; padding: 10px">Computer goes first</h4>`
      )
    : whoStartsWindow.append(
        `<h4 style="color: white; margin: 10px; padding: 10px">You go first</h4>`
      );
  whoStartsWindow.fadeIn(700).fadeOut(1400);
  setTimeout(renderCards, 1500);
}

function shuffle(cards) {
  let currentIndex = cards.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }

  return cards;
}

function sortCards(cards) {
  return cards.sort(function(a, b) {
    const compString =
      "'2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king' , 'ace'";
    return compString.indexOf(a.type) - compString.indexOf(b.type);
  });
}

function renderCards() {
  gameState.checkMacao("Player");
  statsCounter.movesCount += 1;
  statsCounter.totalMovesCount += 1;
  pile.render();
  gameState.checkCardsToTake();
  player.render();
  if (!gameState.gameOver) {
    gameState.checkWin();
  }
  if (!gameState.winner) {
    cpuPlayer.move();
  }
  if (!gameState.gameOver) {
    gameState.checkWin();
  }
  gameState.checkMacao("Computer");
  pile.render();
  cpuPlayer.render();
  updateCardsCounter();
  gameState.checkCardsToTake();
  if (!gameState.winner) {
    player.checkAvailableCards();
  }
}

function updateCardsCounter() {
  pile.updateLastCard();
  $("#deckCounter").empty();
  $("#pileCounter").empty();

  while ($(".message").children().length > 1) {
    $(".message")
      .children()
      .last()
      .remove();
    $(".message").fadeOut(200);
  }
  let realCardsToTake = gameState.cardsToTake - 1;
  let turnsToWait;

  cpuPlayer.wait > 1 || player.wait > 1
    ? (turnsToWait = "turns")
    : (turnsToWait = "turn");
  gameState.cardsToTake > 1
    ? $(".message").append(`<span>Cards to take: ${realCardsToTake}</span>`)
    : null;
  gameState.waitTurn
    ? $(".message").append(`<span>Turns to wait: ${gameState.waitTurn} </span>`)
    : null;
  cpuPlayer.wait
    ? $(".message").append(
        `<span>CPU has to wait ${cpu.wait} ${turnsToWait}</span>`
      )
    : null;
  gameState.playerWait
    ? $(".message").append(
        `<span>You have to wait ${player.wait} ${turnsToWait}</span>`
      )
    : null;
  gameState.jackActive
    ? $(".message").append(
        `<span>Demanded card: ${gameState.chosenType}</span>`
      )
    : null;
  pile.lastCard.type == "ace"
    ? $(".message").append(
        `<span>Computer changed color to ${gameState.chosenWeight}</span>`
      )
    : null;
  pile.lastCard.type == "jack" && !gameState.jackActive
    ? $(".message").append(`<span>No demand</span>`)
    : null;
  $(".message").children().length > 1
    ? $(".message")
        .animate({ fontSize: "18px" }, 200)
        .animate({ fontSize: "16px" }, 200)
        .css("display", "inline-block")
    : null;
  $("#moves-count").html(statsCounter.movesCount);
  $("#total-moves-counter").html(statsCounter.totalMovesCount);
}

$("#restart-game").click(function() {
  updateCardsCounter();
  initGame();
});

//Open rules window
$("#open-rules").click(function() {
  $("#rules").fadeIn(600);
});

$("#close-rules").click(function() {
  $("#rules").fadeOut(600);
});

$("#open-rules").attr("title", "Macao rules");
$("#restart-game").attr("title", "Restart game");

//Confirm selected cards
$("#confirmCards").click(function() {
  //Do nothing if player did not pick cards
  if (!player.selectedCards.length) {
    return;
  }

  //Battle cards - add cards to take accordingly
  player.selectedCards.forEach(card => {
    switch (card.type) {
      case "2":
        if (gameState.nobodyIsWaiting()) gameState.cardsToTake += 2;
        break;
      case "3":
        if (gameState.nobodyIsWaiting()) gameState.cardsToTake += 3;
        break;
      case "4":
        if (!cpuWait) {
          gameState.waitTurn += 1;
        }
        break;
      case "jack":
        gameState.jackActive = 3;
        gameState.changeDemand = 1;
        break;
      case "ace":
        gameState.aceActive = 1;
        break;
      case "king":
        if (
          card.weight === "hearts" ||
          (card.weight === "spades" && gameState.nobodyIsWaiting())
        ) {
          gameState.cardsToTake += 5;
          break;
        }

        //Kings of clubs and diamonds nullify amount of cards to be taken
        else {
          gameState.cardsToTake = 0;
          break;
        }
    }

    //Remove cards from playerCards
    let cardIndexInPlayerCards = player.cards.indexOf(card);
    player.cards.splice(cardIndexInPlayerCards, 1);
  });

  pile.cards = pile.cards.concat(player.selectedCards);

  //Open a dialog box if ace or jack was used
  if (gameState.aceActive) {
    openBox("ace");
  }
  if (gameState.jackActive && gameState.changeDemand) {
    gameState.changeDemand = 0;
    openBox("jack");
  }
  player.selectedCards = [];
  pile.updateLastCard();

  gameState.nextTurn = 1;

  //Decrease jack counter
  if (gameState.jackActive) {
    gameState.jackActive -= 1;
  }

  if (!gameState.aceActive && !gameState.jackActive) {
    gameState.renderCards();
  }

  if (gameState.jackActive && pile.lastCard.type !== "jack") {
    renderCards();
  }
});

//Reset selectedcards
$("#resetCards").click(function() {
  selectedCards = [];
  renderCards();
});

//Wait one turn
$("#waitTurn").click(function() {
  if (playerWait) playerWait -= 1;
  else {
    playerWait = waitTurn - 1;
    waitTurn = 0;
  }
  nextTurn = 1;
  renderCards();
});

//Take cards from deck
$("#deck").click(function(cardFromDeck) {
  player.selectedCards = [];
  //Do nothing if last card was 4
  if (gameState.waitTurn || gameState.playerWait) {
    return;
  } else {
    //Repeat the loop as many times as there are cards to be taken
    if (gameState.cardsToTake > 1) {
      //Shuffle the deck if there are not enough cards remaining in the deck
      if (gameState.cardsToTake >= deck.cards.length) {
        let cardsForShuffle = pile.cards;
        cardsForShuffle.pop();
        let shuffledCards = shuffle(cardsForShuffle);
        deck.cards = deck.cards.concat(shuffledCards);
        pile.cards.slice(-1);
      }
      for (let i = 1; i < gameState.cardsToTake; i++) {
        cardFromDeck = deck.cards[0];
        deck.cards.shift();
        player.cards.push(cardFromDeck);
      }
    }

    //Take one card - default amount
    else {
      if (deck.cards.length === 1) {
        let cardsForShuffle = pile.cards;
        cardsForShuffle.pop;
        let shuffledCards = shuffle(cardsForShuffle);
        deck = deck.concat(shuffledCards);
        pile.cards.splice(0, deck.cards.length - 2);
      }

      cardFromDeck = deck.cards[0];
      deck.cards.shift();
      player.cards.push(cardFromDeck);
    }
    gameState.cardsToTake = 1;
    gameState.nextTurn = 1;
    renderCards();
  }
});

//Remove mask - ace and jack popup
function removeMask() {
  $("#mask , .suit-popup").fadeOut(300, function() {
    $("#mask").remove();
  });
}

//Ace or jack was chosen
$("#hearts").click(function() {
  gameState.chosenWeight = "hearts";
  removeAndRender();
});
$("#diamonds").click(function() {
  gameState.chosenWeight = "diamonds";
  removeAndRender();
});
$("#clubs").click(function() {
  gameState.chosenWeight = "clubs";
  removeAndRender();
});
$("#spades").click(function() {
  gameState.chosenWeight = "spades";
  removeAndRender();
});
$("#demand5").click(function() {
  gameState.chosenType = "5";
  removeAndRender();
});
$("#demand6").click(function() {
  gameState.chosenType = "6";
  removeAndRender();
});
$("#demand7").click(function() {
  gameState.chosenType = "7";
  removeAndRender();
});
$("#demand8").click(function() {
  gameState.chosenType = "8";
  removeAndRender();
});
$("#demand9").click(function() {
  gameState.chosenType = "9";
  removeAndRender();
});
$("#demand10").click(function() {
  gameState.chosenType = "10";
  removeAndRender();
});
$("#demandQ").click(function() {
  gameState.chosenType = "queen";
  removeAndRender();
});
$("#demandNone").click(function() {
  gameState.jackActive = 0;
  removeAndRender();
});

function removeAndRender() {
  removeMask();
  renderCards();
}

function restartGame() {
  $("#mask , .suit-popup").fadeOut(300, function() {
    $("#mask").remove();
  });
  removeConfetti();
  updateCardsCounter();
  initGame();
}

function openBox(boxType) {
  // Getting the variable
  let box;
  boxType === "jack" ? (box = $("#jack-box")) : (box = $("#ace-box"));

  //Fade in the Popup and add close button
  $(box).fadeIn(300);

  //Set the center alignment padding + border
  let popMargTop = ($(box).height() + 24) / 2;
  let popMargLeft = ($(box).width() + 24) / 2;

  $(box).css({
    "margin-top": -popMargTop,
    "margin-left": -popMargLeft
  });

  addMask();
}

//Click on your own card
const pickCard = function pickCard(card) {
  const cardId = $(card).attr("id");

  //Check if clicked card is available
  player.availableCards.forEach(availableCard => {
    if (
      player.availableCard.type == player.cards[cardId].type &&
      availableCard.weight == player.cards[cardId].weight
    ) {
      //Card has not been selected yet
      if (!player.selectedCards.length) {
        player.selectedCards.push(player.cards[cardId]);
      }
      //Available card is chosen
      else if (
        $(card).hasClass("available") &&
        !$(card).hasClass("selected") &&
        !$(card).hasClass("removed")
      ) {
        player.selectedCards.push(player.cards[cardId]);
      }

      //Possible card is chosen - possible exists only if a card has been selected
      if ($(card).hasClass("possible")) {
        player.selectedCards = [];
        player.selectedCards.push(player.cards[cardId]);
      }

      //If clicked card has already been selected
      if ($(card).hasClass("selected")) {
        $(card).removeClass("selected");
        $(card).addClass("removed");
        for (let i = 0; i < player.selectedCards.length; i++) {
          //Find index of the card to remove from selected
          if (
            player.selectedCards[i].type == player.cards[cardId].type &&
            player.selectedCards[i].weight == player.cards[cardId].weight
          ) {
            player.selectedCards.splice(i, 1);
            if (i == 0) {
              player.selectedCards = [];
            }
          }
        }
      }
    }
  });
  player.checkAvailableCards();
};

function openWinnerBox(whoWon) {
  // Getting the variable
  let box;
  whoWon === "player"
    ? (box = $("#player-win-box"))
    : (box = $("#cpu-win-box"));

  if (whoWon === "player") {
    box = $("#player-win-box");
    globalStats.playerWinCounter += 1;
    globalStats.totalPlayerWinCount += 1;
    ref.child("playerWinCount").set(totalPlayerWinCount);
    ref.child("totalMovesCount").set(totalMovesCount);
    document.getElementById("player-win-counter").textContent =
      globalStats.playerWinCounter;
    document.getElementById("total-player-win-counter").textContent =
      globalStats.totalPlayerWinCount;
    $("#player-win-counter")
      .animate({ fontSize: "10px" }, 200)
      .animate({ fontSize: "14px" }, 200);
    $("#total-player-win-counter")
      .animate({ fontSize: "10px" }, 200)
      .animate({ fontSize: "14px" }, 200);
  } else {
    box = $("#cpu-win-box");
    globalStats.cpuWinCounter += 1;
    globalStats.totalComputerWinCount += 1;
    ref.child("computerWinCount").set(globalStats.totalComputerWinCount);
    ref.child("totalMovesCount").set(globalStats.totalMovesCount);
    document.getElementById("cpu-win-counter").textContent =
      globalStats.cpuWinCounter;
    document.getElementById("total-cpu-win-counter").textContent =
      globalStats.totalComputerWinCount;
    $("#cpu-win-counter")
      .animate({ fontSize: "10px" }, 200)
      .animate({ fontSize: "14px" }, 200);
    $("#total-cpu-win-counter")
      .animate({ fontSize: "10px" }, 200)
      .animate({ fontSize: "14px" }, 200);
  }

  gameState.gameOver = true;

  //Fade in the Popup and add close button
  $(box).fadeIn(300);

  //Set the center alignment padding + border
  let popMargTop = ($(box).height() + 24) / 2;
  let popMargLeft = ($(box).width() + 24) / 2;

  $(box).css({
    "margin-top": -popMargTop,
    "margin-left": -popMargLeft
  });

  addMask();
}

function addMask() {
  $("body").append('<div id="mask"></div>');
  $("#mask").fadeIn(300);
}

// throw confetti
/* Thanks to @gamanox
https://codepen.io/gamanox/pen/FkEbH
*/
function throwConfetti() {
  let COLORS,
    Confetti,
    NUM_CONFETTI,
    PI_2,
    canvas,
    confetti,
    context,
    drawCircle,
    drawCircle2,
    drawCircle3,
    i,
    range,
    xpos;

  NUM_CONFETTI = 80;

  COLORS = [
    [255, 255, 255],
    [255, 144, 0],
    [255, 255, 255],
    [255, 144, 0],
    [0, 277, 235]
  ];

  PI_2 = 2 * Math.PI;

  canvas = document.getElementById("confetti");

  context = canvas.getContext("2d");

  window.w = 0;

  window.h = 0;

  window.resizeWindow = function() {
    window.w = canvas.width = window.innerWidth;
    return (window.h = canvas.height = window.innerHeight);
  };

  window.addEventListener("resize", resizeWindow, false);

  window.onload = function() {
    return setTimeout(resizeWindow, 0);
  };

  range = function(a, b) {
    return (b - a) * Math.random() + a;
  };

  drawCircle = function(x, y, r, style) {
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(x - 17, y + 14, x + 13, y + 5, x - 5, y + 22);
    context.lineWidth = 3;
    context.strokeStyle = style;
    return context.stroke();
  };

  drawCircle2 = function(x, y, r, style) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 10, y + 10);
    context.lineTo(x + 10, y);
    context.closePath();
    context.fillStyle = style;
    return context.fill();
  };

  drawCircle3 = function(x, y, r, style) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 10, y + 10);
    context.lineTo(x + 10, y);
    context.closePath();
    context.fillStyle = style;
    return context.fill();
  };

  xpos = 0.9;

  document.onmousemove = function(e) {
    return (xpos = e.pageX / w);
  };

  window.requestAnimationFrame = (function() {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        return window.setTimeout(callback, 100 / 20);
      }
    );
  })();

  Confetti = (function() {
    function Confetti() {
      this.style = COLORS[~~range(0, 5)];
      this.rgb =
        "rgba(" + this.style[0] + "," + this.style[1] + "," + this.style[2];
      this.r = ~~range(2, 6);
      this.r2 = 2 * this.r;
      this.replace();
    }

    Confetti.prototype.replace = function() {
      this.opacity = 0;
      this.dop = 0.03 * range(1, 4);
      this.x = range(-this.r2, w - this.r2);
      this.y = range(-20, h - this.r2);
      this.xmax = w - this.r;
      this.ymax = h - this.r;
      this.vx = range(0, 2) + 8 * xpos - 5;
      return (this.vy = 0.7 * this.r + range(-1, 1));
    };

    Confetti.prototype.draw = function() {
      let ref;
      this.x += this.vx;
      this.y += this.vy;
      this.opacity += this.dop;
      if (this.opacity > 1) {
        this.opacity = 1;
        this.dop *= -1;
      }
      if (this.opacity < 0 || this.y > this.ymax) {
        this.replace();
      }
      if (!(0 < (ref = this.x) && ref < this.xmax)) {
        this.x = (this.x + this.xmax) % this.xmax;
      }
      drawCircle(
        ~~this.x,
        ~~this.y,
        this.r,
        this.rgb + "," + this.opacity + ")"
      );
      drawCircle3(
        ~~this.x * 0.5,
        ~~this.y,
        this.r,
        this.rgb + "," + this.opacity + ")"
      );
      return drawCircle2(
        ~~this.x * 1.5,
        ~~this.y * 1.5,
        this.r,
        this.rgb + "," + this.opacity + ")"
      );
    };

    return Confetti;
  })();

  confetti = (function() {
    let j, ref, results;
    results = [];
    for (
      i = j = 1, ref = NUM_CONFETTI;
      1 <= ref ? j <= ref : j >= ref;
      i = 1 <= ref ? ++j : --j
    ) {
      results.push(new Confetti());
    }
    return results;
  })();

  window.step = function() {
    let c, j, len, results;
    requestAnimationFrame(step);
    context.clearRect(0, 0, w, h);
    results = [];
    for (j = 0, len = confetti.length; j < len; j++) {
      c = confetti[j];
      results.push(c.draw());
    }
    return results;
  };

  step();

  // fix initial bug when firing
  resizeWindow();

  // fade in
  canvas.style.opacity = 0;
  let tick = function() {
    canvas.style.opacity = +canvas.style.opacity + 0.01;
    if (+canvas.style.opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) ||
        setTimeout(tick, 100);
    }
  };
  tick();
}

function removeConfetti() {
  $("#confetti-container").empty();
  $("#confetti-container").append(`<canvas id="confetti"></canvas>`);
}
