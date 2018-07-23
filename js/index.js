let playerCards = [],
    cpuCards = [],
    deck = [],
    pile = [],
    nextTurn = 0,
    availableCards = [],
    selectedCards = [],
    lastCard = 0,
    chosenWeight = 0,
    chosenType = 0,
    jackActive = 0,
    aceActive = 0,
    cardsToTake = 1,
    waitTurn = 0,
    cpuWait = 0,
    playerWait = 0,
    battleCardActive = 0;
    changeDemand = 0;
let cardTypes = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];
let cardWeights = ["clubs", "diamonds", "spades", "hearts"];

//Init game
getDeck();
renderCards();

function getDeck() {
   function card(type, weight) {
      this.type = type;
      this.weight = weight;
   };

   function CreateDeck() {
      cardWeights.forEach(function (weight) {
         cardTypes.forEach(function (type) {
            deck.push(new card(type, weight));
         });
      });
   };

   let getRandomInt = function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   };

   CreateDeck();
   shuffleDeck(deck);
   assignCards();
   //Give out cards
   function assignCards(assignedCards) {
      assignedCards1 = deck.splice(0, 5);
      assignedCards2 = deck.splice(0, 5);

      //Always start game with a neutral card

      for (let i = 0; i < deck.length; i++) {
         switch (deck[i].type) {
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "10":
            case "queen":
               pile = deck.splice(i, 1);
         }
         if (pile[0]) {
            break;
         }
      }

      playerCards = assignedCards1;
      sortCards(playerCards);
      cpuCards = assignedCards2;
   }
   return deck;
};

function shuffleDeck(array) {
   let currentIndex = array.length,
       temporaryValue,
       randomIndex;

   // While there remain elements to shuffle...
   while (0 !== currentIndex) {

      // Pick remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
   }

   return array;
}

function compare(a, b) {
   if (a.type < b.type) return -1;
   if (a.type > b.type) return 1;
   return 0;
}

function sortCards(array) {
   return array.sort(function (a, b) {
      const compString = "'2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king' , 'ace'";
      return compString.indexOf(a.type) - compString.indexOf(b.type);
   });
}

function renderCards() {
   checkCardsToTake();
   renderPlayerCards();
   renderCpuCards();
   renderPile();
   updateCardsCounter();
   cpuMove();
   checkAvailableCards();
}

function updateCardsCounter() {
   $('#deckCounter').empty();
   $('#pileCounter').empty();
   $('#cpuCardsCounter').empty();
   document.getElementById('deckCounter').innerHTML += 'Cards left: ' + deck.length;
   document.getElementById('pileCounter').innerHTML += 'Cards on pile: ' + pile.length;
   document.getElementById('cpuCardsCounter').innerHTML += 'CPU cards: ' + pile.length;
}

