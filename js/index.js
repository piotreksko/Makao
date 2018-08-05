let playerCards = [],
    cpuCards = [],
    deck = [],
    pile = [],
    nextTurn = 0,
    availableCards = [],
    possibleCards = [],
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
    battleCardActive = 0,
    changeDemand = 0,
    winner = 0,
    movesCount = -1,
    cpuWinCounter = 0,
    gameOver = false,
    playerWinCounter = 0,
    totalComputerWinCount = 0,
    totalPlayerWinCount = 0,
    totalMovesCount = 0,
    macaoCallCount = 0;

const cardTypes = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];
const cardWeights = ["clubs", "diamonds", "spades", "hearts"];

const ref = firebase.database().ref("/winCounter");

getGlobalCounters();

function getGlobalCounters() {
ref.on("value", function (snapshot) {
    totalComputerWinCount = snapshot.val().computerWinCount;
    totalPlayerWinCount = snapshot.val().playerWinCount;

    //Only overwrite at the game start - dont overwrite from realtime database updates
    if (totalMovesCount == 0) {
        totalMovesCount = snapshot.val().totalMovesCount;
    }
    if (macaoCallCount == 0) {
        macaoCallCount = snapshot.val().macaoCallCount;
    }
    setTotalCounters();
    });
};

function setTotalCounters() {
    document.getElementById("total-player-win-counter").textContent = totalPlayerWinCount;
    document.getElementById("total-cpu-win-counter").textContent = totalComputerWinCount;
    document.getElementById("total-moves-counter").textContent = totalMovesCount;
    document.getElementById("macao-call-counter").textContent = macaoCallCount;
    $("#total-player-win-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
    $("#total-cpu-win-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
    $("#total-moves-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
    $("#macao-call-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
}

initGame();

//Init game
function initGame() {
    clearAllVariables();
    getDeck();
    showWhoStarts();
};

function clearAllVariables() {
        playerCards = [],
        cpuCards = [],
        deck = [],
        pile = [],
        nextTurn = Math.round(Math.random() * 1),
        availableCards = [],
        possibleCards = [],
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
        battleCardActive = 0,
        changeDemand = 0,
        winner = 0,
        gameOver = false,
        movesCount = -1;
}

function showWhoStarts() {

    renderPlayerCards();
    renderPile();
    renderCpuCards();
    const whoStartsWindow = $("#who-starts");
    while (whoStartsWindow.children().length) {
        whoStartsWindow.children().last().remove();
    }
    nextTurn ? whoStartsWindow.append(`<h4 style="color: white; margin: 10px; padding: 10px">Computer goes first</h4>`) : whoStartsWindow.append(`<h4 style="color: white; margin: 10px; padding: 10px">You go first</h4>`);
    whoStartsWindow.fadeIn(700).fadeOut(1400);
    setTimeout(renderCards, 1500);
}

function checkMacao(whoToCheck) {

    const macaoWindow = $("#macao");

    if (whoToCheck == "Player" && playerCards.length == 1 && !playerWait) {
        showMacao();
    }
    if (whoToCheck == "Computer" && cpuCards.length == 1 && !cpuWait) {
        cpuCards.length == 1 && playerCards.length == 1 ? showMacao(true) : showMacao();
    }
    function showMacao(isDouble) {
        
        while (macaoWindow.children().length) {
            macaoWindow.children().last().remove();
        }
        if (isDouble) {
            macaoWindow.stop();
            macaoWindow.append(`<h4 style="color: white; margin: 10px; padding: 10px">Player: Macao!</h4><h4 style="color: white; margin: 10px; padding: 10px">Computer: Macao!</h4>`);
            macaoCallCount += 2;
            ref.child("macaoCallCount").set(macaoCallCount);
            document.getElementById("macao-call-counter").textContent = macaoCallCount;
            $("#macao-call-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
        }
        else {
            macaoWindow.append(`<h4 style="color: white; margin: 10px; padding: 10px">${whoToCheck}: Macao!</h4>`);
            macaoCallCount += 1;
            ref.child("macaoCallCount").set(macaoCallCount);
            document.getElementById("macao-call-counter").textContent = macaoCallCount;
            $("#macao-call-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
        }
        macaoWindow.fadeIn(600).fadeOut(900);
    }
}

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
    checkMacao("Player");
    movesCount += 1;
    totalMovesCount += 1;
    renderPile();
    checkCardsToTake();
    renderPlayerCards();
    if (!gameOver) {
        checkWin();
    }
    if (!winner) {
        cpuMove();
    }
    if (!gameOver) {
        checkWin();
    }
    checkMacao("Computer");
    renderPile();
    renderCpuCards();
    updateCardsCounter();
    checkCardsToTake();
    if (!winner) {
        checkAvailableCards();
    }
}

function updateCardsCounter() {
    updateLastCard();
    $('#deckCounter').empty();
    $('#pileCounter').empty();

    while ($(".message").children().length > 1) {
        $(".message").children().last().remove();
        $(".message").fadeOut(200);
    }
    let realCardsToTake = cardsToTake - 1;
    let turnsToWait;

    cpuWait > 1 || playerWait > 1 ? turnsToWait = "turns" : turnsToWait = "turn";
    cardsToTake > 1 ? $('.message').append(`<span>Cards to take: ${realCardsToTake}</span>`) : null;
    waitTurn ? $('.message').append(`<span>Turns to wait: ${waitTurn} </span>`) : null;
    cpuWait ? $('.message').append(`<span>CPU has to wait ${cpuWait} ${turnsToWait}</span>`) : null;
    playerWait ? $('.message').append(`<span>You have to wait ${playerWait} ${turnsToWait}</span>`) : null;
    jackActive ? $('.message').append(`<span>Demanded card: ${chosenType}</span>`) : null;
    lastCard.type == "ace" ? $('.message').append(`<span>Computer changed color to ${chosenWeight}</span>`) : null;
    lastCard.type == "jack" && !jackActive ? $('.message').append(`<span>No demand</span>`) : null;
    $(".message").children().length > 1 ? $(".message").animate({ fontSize: '18px' }, 200).animate({ fontSize: '16px' }, 200).css("display", "inline-block") : null;
    $("#moves-count").html(movesCount);
    $("#total-moves-counter").html(totalMovesCount)
}

//CPU move
function cpuMove() {
    sortCards(cpuCards);

    //Do nothing if its not CPU`s turn
    if (!nextTurn) return

    //console.log(cpuCards);

    let cardsToUse = [],
        cpuAvailableCards = [],
        typeToUse;

    lastCard.type == 'ace' ? cpuAvailableCards = cpuCards.filter((card) => card.weight == chosenWeight || card.type == lastCard.type) : cpuAvailableCards = cpuCards.filter((card) => card.weight == lastCard.weight || card.type == lastCard.type);

    if (jackActive) {
        cpuAvailableCards = cpuCards.filter((card) => "jack" == card.type || card.type == chosenType);
    }
    //console.log(cpuAvailableCards);

    //IF CPU does have available cards
    if (cpuAvailableCards.length) {
        //console.log("cpu had available cards");

        //Map all cards to get information about cards of same type & weight
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

        let neutralCards = cpuPossibleMoves.filter((card) => {
            return card.type == "5" || card.type == "6" || card.type == "7" || card.type == "8" || card.type == "9" || card.type == "10" || card.type == "queen" || (card.type == "king" && card.weight == "diamonds") || (card.type == "king" && card.weight == "clubs");
        });

        let battleCards = cpuPossibleMoves.filter((card) => {
            return card.type == "2" || card.type == "3" || (card.type == "king" && card.weight == "hearts") || (card.type == "king" && card.weight == "spades");
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
            return (card.type == "king" && card.weight == "diamonds") || (card.type == "king" && card.weight == "clubs");
        });

        //Use jack if one neutral card is available
        if (jacks.length && !battleCardActive && !cpuWait && neutralCards.length === 1) {
            cardsToUse = jacks;
        }

        //console.log(neutralCards);
        //console.log(battleCards);
        //console.log(fours);
        //console.log(jacks);
        //console.log(aces);

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

        //console.log(battleCardActive);
        //console.log(waitTurn);
        //console.log(neutralCards.length);

        function neutralValue() {
            if (neutralCards.length === 0 || battleCardActive || waitTurn || cpuWait) {
                return 0;
            }
            else {
                let weight = 15;
                let value = neutralCards.length * weight;
                return value
            }
        }
        function battleValue() {
            if (battleCards.length === 0 || waitTurn || cpuWait || jackActive) {
                return 0
            }
            else {
                let weight = 6;
                let value = battleCards.length * weight + Math.pow(cardsDifference, 2) / 10 * weight;
                return value
            }
        }
        function foursValue() {
            if (fours.length === 0 || battleCardActive || jackActive || cpuWait) {
                return 0;
            }
            else {
                let weight = 1;
                let foursOnPile = pile.filter(x => x.type === "4").length;
                let foursLeft = checkFours();

                function checkFours() {
                    if (4 - foursOnPile - fours.length === 0) {
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

                let value = weight * deck.length / playerCards.length;
                return value
            }
        }
        function jacksValue() {
            if (jacks.length === 0 || battleCardActive || waitTurn || cpuWait) {
                return 0;
            }
            else {
                let jacksWeight = 24;
                let jackNeutralRatio = 1
                if (neutralCards.length) {
                    jackNeutralRatio = jacksWeight / neutralCards.length;
                };
                let value = jacks.length * jackNeutralRatio + (cardsDifference / jacksWeight) * 3 + (jacksWeight / playerCards.length) * 2;
                return value
            }
        }
        function acesValue() {
            if (aces.length === 0 || battleCardActive || waitTurn || cpuWait || jackActive) {
                return 0;
            }
            else {
                let weight = 3;
                let value = (aces.length * weight) + (cpuCards.length / cpuAvailableCards.length) * weight;
                return value
            }
        }
        function kingsValue() {
            if (kings.length && ((lastCard.type == "king" && lastCard.weight == "hearts") || (lastCard.type == "king" && lastCard.weight == "spades"))) {
                return 15;
            }
            else {
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
        let max = neutralChance + battleChance + foursChance + jacksChance + acesChance + kingsChance;
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
            }
            else {
                return 0;
            }
        };

        let rand = function (min, max) {
            return Math.random() * (max - min) + min;
        };

        let randomNumber = rand(min, max);
        let weightPicked;
        if (randomNumber < neutralRange) {
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

        if (jackActive && weightPicked !== 4) {
            jackActive -= 1;
        }

        //console.log("randomNumber");
        //console.log(randomNumber);
        //console.log("neutralRange");
        //console.log(neutralRange);
        //console.log("battleRange");
        //console.log(battleRange);
        //console.log("foursRange");
        //console.log(foursRange);
        //console.log("jacksRange");
        //console.log(jacksRange);
        //console.log("acesRange");
        //console.log(acesRange);
        //console.log("kingsRange");
        //console.log(kingsRange);

        if (randomNumber == 0) {
            cpuNoCardsToUse();
        }


        else {

            //console.log("cardsToUse");
            //console.log(cardsToUse);
            let mostMoves = cardsToUse.reduce((prev, curr) => prev.possibleCardsAfter < curr.possibleCardsAfter ? prev : curr);

            //console.log("mostMoves");
            //console.log(mostMoves);

            let cpuSelectedCards = [];

            if (!mostMoves.sameTypeAmount) {
                cpuAvailableCards = [];
                cpuSelectedCards.push(mostMoves);
            }
            else {
                cpuSelectedCards = cpuCards.filter(e => e.type == mostMoves.type);
                debugger;
                //While the first selected card does not match the card on pile - move it to the end of array
                if (lastCard.type !== cpuSelectedCards[0].type && lastCard.type !== "ace" && !jackActive) {
                    while (cpuSelectedCards[0].weight !== lastCard.weight) {
                        const firstCard = cpuSelectedCards.shift();
                        cpuSelectedCards.push(firstCard);
                    }
                }
                if (chosenType !== cpuSelectedCards[0].type && lastCard.type == "ace" && !jackActive) {
                    while (cpuSelectedCards[0].weight !== chosenWeight) {
                        const firstCard = cpuSelectedCards.shift();
                        cpuSelectedCards.push(firstCard);
                    }
                }
            }
            //console.log(cpuSelectedCards);
            cpuSelectedCards.forEach((card, idx) => {
                let notCheckedYet = 1;
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
                        waitTurn += 1;
                        break;
                    case "jack":
                        if (neutralCards.length) {
                            debugger;
                            chosenType = (neutralCards.reduce((prev, curr) => prev.sameTypeAmount < curr.sameTypeAmount ? prev : curr)).type;
                            if (chosenType.type == "king") {
                                chosenType = 0;
                            }
                            //console.log("chosenType");
                            //console.log(chosenType);
                        };
                        chosenType ? jackActive = 2 : jackActive = 0;
                        break;
                    case "ace":
                        if (notCheckedYet) {
                            let cpuCardsWithoutMostMoves = [...cpuCards];
                            cpuCardsWithoutMostMoves.splice(cpuCardsWithoutMostMoves.indexOf(mostMoves), 1);
                            if (cpuCards.length > 1) chosenWeight = (cpuCardsWithoutMostMoves.reduce((prev, curr) => prev.sameWeightAmount < curr.sameWeightAmount ? prev : curr)).weight;
                            //console.log("chosenWeight");
                            //console.log(chosenWeight);
                        }
                        break;
                    case "king":
                        if (card.weight === "hearts" || card.weight === "spades" && nobodyIsWaiting()) {
                            cardsToTake += 5;
                            break;
                        }

                        //Kings of clubs and diamonds nullify amount of cards to be taken
                        else {
                            cardsToTake = 1;
                            break;
                        }
                }
                let cardForSplice = {
                    weight: card.weight,
                    type: card.type
                };

                let indexInCpuCards = cpuCards.findIndex(x => x.type == card.type && x.weight == card.weight);
                cpuCards.splice(indexInCpuCards, 1);
                pile.push(card);
            })
            cpuAvailableCards = [];
        }

    } else {
        cpuNoCardsToUse();
    }
    nextTurn = 0;
}

function cpuNoCardsToUse() {
    //console.log("no cards available");
    //Take cards from pile and shuffle the deck if there is one card left

    if (jackActive) {
        jackActive -= 1;
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
            if (cardsToTake >= deck.length) {
                let cardsForShuffle = pile;
                cardsForShuffle.pop();
                shuffleDeck(cardsForShuffle);
                deck = deck.concat(cardsForShuffle);
                pile.slice(-1);
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
        const url = 'https://bfa.github.io/solitaire-js/img/card_back_bg.png';
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

//Open rules window
$("#open-rules").click(function () {
    $('#rules').fadeIn(600);
});

$("#close-rules").click(function () {
    $('#rules').fadeOut(600);
});

$("#open-rules").attr('title', 'Macao rules');

//Confirm selected cards
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
                }
                break;
            case "jack":
                jackActive = 3;
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
        openBox('ace');
    };
    if (jackActive && changeDemand) {
        changeDemand = 0;
        openBox('jack');
    };
    selectedCards = [];
    updateLastCard();

    nextTurn = 1;

    //Decrease jack counter
    if (jackActive) {
        jackActive -= 1;
    }

    if (!aceActive && !jackActive) {
        renderCards();
    }

    if (jackActive && lastCard.type !== 'jack') {
        renderCards();
    }
});

function updateLastCard() {
    lastCard = pile[pile.length - 1];
}

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
    renderCards();
});

//Take cards from deck
$('#deck').click(function (cardFromDeck) {

    selectedCards = [];
    //Do nothing if last card was 4
    if (waitTurn || playerWait) {
        return;
    }
    else {

        //Repeat the loop as many times as there are cards to be taken
        if (cardsToTake > 1) {
            //Shuffle the deck if there are not enough cards remaining in the deck
            if (cardsToTake >= deck.length) {
                let cardsForShuffle = pile;
                cardsForShuffle.pop();
                shuffleDeck(cardsForShuffle);
                deck = deck.concat(cardsForShuffle);
                pile.slice(-1);
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
    removeAndRender();
});
$("#diamonds").click(function () {
    chosenWeight = "diamonds";
    removeAndRender();
});
$("#clubs").click(function () {
    chosenWeight = "clubs";
    removeAndRender();
});
$("#spades").click(function () {
    chosenWeight = "spades";
    removeAndRender();
});
$("#demand5").click(function () {
    chosenType = "5";
    removeAndRender();
});
$("#demand6").click(function () {
    chosenType = "6";
    removeAndRender();
});
$("#demand7").click(function () {
    chosenType = "7";
    removeAndRender();
});
$("#demand8").click(function () {
    chosenType = "8";
    removeAndRender();
});
$("#demand9").click(function () {
    chosenType = "9";
    removeAndRender();
});
$("#demand10").click(function () {
    chosenType = "10";
    removeAndRender();
});
$("#demandQ").click(function () {
    chosenType = "queen";
    removeAndRender();
});
$("#demandNone").click(function () {
    jackActive = 0;
    removeAndRender();
});

function removeAndRender() {
    removeMask();
    renderCards();
}

function restartGame() {
    $('#mask , .suit-popup').fadeOut(300, function () {
        $('#mask').remove();
    });
    removeConfetti();
    updateCardsCounter();
    initGame();
}

function openBox(boxType) {
    // Getting the variable
    let box;
    boxType === 'jack' ? box = $('#jack-box') : box = $('#ace-box');


    //Fade in the Popup and add close button
    $(box).fadeIn(300);

    //Set the center alignment padding + border
    let popMargTop = ($(box).height() + 24) / 2;
    let popMargLeft = ($(box).width() + 24) / 2;

    $(box).css({
        'margin-top': -popMargTop,
        'margin-left': -popMargLeft
    });

    addMask();
}

//Click on your own card
const pickCard = function pickCard(card) {
    const cardId = $(card).attr('id');

    //Check if clicked card is available
    availableCards.forEach((availableCard) => {

        if (availableCard.type == playerCards[cardId].type && availableCard.weight == playerCards[cardId].weight) {

            //Card has not been selected yet
            if (!selectedCards.length) {
                selectedCards.push(playerCards[cardId]);
            }
            //Available card is chosen
            else if ($(card).hasClass('available') && !$(card).hasClass('selected') && !$(card).hasClass('removed')) {
                selectedCards.push(playerCards[cardId]);
            }

            //Possible card is chosen - possible exists only if a card has been selected
            if ($(card).hasClass('possible')) {
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
    cardsToTake > 1 ? battleCardActive = 1 : battleCardActive = 0;
}

function checkWin() {
    if (!cpuCards.length) {
        winner = true;
        openWinnerBox('cpu');
        $('#waitTurn').addClass("invisible");
    }
    if (!playerCards.length) {
        throwConfetti();
        winner = true;
        openWinnerBox('player');
        $('#waitTurn').addClass("invisible");
    }
}

function openWinnerBox(whoWon) {
    // Getting the variable
    let box;
    whoWon === 'player' ? box = $('#player-win-box') : box = $('#cpu-win-box');

    if (whoWon === 'player') {
        box = $('#player-win-box');
        playerWinCounter += 1;
        totalPlayerWinCount += 1;
        ref.child("playerWinCount").set(totalPlayerWinCount);
        ref.child("totalMovesCount").set(totalMovesCount);
        document.getElementById("player-win-counter").textContent = playerWinCounter;
        document.getElementById("total-player-win-counter").textContent = totalPlayerWinCount;
        $("#player-win-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
        $("#total-player-win-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
    }
    else {
        box = $('#cpu-win-box');
        cpuWinCounter += 1;
        totalComputerWinCount += 1;
        ref.child("computerWinCount").set(totalComputerWinCount);
        ref.child("totalMovesCount").set(totalMovesCount);
        document.getElementById("cpu-win-counter").textContent = cpuWinCounter;
        document.getElementById("total-cpu-win-counter").textContent = totalComputerWinCount
        $("#cpu-win-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
        $("#total-cpu-win-counter").animate({ fontSize: '10px' }, 200).animate({ fontSize: '14px' }, 200);
    }

    function updateTotalMoves() {

    }

    gameOver = true;

    //Fade in the Popup and add close button
    $(box).fadeIn(300);

    //Set the center alignment padding + border
    let popMargTop = ($(box).height() + 24) / 2;
    let popMargLeft = ($(box).width() + 24) / 2;

    $(box).css({
        'margin-top': -popMargTop,
        'margin-left': -popMargLeft
    });

    addMask();
}

function nobodyIsWaiting() {
    return !cpuWait && !playerWait;
}

function checkAvailableCards() {

    availableCards = []; //Clear available cards
    possibleCards = []; //Clear possible cards
    updateLastCard();
    if (lastCard.type == 'ace') {
        const lastCardAfterAce = {
            type: 'ace',
            weight: chosenWeight
        }
        lastCard = Object.assign({}, lastCardAfterAce);
    }

    clearClasses();

    aceActive = 0;

    //No cards have been chosen
    if (selectedCards.length == 0) {

        playerCards.forEach((card, idx) => {

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
                    availableCards.push(playerCards[idx]);
                }
            }

            //Make 4 available if it was used
            if (card.type == '4' && !jackActive && waitTurn && !battleCardActive) {
                availableCards.push(playerCards[idx]);
            }

            //Jack demand is active
            if (card.type == chosenType && jackActive && !waitTurn && !battleCardActive) {
                availableCards.push(playerCards[idx]);
            }

            //Make jack available if it was used
            if (card.type == 'jack' && jackActive && !waitTurn && !battleCardActive && lastCard.type == 'jack') {
                availableCards.push(playerCards[idx]);
            }

            //No special conditions
            if (card.type == lastCard.type && !jackActive && !waitTurn && !playerWait && !battleCardActive) {
                availableCards.push(playerCards[idx]);
            }
            if (card.weight == lastCard.weight && card.type !== lastCard.type && !jackActive && !waitTurn && !playerWait && !battleCardActive) {
                availableCards.push(playerCards[idx]);
            }
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

        playerCards.forEach(function (card, idx) {

            //Get available cards with the same type as chosen card
            if (card.type == chosenCard.type) {
                availableCards.push(playerCards[idx]);
            }

            //If type or weight is the same last card and it does not have .available class and jack is not active
            if (card.type == lastCard.type || playerCards[idx].weight == lastCard.weight && !battleCardActive && !jackActive && (card.type !== chosenCard.type && card.weight !== chosenCard.weight)) {
                //And is not in availableCards yet
                possibleCards.push(playerCards[idx]);
            }

            //Make jack possible if it was used
            if (card.type == 'jack' && jackActive && !waitTurn && !playerWait) {
                possibleCards.push(playerCards[idx]);
            }
            //Make 4 possible if it was used
            if (card.type == "4" && !jackActive && waitTurn && !playerWait) {
                availableCards.push(playerCards[idx]);
            }
        });
    }

    styleAvailableCards();
    stylePossibleCards();
    styleSelectedCards();
    styleDeck();
};

function clearClasses() {
    //Clear classes
    $('#playerCards').children().removeClass("available possible selected topCard removed");
    $('#deck').removeClass("no-cards");
    //If 4 was used make wait button visible
    if (waitTurn && nextTurn == 0) {
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
}

function styleAvailableCards() {
    availableCards.forEach((availableCard) => {
        playerCards.forEach((playerCard, idx) => {
            if (availableCard.type == playerCard.type && availableCard.weight == playerCard.weight) {
                $('#playerCards').find("#" + idx).addClass("available");
            }
        });
    })
};

function stylePossibleCards() {
    possibleCards.forEach((card, idx) => {
        const cardToStyle = $('#playerCards').find("#" + idx);
        if (!cardToStyle.hasClass('available')) {
            cardToStyle.addClass('possible');
        }
    });
}

function styleSelectedCards() {
    selectedCards.forEach((selectedCard) => {
        playerCards.forEach((playerCard, idx) => {
            if (selectedCard.type == playerCard.type && selectedCard.weight == playerCard.weight) {
                $('#playerCards').find("#" + idx).addClass("selected");
            }
        });
    })
};

function styleDeck() {
    !availableCards.length && !possibleCards.length && !selectedCards.length && !playerWait ? $('#deck').addClass("available") : $('#deck').addClass("no-cards");
    if (playerWait) {
        $('#deck').removeClass("no-cards");
        $('#deck').removeClass("available");
    }
}

function addMask() {
    $('body').append('<div id="mask"></div>');
    $('#mask').fadeIn(300);
}

// throw confetti
/* Thanks to @gamanox
https://codepen.io/gamanox/pen/FkEbH
*/
function throwConfetti() {
    var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, drawCircle2, drawCircle3, i, range, xpos;

    NUM_CONFETTI = 40;

    COLORS = [[255, 255, 255], [255, 144, 0], [255, 255, 255], [255, 144, 0], [0, 277, 235]];

    PI_2 = 2 * Math.PI;

    canvas = document.getElementById("confetti");

    context = canvas.getContext("2d");

    window.w = 0;

    window.h = 0;

    window.resizeWindow = function () {
        window.w = canvas.width = window.innerWidth;
        return window.h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeWindow, false);

    window.onload = function () {
        return setTimeout(resizeWindow, 0);
    };

    range = function (a, b) {
        return (b - a) * Math.random() + a;
    };

    drawCircle = function (x, y, r, style) {
        context.beginPath();
        context.moveTo(x, y);
        context.bezierCurveTo(x - 17, y + 14, x + 13, y + 5, x - 5, y + 22);
        context.lineWidth = 3;
        context.strokeStyle = style;
        return context.stroke();
    };

    drawCircle2 = function (x, y, r, style) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 10, y + 10);
        context.lineTo(x + 10, y);
        context.closePath();
        context.fillStyle = style;
        return context.fill();
    };

    drawCircle3 = function (x, y, r, style) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 10, y + 10);
        context.lineTo(x + 10, y);
        context.closePath();
        context.fillStyle = style;
        return context.fill();
    };

    xpos = 0.9;

    document.onmousemove = function (e) {
        return xpos = e.pageX / w;
    };

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            return window.setTimeout(callback, 100 / 20);
        };
    })();

    Confetti = (function () {
        function Confetti() {
            this.style = COLORS[~~range(0, 5)];
            this.rgb = "rgba(" + this.style[0] + "," + this.style[1] + "," + this.style[2];
            this.r = ~~range(2, 6);
            this.r2 = 2 * this.r;
            this.replace();
        }

        Confetti.prototype.replace = function () {
            this.opacity = 0;
            this.dop = 0.03 * range(1, 4);
            this.x = range(-this.r2, w - this.r2);
            this.y = range(-20, h - this.r2);
            this.xmax = w - this.r;
            this.ymax = h - this.r;
            this.vx = range(0, 2) + 8 * xpos - 5;
            return this.vy = 0.7 * this.r + range(-1, 1);
        };

        Confetti.prototype.draw = function () {
            var ref;
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
            if (!((0 < (ref = this.x) && ref < this.xmax))) {
                this.x = (this.x + this.xmax) % this.xmax;
            }
            drawCircle(~~this.x, ~~this.y, this.r, this.rgb + "," + this.opacity + ")");
            drawCircle3(~~this.x * 0.5, ~~this.y, this.r, this.rgb + "," + this.opacity + ")");
            return drawCircle2(~~this.x * 1.5, ~~this.y * 1.5, this.r, this.rgb + "," + this.opacity + ")");
        };

        return Confetti;

    })();

    confetti = (function () {
        var j, ref, results;
        results = [];
        for (i = j = 1, ref = NUM_CONFETTI; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
            results.push(new Confetti);
        }
        return results;
    })();

    window.step = function () {
        var c, j, len, results;
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
    var tick = function () {
        canvas.style.opacity = +canvas.style.opacity + 0.01;
        if (+canvas.style.opacity < 1) {
            (window.requestAnimationFrame &&
                requestAnimationFrame(tick)) ||
                setTimeout(tick, 100)
        }
    };
    tick();

}

function removeConfetti() {
    $('#confetti-container').empty();
    $('#confetti-container').append(`<canvas id="confetti"></canvas>`);
}