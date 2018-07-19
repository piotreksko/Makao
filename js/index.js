var playerCards = [],
    cpuCards = [],
    deck = [],
    pile = [],
    nextTurn = void 0,
    availableCards = [],
    selectedCards = [],
    lastCard = void 0,
    chosenWeight = void 0,
    chosenType = void 0,
    jackActive = 0,
    cardsToTake = 1,
    waitTurn = 0;
var cardTypes = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];
var cardWeights = ["clubs", "diamonds", "spades", "hearts"];

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

   var getRandomInt = function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   };

   CreateDeck();
   shuffleDeck(deck);
   assignCards();
   //Give out cards
   function assignCards(assignedCards) {
      assignedCards1 = deck.splice(0, 5);
      assignedCards2 = deck.splice(0, 15);

      //Always start game with a neutral card

      for (var i = 0; i < deck.length; i++) {
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
   var currentIndex = array.length,
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
      var compString = "'2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king' , 'ace'";
      return compString.indexOf(a.type) - compString.indexOf(b.type);
   });
}

function renderCards() {
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

   if (nextTurn) {
      console.log(lastCard);
      console.log(cpuCards);
      var cpuAvailableCards = cpuCards.filter(function (card) {
         return lastCard.weight == card.weight || lastCard.type == card.type;
      });
      console.log(cpuAvailableCards);
      //IF CPU does have available cards
      if (cpuAvailableCards[0]) {
         console.log("cpu had available cards");

         var possibleMoves = cpuAvailableCards.map(function (card) {
            return {
               type: card.type,
               weight: card.weight,
               sameTypeAmount: function () {
                  var amount = 0;
                  cpuCards.forEach(function (e) {
                     if (e.type === card.type) {
                        amount += 1;
                     }
                  });
                  return amount - 1;
               }(),
               possibleCardsAfter: function () {
                  var moves = 0;
                  cpuCards.forEach(function (e) {
                     if (e.weight === card.weight) {
                        moves += 1;
                     }
                  });
                  return moves - 1;
               }()
            };
         });

         console.log(possibleMoves);
         debugger;
         let mostMoves = possibleMoves.reduce(function(prev, curr) {
           return prev.possibleCardsAfter < curr.possibleCardsAfter ? prev : curr;
         });
         console.log(mostCards);

         var min = 1;
         var max = cpuAvailableCards.length;
         var randomNumber = Math.floor(Math.random() * max) + min;
         var cpuSelectedCard = cpuCards[randomNumber];
         cpuCards.splice(randomNumber, 1);
         pile.push(cpuSelectedCard);
         cpuAvailableCards = [];

      } else {
         console.log("no cards available");
         //Take cards from pile and shuffle the deck if there is one card left
         if (deck.length === 1) {
            var cardsForShuffle = pile;
            shuffleDeck(cardsForShuffle);
            deck = deck.concat(cardsForShuffle);
            pile.splice(0, deck.length - 2);
         }

         cardFromDeck = deck[0];
         deck.shift();
         cpuCards.push(cardFromDeck);
      }
      nextTurn = 0;
      renderCards();
   }
}

//Cards rendering
function renderPlayerCards() {
   $('#playerCards').empty();
   sortCards(playerCards);
   playerCards.forEach(function (card, i) {
      var fileName = card.type + "_of_" + card.weight;
      var url = 'https://res.cloudinary.com/bosmanone/image/upload/v1477397924/cards/' + fileName + '.png';
      var cardDiv = "<div " + "id='" + i + "' class='card " + fileName + " cardsInHand' onclick='pickCard(this)' style='background-image: url(" + url + ");" + ");'></div>";
      $('#playerCards').append(cardDiv);
   });
};

function renderCpuCards() {
   $('#cpuCards').empty();
   cpuCards.forEach(function (card, i) {
      var url = 'https://i.pinimg.com/originals/6c/a0/16/6ca016115a894f69dea75cc80f95ad92.jpg';
      var cardDiv = "<div " + "id='" + i + "' class='card cardsInHand" + "'style='background-image: url(" + url + ");" + ");'></div>";
      $('#cpuCards').append(cardDiv);
   });
};