//CPU move
function cpuMove() {
  sortCards(cpuCards);
   if (nextTurn) {
      console.log(lastCard);
      console.log(cpuCards);

      let allCpuCard = cpuCards;
      let cardsToUse = [];
      let cpuAvailableCards = [];
      let typeToUse;
      cpuAvailableCards = cpuCards.filter(function (card) {
         return card.weight == lastCard.weight || card.type == lastCard.type;
      });
      if (lastCard.type == 'ace'){
        cpuAvailableCards = cpuCards.filter(function (card) {
           return card.weight == chosenWeight || card.type == lastCard.type;
        });
      }

      if (jackActive) {
        cpuAvailableCards = cpuCards.filter(function (card) {
           return "jack" == card.type || card.type == chosenType;
        });
      }
      console.log(cpuAvailableCards);
      //IF CPU does have available cards
      if (cpuAvailableCards.length) {
         console.log("cpu had available cards");
         aceActive = 0;
         let cpuPossibleMoves = cpuAvailableCards.map(function (card) {
            return {
               type: card.type,
               weight: card.weight,
               sameTypeAmount: function () {
                  let amount = 0;
                  cpuCards.forEach(function (e) {
                     if (e.type === card.type) {
                        amount += 1;
                     }
                  });
                  return amount - 1;
               }(),
               sameWeightAmount: function () {
                  let moves = 0;
                  cpuCards.forEach(function (e) {
                     if (e.weight === card.weight) {
                        moves += 1;
                     }
                  });
                  return moves - 1;
               }()
            };
         });

         console.log(cpuPossibleMoves);
         let neutralCards = cpuPossibleMoves.filter((card) => {
            return card.type == "5" || card.type == "6" || card.type == "7" || card.type == "8" || card.type == "9" || card.type == "10" || card.type == "queen" || (card.type == "king" && card.weight == "diamonds") || (card.type == "king" && card.weight == "clubs");
         });


         let battleCards = cpuPossibleMoves.filter((card) => {
            return card.type == "2" || card.type == "3" || (card.type == "king" && card.weight == "hearts") || (card.type == "king" && card.weight == "spades") ;
         });

         let fours = cpuPossibleMoves.filter((card) => {
            return card.type == "4";
         });

         let jacks = cpuPossibleMoves.filter((card) => {
            return card.type == "jack";
         });

         let aces = cpuPossibleMoves.filter((card) => {
            return card.type == "ace";
         });

         let kings = cpuPossibleMoves.filter((card) => {
           console.log((card.type == "king" && card.weight == "diamonds") || (card.type == "king" && card.weight == "clubs"));
            return (card.type == "king" && card.weight == "diamonds") || (card.type == "king" && card.weight == "clubs");
         });
         if (jacks.length && !battleCardActive && !cpuWait){
          if (neutralCards.length === 1)
          cardsToUse = jacks
         }

         console.log(neutralCards);
         console.log(battleCards);
         console.log(fours);
         console.log(jacks);
         console.log(aces);

         let cardsDifference;
         cpuCards.length - playerCards.length > 0 ? cardsDifference = cpuCards.length - playerCards.length : cardsDifference = 0;
         if (cpuCards.length == playerCards.length) {
           cardsDifference = 1;
         }
         let neutralChance = neutralValue();
         let battleChance = battleValue();
         let foursChance = foursValue();
         let jacksChance = jacksValue();
         let acesChance = acesValue();
         let kingsChance = kingsValue();

         console.log(battleCardActive);
         console.log(waitTurn);
         console.log(neutralCards.length);

         function neutralValue (){
           if (neutralCards.length === 0 || battleCardActive || waitTurn || cpuWait) {
             return 0;
           }
           else {
             let weight = 15;
             let value = neutralCards.length * weight;
             return value
           }
         }
         function battleValue () {
           if (battleCards.length === 0 || waitTurn || cpuWait || jackActive) {
             return 0
           }
           else {
             let weight = 6;
             let value = battleCards.length * weight + Math.pow(cardsDifference, 2)/10 * weight;
             return value
           }
         }
         function foursValue () {
           if (fours.length === 0 || battleCardActive || jackActive || cpuWait) {
             return 0;
           }
           else {
             let weight = 1;
             let foursOnPile = pile.filter(x => x.type === "4").length;
             let foursLeft = checkFours();

             function checkFours(){
               if (4 - foursOnPile - fours.length === 0){
                 weight = 500;
               }
               else if (4 - foursOnPile - fours.length === 1) {
                 weight = 20;
               }
               else if (4 - foursOnPile - fours.length === 2) {
                 weight = 5;
               }
               else {
                 weight = 2;
               }
             }

             let value = weight*deck.length/playerCards.length;
             return value
           }
         }
         function jacksValue () {
           if (jacks.length === 0 || battleCardActive || waitTurn || cpuWait ) {
             return 0;
           }
           else {
             let jacksWeight = 24;
             console.log(jacksWeight);
             let jackNeutralRatio = 1
             if (neutralCards.length) {
               jackNeutralRatio = jacksWeight/neutralCards.length;
             };
             console.log(jacksWeight/cardsDifference);
             let value = jacks.length * jackNeutralRatio + (cardsDifference/jacksWeight)*3 + (jacksWeight/playerCards.length)*2;
             return value
           }
         }
         function acesValue () {
           if (aces.length === 0 || battleCardActive || waitTurn || cpuWait || jackActive) {
             return 0;
           }
           else {
             let weight = 3;
             let value = (aces.length * weight) + (cpuCards.length/cpuAvailableCards.length)*weight;
             return value
           }
         }
         function kingsValue () {
           console.log((kings.length && lastCard.type == "king" && lastCard.weight == "hearts"));
           console.log((kings.length && lastCard.type == "king" && lastCard.weight == "spades"))

           if (kings.length && ((lastCard.type == "king" && lastCard.weight == "hearts") || (lastCard.type == "king" && lastCard.weight == "spades"))) {
             return 15;
           }
           else {
             return 0;
           }
         }
         console.log(neutralChance);
         console.log(battleChance);
         console.log(foursChance);
         console.log(jacksChance);
         console.log(acesChance);

         let min = 0;
         let max = neutralChance + battleChance + foursChance + jacksChance + acesChance + kingsChance;
         let previousUpperRange = 0;

         let neutralRange = calculateRange(neutralChance);
         let battleRange = calculateRange(battleChance);
         let foursRange = calculateRange(foursChance);
         let jacksRange = calculateRange(jacksChance);
         let acesRange = calculateRange(acesChance);
         let kingsRange = calculateRange(kingsChance);

         function calculateRange (rangeWidth) {
           previousUpperRange = previousUpperRange + rangeWidth;
           if (rangeWidth){
             previousUpperRange += rangeWidth;
             return previousUpperRange;
           }
           else {
             return 0;
           }
         };

         let rand = function(min, max) {
             return Math.random() * (max - min) + min;
         };

         let randomNumber = rand(min, max);
         let weightPicked;
         if (randomNumber < neutralRange){
          cardsToUse = neutralCards;
          weightPicked = 1;
          console.log("its neutral");
         }
         else if (randomNumber < battleRange) {
          cardsToUse = battleCards;
          weightPicked = 2;
          console.log("its battle");
         }
         else if (randomNumber < foursRange) {
           cardsToUse = fours;
           weightPicked = 3;
           console.log("its fours");
         }
         else if (randomNumber < jacksRange) {
           cardsToUse = jacks;
           weightPicked = 4;
           console.log("its jacks");
         }
         else if (randomNumber < acesRange) {
           cardsToUse = aces;
           weightPicked = 5;
           console.log("its aces");
         }
         else if (randomNumber < kingsRange) {
           cardsToUse = kings;
           weightPicked = 6;
           console.log("its kings");
         }

         if (jacks.length && neutralCards.length === 1) {
           cardsToUse = jacks;
           weightPicked = 4;
         }

         if (jackActive && weightPicked !== 4){
           jackActive -=1;
         }

         console.log("randomNumber");
         console.log(randomNumber);
         console.log("neutralRange");
         console.log(neutralRange);
         console.log("battleRange");
         console.log(battleRange);
         console.log("foursRange");
         console.log(foursRange);
         console.log("jacksRange");
         console.log(jacksRange);
         console.log("acesRange");
         console.log(acesRange);
         console.log("kingsRange");
         console.log(kingsRange);

         if (randomNumber == 0) {
           cpuNoCardsToUse();
         }


         else {

           console.log("cardsToUse");
           console.log(cardsToUse);

         let mostMoves = cardsToUse.reduce((prev, curr) => prev.possibleCardsAfter < curr.possibleCardsAfter ? prev : curr);

         console.log("mostMoves");
         console.log(mostMoves);

         let cpuSelectedCards = [];

         if (!mostMoves.sameTypeAmount){
          cpuAvailableCards = [];
          cpuSelectedCards.push(mostMoves);
         }
         else {
           cpuSelectedCards = cpuCards.filter(e => e.type == mostMoves.type);
         }

         cpuSelectedCards.forEach((card, idx) => {

           let notCheckedYet = 1;
           switch (card.type) {
              case "2":
                if(nobodyIsWaiting())
                 cardsToTake += 2;
                 break;
              case "3":
                 if(nobodyIsWaiting())
                 cardsToTake += 3;
                 break;
              case "4":
                 waitTurn += 1;
                 break;
              case "jack":
                jackActive = 2;
                if (neutralCards.length) {
                  chosenType = (neutralCards.reduce((prev, curr) => prev.sameTypeAmount < curr.sameTypeAmount ? prev : curr)).type;
                  console.log("chosenType");
                  console.log(chosenType);
                };
                break;
              case "ace":
                if (notCheckedYet) {
                aceActive = 1;
                let cpuCardsWithoutMostMoves = cpuCards;
                cpuCardsWithoutMostMoves.splice(cpuCardsWithoutMostMoves.indexOf(mostMoves), 1);
                console.log((cpuCardsWithoutMostMoves.reduce((prev, curr) => prev.sameWeightAmount < curr.sameWeightAmount ? prev : curr)).weight);
                chosenWeight = (cpuCardsWithoutMostMoves.reduce((prev, curr) => prev.sameWeightAmount < curr.sameWeightAmount ? prev : curr)).weight;
                console.log("chosenWeight");
                console.log(chosenWeight);
                break;
              }
              case "king":
                 if (card.weight === "hearts" || card.weight === "spades" && nobodyIsWaiting()) {
                    cardsToTake += 5;
                    break;
                 }

                 //Kings of clubs and diamonds nullify amount of cards to be taken
                 else {
                    cardsToTake = 0;
                    break;
                    }
           }
          let cardForSplice;
          pile.push(card);
          var idx = cpuCards.findIndex((item) => item.type === card.type && item.weight === card.weight);
          cpuCards.splice(idx, 1);
         })
        cpuAvailableCards = [];
       }

      } else {
        cpuNoCardsToUse();
      }
      nextTurn = 0;
      renderCards();
   }
}

function cpuNoCardsToUse () {
  console.log("no cards available");
  //Take cards from pile and shuffle the deck if there is one card left

  if (jackActive) {
    jackActive -=1;
  }

  //Do nothing if last card was 4
  if (waitTurn > 0) {
    cpuWait = waitTurn - 1;
    waitTurn = 0;
    return;
  } else if (cpuWait) {
    cpuWait -= 1;
  } else {
     //Repeat the loop as many times as there are cards to be taken
     if (cardsToTake > 1) {

        //Shuffle the deck if there are not enough cards remaining in the deck
        if (cardsToTake > deck.length) {
           let cardsForShuffle = pile;
           cardsForShuffle.pop;
           shuffleDeck(cardsForShuffle);
           deck = deck.concat(cardsForShuffle);
           pile.splice(0, deck.length - 2);
        }
        for (let i = 1; i < cardsToTake; i++) {
           cardFromDeck = deck[0];
           deck.shift();
           cpuCards.push(cardFromDeck);
        }
     }

     //Take one card - default amount
     else {
       if (deck.length === 1) {
          let cardsForShuffle = pile;
          cardsForShuffle.pop;
          shuffleDeck(cardsForShuffle);
          deck = deck.concat(cardsForShuffle);
          pile.splice(0, deck.length - 2);
       }
         cardFromDeck = deck[0];
         deck.shift();
         cpuCards.push(cardFromDeck);
        }
        cardsToTake = 1;
      }
}