function renderPile() {
   if (pile.length) {
      $('#pile').empty();
      var numberOnPile = pile.length - 1;
      var fileName = pile[numberOnPile].type + "_of_" + pile[numberOnPile].weight;
      var url = 'https://res.cloudinary.com/bosmanone/image/upload/v1477397924/cards/' + fileName + '.png';
      var lastCardImg = "<div class='card " + "'style='background-image: url(" + url + ");'></div>";
      $('#pile').append(lastCardImg);
   } else {
      return;
   }
};

//Confirm cards
$("#confirmCards").click(function () {

   //Decrease jack and wait counters
   if (jackActive > 0) {
      jackActive -= 1;
   }
   if (waitTurn > 0) {
      waitTurn -= 1;
   }

   //Battle cards - add cards to take accordingly
   selectedCards.forEach(function (card, index) {
      switch (card.type) {
         case "2":
            cardsToTake += 2;
            break;
         case "3":
            cardsToTake += 3;
            break;
         case "4":
            waitTurn += 1;
         case "king":
            if (card.weight === "hearts" || card.weight === "spades") {
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
      var index = playerCards.indexOf(card);
      playerCards.splice(index, 1);
   });

   pile = pile.concat(selectedCards);

   //Open a dialog box if ace or jack was used
   if (selectedCards[0].type == "ace") {
      openAceBox();
   };
   if (selectedCards[0].type == "jack") {
      openJackBox();
   };
   selectedCards = [];
   lastCard = pile[pile.length - 1];
   nextTurn = 1;
   renderCards();
});

//Reset selectedcards
$("#resetCards").click(function () {
   selectedCards = [];
   renderCards();
});

//Wait one turn
$("#waitTurn").click(function () {
   waitTurn -= 1;
   checkAvailableCards();
});

//Take cards from deck
$('#deck').click(function (cardFromDeck) {

   selectedCards = [];
   //Do nothing if last card was 4
   if (lastCard.type == '4') {
      return;
   } else {

      //Repeat the loop as many times as there are cards to be taken
      if (cardsToTake > 1) {

         //Shuffle the deck if there are not enough cards remaining in the deck
         if (cardsToTake > deck.length) {
            var cardsForShuffle = pile;
            shuffleDeck(cardsForShuffle);
            deck = deck.concat(cardsForShuffle);
            pile.splice(0, deck.length - 2);
         }
         for (var i = 0; i < cardsToTake - 1; i++) {
            cardFromDeck = deck[0];
            deck.shift();
            playerCards.push(deck[0]);
            renderCards();
         }
      }

      //Take one card - default amount
      else {
            if (deck.length === 1) {
               var _cardsForShuffle = pile;
               shuffleDeck(_cardsForShuffle);
               deck = deck.concat(_cardsForShuffle);
               pile.splice(0, deck.length - 2);
            }

            cardFromDeck = deck[0];
            deck.shift();
            playerCards.push(cardFromDeck);
            renderCards();
         }

      if (cardsToTake > 1) {
         cardsToTake = 1;
      }
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
   checkAvailableCards();
});
$("#diamonds").click(function () {
   chosenWeight = "diamonds";
   removeMask();
   checkAvailableCards();
});
$("#clubs").click(function () {
   chosenWeight = "clubs";
   removeMask();
   checkAvailableCards();
});
$("#spades").click(function () {
   chosenWeight = "spades";
   removeMask();
   checkAvailableCards();
});
$("#demand5").click(function () {
   chosenType = "5";
   jackActive = 1;
   removeMask();
   checkAvailableCards();
});
$("#demand6").click(function () {
   chosenType = "6";
   jackActive = 1;
   removeMask();
   checkAvailableCards();
});
$("#demand7").click(function () {
   chosenType = "7";
   jackActive = 1;
   removeMask();
   checkAvailableCards();
});
$("#demand8").click(function () {
   chosenType = "8";
   jackActive = 1;
   removeMask();
   checkAvailableCards();
});
$("#demand9").click(function () {
   chosenType = "9";
   jackActive = 1;
   removeMask();
   checkAvailableCards();
});
$("#demand10").click(function () {
   chosenType = "10";
   jackActive = 1;
   removeMask();
   checkAvailableCards();
});
$("#demandQ").click(function () {
   chosenType = "queen";
   jackActive = 1;
   removeMask();
   checkAvailableCards();
});
$("#demandNone").click(function () {
   jackActive = 0;
   removeMask();
   checkAvailableCards();
});

//When ace is used
function openAceBox() {

   // Getting the variable
   var loginBox = $("#login-box");

   //Fade in the Popup and add close button
   $(loginBox).fadeIn(300);

   //Set the center alignment padding + border
   var popMargTop = ($(loginBox).height() + 24) / 2;
   var popMargLeft = ($(loginBox).width() + 24) / 2;

   $(loginBox).css({
      'margin-top': -popMargTop,
      'margin-left': -popMargLeft
   });

   // Add the mask to body
   $('body').append('<div id="mask"></div>');
   $('#mask').fadeIn(300);

   return false;
}

//When jack is used
function openJackBox() {

   // Getting the variable
   var loginBox = $("#jack-box");

   //Fade in the Popup and add close button
   $(loginBox).fadeIn(300);

   //Set the center alignment padding + border
   var popMargTop = ($(loginBox).height() + 24) / 2;
   var popMargLeft = ($(loginBox).width() + 24) / 2;

   $(loginBox).css({
      'margin-top': -popMargTop,
      'margin-left': -popMargLeft
   });

   // Add the mask to body
   $('body').append('<div id="mask"></div>');
   $('#mask').fadeIn(300);

   return false;
}

//Click on your own card
var pickCard = function pickCard(card) {
   var cardId = $(card).attr('id');

   //Check if clicked card is available
   availableCards.forEach(function (availableCard) {

      if (availableCard.type == playerCards[cardId].type && availableCard.weight == playerCards[cardId].weight) {

         //Card has not been selected yet
         if (!selectedCards) {
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
            for (var i = 0; i < selectedCards.length; i++) {
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

function checkAvailableCards(battleCardActive) {

   $("#newWeight").fadeOut(100);
   lastCard = pile[pile.length - 1];
   if (lastCard.type === "ace") {
      lastCard.weight = chosenWeight;
      $("#newWeight").fadeIn(300);
   }
   if (lastCard.type === "jack") {
      lastCard.type = chosenType;
      $("#newType").fadeIn(300);
   }

   availableCards = []; //Clear available cards

   //Clear classes
   $('#playerCards').children().removeClass("available possible selected topCard removed");

   //If 4 was used make wait button visible
   if (waitTurn == 0) {
      $('#waitTurn').addClass("invisible");
      $('#confirmCards').removeClass("invisible");
      $('#resetCards').removeClass("invisible");
   } else {
      $('#waitTurn').removeClass("invisible");
      $('#confirmCards').addClass("invisible");
      $('#resetCards').addClass("invisible");
   };

   checkCardsToTake();

   //Check if a battle card was used - 2, 3, king of hearts or king of spades
   function checkCardsToTake() {
      if (cardsToTake > 1) {
         battleCardActive = 1;
      } else {
         battleCardActive = 0;
      }
   }

   if (selectedCards.length == 0) {

      //No cards have been chosen
      playerCards.forEach(function (card, i) {

         //No special conditions
         if (card.type == lastCard.type && !jackActive && !waitTurn && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }
         if (card.weight == lastCard.weight && !jackActive && !waitTurn && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }

         //Jack demand is active
         if (card.type == chosenType && jackActive && !waitTurn && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }

         //Make jack available if it was used
         if (card.type == 'jack' && jackActive && !waitTurn && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }

         //Make 4 available if it was used
         if (card.type == '4' && !jackActive && waitTurn && !battleCardActive) {
            $('#playerCards').find("#" + i).addClass("available");
            availableCards.push(playerCards[i]);
         }

         //Battle card is active - the same cardtype available + 2, 3, kings of given weight
         if (!jackActive && !waitTurn && battleCardActive) {

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
      var chosenCard = selectedCards[0];
      var topCard = selectedCards[selectedCards.length - 1];

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
         if (card.type == 'jack' && jackActive && !waitTurn) {
            $('#playerCards').find("#" + i).addClass("possible");
            availableCards.push(playerCards[i]);
         }
         //Make 4 possible if it was used
         if (card.type == "4" && !jackActive && waitTurn) {
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