//Cards rendering
function renderPlayerCards() {
   $('#playerCards').empty();
   sortCards(playerCards);
   playerCards.forEach(function (card, i) {
      const fileName = card.type + "_of_" + card.weight;
      const url = 'https://res.cloudinary.com/bosmanone/image/upload/v1477397924/cards/' + fileName + '.png';
      const cardDiv = "<div " + "id='" + i + "' class='card " + fileName + " cardsInHand' onclick='pickCard(this)' style='background-image: url(" + url + ");" + ");'></div>";
      $('#playerCards').append(cardDiv);
   });
};
/*
function renderCpuCards() {
   $('#cpuCards').empty();
   cpuCards.forEach(function (card, i) {
     const fileName = card.type + "_of_" + card.weight;
     const url = 'https://res.cloudinary.com/bosmanone/image/upload/v1477397924/cards/' + fileName + '.png';
     const cardDiv = "<div " + "id='" + i + "' class='card " + fileName + " cardsInHand' onclick='pickCard(this)' style='background-image: url(" + url + ");" + ");'></div>";
     $('#cpuCards').append(cardDiv);
   });
};
*/

function renderCpuCards() {
   $('#cpuCards').empty();
   cpuCards.forEach(function (card, i) {
      const url = 'https://i.pinimg.com/originals/6c/a0/16/6ca016115a894f69dea75cc80f95ad92.jpg';
      const cardDiv = "<div " + "id='" + i + "' class='card cardsInHand" + "'style='background-image: url(" + url + ");" + ");'></div>";
      $('#cpuCards').append(cardDiv);
   });
};


function renderPile() {
   if (pile.length) {
      $('#pile').empty();

      const numberOnPile = pile.length - 1
      const fileName = pile[numberOnPile].type + "_of_" + pile[numberOnPile].weight;
      const url = 'https://res.cloudinary.com/bosmanone/image/upload/v1477397924/cards/' + fileName + '.png';
      const lastCardImg = "<div class='card " + "'style='background-image: url(" + url + ");'></div>";
      $('#pile').append(lastCardImg);
   } else {
      return;
   }
};

//Confirm cards
$("#confirmCards").click(function () {

  //Do nothing if player did not pick cards
  if (!selectedCards.length) {
    return;
  }

   //Battle cards - add cards to take accordingly
   selectedCards.forEach(function (card) {
      switch (card.type) {
         case "2":
            if (nobodyIsWaiting())
            cardsToTake += 2;
            break;
         case "3":
            if (nobodyIsWaiting())
            cardsToTake += 3;
            break;
         case "4":
            if (!cpuWait) {
            waitTurn += 1;
            debugger;
          }
            break;
          case "jack":
            jackActive = 2;
            changeDemand = 1;
            break;
          case "ace":
            aceActive = 1;
            break;
         case "king":
            if (card.weight === "hearts" || card.weight === "spades" && nobodyIsWaiting()) {
               cardsToTake += 5;
               break;
            }

            //Kings of clubs and diamonds nullify amount of cards to be taken
            else {
                  cardsToTake = 0;
                  break;
               }
      }

      //Remove cards from playerCards
      var cardIndexInPlayerCards = playerCards.indexOf(card);
      playerCards.splice(cardIndexInPlayerCards, 1);
   });

   pile = pile.concat(selectedCards);

   //Open a dialog box if ace or jack was used
   if (aceActive) {
      openAceBox();
   };
   if (jackActive && changeDemand) {
      changeDemand = 0;
      openJackBox();
   };
   selectedCards = [];
   lastCard = pile[pile.length - 1];

   nextTurn = 1;

   if(!aceActive && !jackActive){
      renderCards();
   }
   //Decrease jack counter
   if (jackActive) {
      jackActive -= 1;
   }

   if (jackActive && lastCard.type !== 'jack'){
     renderCards();
   }
});

//Reset selectedcards
$("#resetCards").click(function () {
   selectedCards = [];
   renderCards();
});

//Wait one turn
$("#waitTurn").click(function () {
  if (playerWait) playerWait -= 1;
  else {
    playerWait = waitTurn - 1;
    waitTurn = 0;
  }
   nextTurn = 1;
   console.log("waiteeeeeeeeeeed");
   renderCards();
});

//Take cards from deck
$('#deck').click(function (cardFromDeck) {
  console.log("cardsToTake");
  console.log(cardsToTake);
   selectedCards = [];
   //Do nothing if last card was 4
   if (waitTurn || playerWait) {
      return;
   }
   else {

      //Repeat the loop as many times as there are cards to be taken
      if (cardsToTake > 1) {
         //Shuffle the deck if there are not enough cards remaining in the deck
         if (cardsToTake > deck.length) {
            let cardsForShuffle = pile;
            cardsForShuffle.pop;
            shuffleDeck(cardsForShuffle);
            deck = deck.concat(cardsForShuffle);
            pile.splice(0, deck.length - 2);
         }
         for (let i = 1; i < cardsToTake; i++) {
            cardFromDeck = deck[0];
            deck.shift();
            playerCards.push(cardFromDeck);
         }
      }

      //Take one card - default amount
      else {
            if (deck.length === 1) {
               let cardsForShuffle = pile;
               cardsForShuffle.pop;
               shuffleDeck(cardsForShuffle);
               deck = deck.concat(cardsForShuffle);
               pile.splice(0, deck.length - 2);
            }

            cardFromDeck = deck[0];
            deck.shift();
            playerCards.push(cardFromDeck);
         }
         cardsToTake = 1;
         nextTurn = 1;
         renderCards();
   }
});

//Remove mask - ace and jack popup
function removeMask() {
   $('#mask , .suit-popup').fadeOut(300, function () {
      $('#mask').remove();
   });
}

//Ace or jack was chosen
$("#hearts").click(function () {
   chosenWeight = "hearts";
   removeMask();
   renderCards();
});
$("#diamonds").click(function () {
   chosenWeight = "diamonds";
   removeMask();
   renderCards();
});
$("#clubs").click(function () {
   chosenWeight = "clubs";
   removeMask();
   renderCards();
});
$("#spades").click(function () {
   chosenWeight = "spades";
   removeMask();
   renderCards();
});
$("#demand5").click(function () {
   chosenType = "5";
   removeMask();
   renderCards();
});
$("#demand6").click(function () {
   chosenType = "6";
   removeMask();
   renderCards();
});
$("#demand7").click(function () {
   chosenType = "7";
   removeMask();
   renderCards();
});
$("#demand8").click(function () {
   chosenType = "8";
   removeMask();
   renderCards();
});
$("#demand9").click(function () {
   chosenType = "9";
   removeMask();
   renderCards();
});
$("#demand10").click(function () {
   chosenType = "10";
   removeMask();
   renderCards();
});
$("#demandQ").click(function () {
   chosenType = "queen";
   removeMask();
   renderCards();
});
$("#demandNone").click(function () {
   jackActive = 0;
   removeMask();
   renderCards();
});

//When ace is used
function openAceBox() {

   // Getting the variable
   const loginBox = $("#login-box");

   //Fade in the Popup and add close button
   $(loginBox).fadeIn(300);

   //Set the center alignment padding + border
   let popMargTop = ($(loginBox).height() + 24) / 2;
   let popMargLeft = ($(loginBox).width() + 24) / 2;

   $(loginBox).css({
      'margin-top': -popMargTop,
      'margin-left': -popMargLeft
   });

   // Add the mask to body
   $('body').append('<div id="mask"></div>');
   $('#mask').fadeIn(300);

}

//When jack is used
function openJackBox() {

   // Getting the variable
   const loginBox = $("#jack-box");

   //Fade in the Popup and add close button
   $(loginBox).fadeIn(300);

   //Set the center alignment padding + border
   let popMargTop = ($(loginBox).height() + 24) / 2;
   let popMargLeft = ($(loginBox).width() + 24) / 2;

   $(loginBox).css({
      'margin-top': -popMargTop,
      'margin-left': -popMargLeft
   });

   // Add the mask to body
   $('body').append('<div id="mask"></div>');
   $('#mask').fadeIn(300);

}

//Click on your own card
const pickCard = function pickCard(card) {
   const cardId = $(card).attr('id');

   //Check if clicked card is available
   availableCards.forEach((availableCard) => {

      if (availableCard.type == playerCards[cardId].type && availableCard.weight == playerCards[cardId].weight) {
        debugger;
         //Card has not been selected yet
         if (!selectedCards.length) {
            selectedCards.push(playerCards[cardId]);
         }
         //Available card is chosen
         else if ($(card).hasClass('available') && !$(card).hasClass('selected') && !$(card).hasClass('removed')) {
               selectedCards.push(playerCards[cardId]);
            }

            //Possible card is chosen - possible exists only if a card has been selected
            else if ($(card).hasClass('possible')) {
                  selectedCards = [];
                  selectedCards.push(playerCards[cardId]);
               }

         //If clicked card has already been selected
         if ($(card).hasClass('selected')) {
            $(card).removeClass("selected");
            $(card).addClass("removed");
            for (let i = 0; i < selectedCards.length; i++) {
               //Find index of the card to remove from selected
               if (selectedCards[i].type == playerCards[cardId].type && selectedCards[i].weight == playerCards[cardId].weight) {
                  selectedCards.splice(i, 1);
                  if (i == 0) {
                     selectedCards = [];
                  }
               }
            }
         }
      }
   });

   checkAvailableCards();
};

//Check if a battle card was used - 2, 3, king of hearts or king of spades
function checkCardsToTake() {
   if (cardsToTake > 1) {
      battleCardActive = 1;
   } else {
      battleCardActive = 0;
   }
}

function nobodyIsWaiting () {
  return !cpuWait && !playerWait;
}

function checkAvailableCards() {

   $("#newWeight").fadeOut(100);
   lastCard = pile[pile.length - 1];
   if (aceActive) {
      $("#newWeight").fadeIn(300);
   }
   if (jackActive) {
      $("#newType").fadeIn(300);
   }

   availableCards = []; //Clear available cards

   if (lastCard.type == 'ace') {
      const lastCardAfterAce = {
        type: 'ace',
        weight: chosenWeight
      }
      lastCard = Object.assign({}, lastCardAfterAce);
   }

   //Clear classes
   $('#playerCards').children().removeClass("available possible selected topCard removed");

   //If 4 was used make wait button visible
   if(waitTurn && nextTurn == 0){
    $('#waitTurn').removeClass("invisible");
   }
   if (playerWait == 0) {
      $('#waitTurn').addClass("invisible");
      $('#confirmCards').removeClass("invisible");
      $('#resetCards').removeClass("invisible");
   } else {
      $('#waitTurn').removeClass("invisible");
      $('#confirmCards').addClass("invisible");
      $('#resetCards').addClass("invisible");
   };
   if (waitTurn) $('#waitTurn').removeClass("invisible");

   if (selectedCards.length == 0) {
     aceActive = 0;
      //No cards have been chosen
      playerCards.forEach(function (card, i) {
         //No special conditions
         if (lastCard == null) {
         }
         if (card.type == lastCard.type && !jackActive && !waitTurn && !playerWait && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }
         if (card.weight == lastCard.weight && !jackActive && !waitTurn && !playerWait && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }

         //Jack demand is active
         if (card.type == chosenType && jackActive && !waitTurn && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }

         //Make jack available if it was used
         if (card.type == 'jack' && jackActive && !waitTurn && !battleCardActive && lastCard.type == 'jack') {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }

         //Make 4 available if it was used
         if (card.type == '4' && !jackActive && waitTurn && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }

         //Battle card is active - the same cardtype available + 2, 3, kings of given weight
         if (!jackActive && !waitTurn && !playerWait && battleCardActive) {

            //Card of same type is available
            if (card.type == lastCard.type ||

            //Cards of same weight + it's a 2 or 3
            card.weight == lastCard.weight && (card.type == "2" || card.type == "3") ||

            //Available kings - spades and hearts
            card.type == "king" && card.weight == lastCard.weight && (card.weight == "spades" || card.weight == "hearts") ||

            //If last card was a king, make king of diamond and clubs available
            card == lastCard.type && (card.weight == "diamond" || card.weight == "clubs")) {
               $('#playerCards').find("#" + i).addClass("available");
               availableCards.push(playerCards[i]);
            }
         };
      });
   } else if (selectedCards.length > 0) {
      let chosenCard = selectedCards[0];
      let topCard = selectedCards[selectedCards.length - 1];

      //Style top card
      playerCards.forEach(function (card, i) {
         if (topCard.type == card.type && topCard.weight == card.weight) {
            $('#playerCards').find("#" + i).addClass("topCard");
         }
      });

      //Adjust available cards according to chosen card

      playerCards.forEach(function (card, i) {

         //Get available cards with the same type as chosen card
         if (card.type == chosenCard.type) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }

         //If type or weight is the same last card and it does not have .available class and jack is not active
         if (card.type == lastCard.type || playerCards[i].weight == lastCard.weight && !$('#playerCards').find("#" + i).hasClass("available") && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("possible");
            availableCards.push(playerCards[i]);
         }

         //Make jack possible if it was used
         if (card.type == 'jack' && jackActive && !waitTurn && !playerWait) {
            $('#playerCards').find("#" + i).addClass("possible");
            availableCards.push(playerCards[i]);
         }
         //Make 4 possible if it was used
         if (card.type == "4" && !jackActive && waitTurn && !playerWait) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }
      });

      //Style selected cards
      selectedCards.forEach(function (selectedCard) {
         playerCards.forEach(function (playerCard, j) {
            if (selectedCard.type == playerCard.type && selectedCard.weight == playerCard.weight) {
               $('#playerCards').find("#" + j).addClass("selected");
            }
         });
      });
   }
};
