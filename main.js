// import Deck from "./deck.js"

/* ************************************************* */
/*                    Deck                           */
/* ************************************************* */
class Deck {
    //constructor
  constructor(cards = freshDeck()) {
    //creates a fresh deck for every deck class
    //cards will be in order, must shuffle
    this.cards = cards
  }

  //get methods
  get numberOfCards() {
    return this.cards.length
  }





  draw() {
    return this.cards.shift()
  }

  // push(card) {
  //   this.cards.push(card)
  // }


  //SHUFFLE
  //Math.random is not random enough
  shuffle() {
    for (let i = this.numberOfCards - 1; i > 0; i--) {
      //switches card in deck array with a random one that has already been selected
      const newIndex = Math.floor(Math.random() * (i + 1))
      const oldValue = this.cards[newIndex]
      this.cards[newIndex] = this.cards[i]
      this.cards[i] = oldValue
    }
  }

  // const SUITS = ["♠", "♣", "♥", "♦"]

  test() {
    this.cards[0] = new Card("♣" ,"Q")
    this.cards[1] = new Card("♥" ,"Q")
    this.cards[2] = new Card("♦" ,"Q")
    this.cards[3] = new Card("♣" ,"5")
    this.cards[4] = new Card("♠" ,"Q")
    this.cards[5] = new Card("♣" ,"2")
    this.cards[6] = new Card("♠" ,"2")
    this.cards[7] = new Card("♥" ,"2")
    this.cards[8] = new Card("♠" ,"5")
    this.cards[9] = new Card("♠" ,"J")
    this.cards[10] = new Card("♠" ,"K")
    this.cards[11] = new Card("♠" ,"K")
    this.cards[12] = new Card("♠" ,"10")
    this.cards[13] = new Card("♣" ,"10")
    this.cards[14] = new Card("♠" ,"K")
    this.cards[15] = new Card("♦" ,"2")
    this.cards[16] = new Card("♦" ,"K")
    this.cards[17] = new Card("♦" ,"A")
  }


}


/* ************************************************* */
/*                   Cards                           */
/* ************************************************* */
class Card {
  constructor(suit, value) {
    this.suit = suit
    this.value = value
  }

  get color() {
    return this.suit === "♣" || this.suit === "♠" ? "black" : "red"
  }

  getHTML() {
    const cardDiv = document.createElement("div")
    cardDiv.innerText = this.suit
    cardDiv.classList.add("card", "flex-center", "front", this.color)
    cardDiv.dataset.value = `${this.value} ${this.suit}`
    return cardDiv
  }
}

/* ************************************************* */
/*                    PLAYERS                          */
/* ************************************************* */
class Player {

  //constructor
  constructor(number,hand,bank) {
    //variables
    this.hand = hand
    this.bank = bank
    this.number = number
    this.winningHand = [];
    this.hasFolded = false;
    this.hasRaised = false;
    this.hasLost = false;

    //keeps track of the current bet for calls and raises
    this.betTracker = 0;

    //previous bet to track blinds and other raises
    this.previousBet = 0;

    // card value array
    this.CARD_VALUE_MAP = {"2": 2,"3": 3, "4": 4,"5": 5,"6": 6,"7": 7,"8": 8,"9": 9,"10": 10, J: 11, Q: 12, K: 13, A: 14}
    
    //check for number
    switch(number) {
      case 1:
        this.number = "one";
        break;
      case 2:
        this.number = "two";
        break;
      case 3:
        this.number = "three";
        break;
      case 4:
        this.number = "four";
        break;
      case 5: 
        this.number = "five";
        break;
      default:
        console.log("constructor does not work");
    }

    //query selectors
    this.container = document.querySelector(`.player-${this.number}`)
    this.cardSlotOne = this.container.querySelector(`.face-up-one`)
    this.cardSlotTwo = this.container.querySelector(`.face-up-two`)
    this.cardsOne = this.container.querySelector(`.cards-one`)
    this.cardsTwo = this.container.querySelector(`.cards-two`)

  }

  //get/set methods
  get hand() {
    return this._hand
  }
  
  set hand(hand) {
    this._hand = hand
  }

  get bank() {
    return this._bank
  }

  set bank(bank) {
    this._bank = bank
  }

  //other methods

  //Determining player hand
  checkHand() {
    if(this.checkRoyalFlush())
      return "Royal Flush"
    else if(this.checkStraightFlush())
      return "Straigh Flush"
    else if(this.checkFourOfAKind())
      return "4 of a Kind"
    else if(this.checkFullHouse())
      return "Full House"
    else if(this.checkFlush(this.hand))
      return "Flush"
    else if(this.checkStraight())
      return "Straight"
    else if(this.checkThreeOfAKind(this.hand))
      return "3 of a Kind"
    else if(this.checkTwoPair())
      return "2 Pair"
    else if(this.checkPair(this.hand))
      return "1 Pair"
    else {
      this.checkHighCard();
      return "High Card"
    }
  }



  //check functions
  checkRoyalFlush(){
     //check if theres a 10 to begin with
     if(this.hand.some(card => card.value === `10`) === false) 
     return false;

    let filteredArray = this.hand.filter(card => this.CARD_VALUE_MAP[card.value] > 9);

    return this.checkFlush(filteredArray);
  }

  checkStraightFlush() {   
    //check straight function saves filtered straight to winning hand
    if(this.checkStraight())
        //check if straight hand has a flush
        return this.checkFlush(this.winningHand)
    else
      return false;
  }

  checkFourOfAKind() {
    //sort array from highest value
    let sortedArray = this.hand.sort((a, b) => { return this.CARD_VALUE_MAP[b.value] - this.CARD_VALUE_MAP[a.value]});
    let winningHand = [];
    for(let i = 3; i < sortedArray.length; i++) {
      if(sortedArray[i].value === sortedArray[i-1].value &&
          sortedArray[i].value === sortedArray[i-2].value &&
          sortedArray[i].value === sortedArray[i-3].value) {
        winningHand.push(sortedArray[i], sortedArray[i-1], sortedArray[i-2], sortedArray[i-3]);
        this.winningHand = winningHand;
        return true;
      }
    }
    return false;
  }
  

  checkFullHouse() {
    //sort array from highest value
    let sortedArray = this.hand.sort((a, b) => { return this.CARD_VALUE_MAP[b.value] - this.CARD_VALUE_MAP[a.value]});
    let winningHand = [];
    if(this.checkThreeOfAKind(sortedArray)) {
      winningHand = this.winningHand;
      if(this.checkPair(sortedArray.filter(value => this.winningHand.indexOf(value) === -1))) {
        winningHand.forEach(card => {
          this.winningHand.push(card);
        })
        return true;
      }
    }
    return false;
  }

  checkFlush(hand) {
    if(hand.filter(card => card.suit === "♠").length >= 5) {
      this.winningHand = hand.filter(card => card.suit === "♠")
      return true;
    } else if(hand.filter(card => card.suit === "♣").length >= 5 ) {
      this.winningHand = hand.filter(card => card.suit === "♣")
      return true;
    } else if(hand.filter(card => card.suit === "♥").length >= 5) {
      this.winningHand = hand.filter(card => card.suit === "♥");
      return true;
    } else if(hand.filter(card => card.suit === "♦").length >= 5) {
      this.winningHand = hand.filter(card => card.suit === "♦");
      return true;
    } else 
      return false;

  }

  checkStraight() {
    //sort array from highest value
    let sortedArray = this.hand.sort((a, b) => { return this.CARD_VALUE_MAP[b.value] - this.CARD_VALUE_MAP[a.value]});
    let filteredArray;
    //check for straight, starting with highest value
    for(let i = 0; i < sortedArray.length; i++) {
      filteredArray = sortedArray.filter(
                      //filtering array for a straight
                      (card, index, array) => {
                        return this.CARD_VALUE_MAP[card.value] >= (this.CARD_VALUE_MAP[sortedArray[i].value] - 4)
                        && this.CARD_VALUE_MAP[card.value] <= this.CARD_VALUE_MAP[sortedArray[i].value]
                        && (!index || card.value != array[index-1].value)
                      });
      //if straight store filtered array and return true
      if(filteredArray.length === 5) {
        this.winningHand = filteredArray;
        return true;
      }
    }
    return false;
  }

  checkThreeOfAKind(hand) {
    //sort array from highest value
    let sortedArray = hand.sort((a, b) => { return this.CARD_VALUE_MAP[b.value] - this.CARD_VALUE_MAP[a.value]});
    let winningHand = [];
    for(let i = 2; i < sortedArray.length; i++) {
      if(sortedArray[i].value === sortedArray[i-1].value &&
          sortedArray[i].value === sortedArray[i-2].value) {
        winningHand.push(sortedArray[i], sortedArray[i-1], sortedArray[i-2]);
        this.winningHand = winningHand;
        return true;
      }
    }
    return false;
  }

  checkTwoPair() {
    //sort array from highest value
    let sortedArray = this.hand.sort((a, b) => { return this.CARD_VALUE_MAP[b.value] - this.CARD_VALUE_MAP[a.value]});
    let winningHand = [];
    for(let i = 1; i < sortedArray.length; i++) {
      if(sortedArray[i].value === sortedArray[i-1].value) {
        winningHand.push(sortedArray[i], sortedArray[i-1]);
      }
      if(winningHand.length === 4) {
        this.winningHand = winningHand;
        return true;
      }
    }
    return false;
  }

  checkPair(hand) {
     //sort array from highest value
     let sortedArray = hand.sort((a, b) => { return this.CARD_VALUE_MAP[b.value] - this.CARD_VALUE_MAP[a.value]});
     let winningHand = [];
     for(let i = 1; i < sortedArray.length; i++) {
        if(sortedArray[i].value === sortedArray[i-1].value) {
          winningHand.push(sortedArray[i], sortedArray[i-1]);
          this.winningHand = winningHand;
          return true;
        }
     }
     return false;
  }

  checkHighCard() {
    let sortedArray = this.hand.sort((a, b) => { return this.CARD_VALUE_MAP[b.value] - this.CARD_VALUE_MAP[a.value]});
    this.winningHand = sortedArray;
    
  }

  cardFlipUp() {
    this.cardsOne.classList.add(this.cardsOne.classList.contains("you-cards") ? "you-card-one-flip" : "card-one-flip");
    this.cardsTwo.classList.add(this.cardsTwo.classList.contains("you-cards") ? "you-card-two-flip" : "card-two-flip");
  }
  cardFlipDown(){
    this.cardsOne.classList.remove(this.cardsOne.classList.contains("you-cards") ? "you-card-one-flip" : "card-one-flip");
    this.cardsTwo.classList.remove(this.cardsTwo.classList.contains("you-cards") ? "you-card-two-flip" : "card-two-flip");
  }

  addBetPileToHand(betPile) {
    let playerMoney = Number(this.container.querySelector(".money").innerText);
    playerMoney += betPile;
    this.container.querySelector(".money").innerText = playerMoney;
    this.container.querySelector(".money-won").innerText = betPile;

    this.bank = playerMoney;
  }

  addBetToBetPile(bet) {
    let betPile = Number(document.querySelector(".bet").innerText);
    betPile += bet;
    document.querySelector(".bet").innerText = betPile;

    this.bank -= bet;
    this.container.querySelector(".money").innerText = this.bank;
  }

  check() {
    this.container.querySelector(".player-check").classList.remove("hidden");
  }

  call() {
    this.container.querySelector(".player-call").classList.remove("hidden");

    let bet = this.betTracker - this.previousBet;
    
    if(bet > this.bank)
      bet = this.bank;

    this.addBetToBetPile(bet);
    this.previousBet = bet;
  }

  raise() {
    let randomValue;
    let maxBet = this.bank  - this.betTracker + this.previousBet;
    if(maxBet < 150)
      randomValue = Math.floor(Math.random() * maxBet) //set random value between 1 and maxBet
    else 
      randomValue = Math.floor((Math.random() + 0.25) * 120) //set random Value between 25 and 150

    let bet = this.betTracker - this.previousBet + randomValue;
    this.container.querySelector(".player-raise").classList.remove("hidden");
    this.addBetToBetPile(bet);

    this.hasRaised = true;
    this.previousBet = bet;
    this.betTracker = bet;
  }

  fold() {
    this.container.querySelector(".player-fold").classList.remove("hidden");
    this.container.querySelector(".fold").classList.remove("hidden");

    this.container.querySelector(".cards-one").innerHTML = "";
    this.container.querySelector(".cards-two").innerHTML = "";

    this.hand = [0];
    this.hasFolded = true;
  }


  //show winning player hands
  showWinningHand(betPile) {
    if(betPile === undefined)
      betPile = Math.floor(Number(document.querySelector(".bet").innerText));

    this.addBetPileToHand(betPile);
    this.toggleWinContainer();
    this.container.querySelector(".winning-hand").innerText = this.checkHand();
  }

  clearBoard() {
    //clear cards on board
    this.container.querySelector(".cards-one").innerHTML = "";
    this.container.querySelector(".cards-two").innerHTML = "";
    this.cardFlipDown();

    //hide fold 
    this.container.querySelector(".fold").classList.add("hidden");
    this.hasFolded = false;
    this.hasRaised = false;
    this.betTracker = 0;
    this.previousBet = 0;

    //reset player hands
    this.hand = [];
    this.winningHand = [];

    //toggle functions
    if(this.container.querySelector(".win-container").classList.contains("hidden") === false)
      this.toggleWinContainer();
  }

  toggleWinContainer() {
    this.container.querySelector(".win-container").classList.toggle("hidden");
  }

  hideBlinds() {
    this.container.querySelector(".player-small-blind").classList.add("hidden");
    this.container.querySelector(".player-big-blind").classList.add("hidden");
  }
}

/* ************************************************* */
/*                        YOU                        */
/* ************************************************* */
class You extends Player{

  constructor(number, hand, bank) {

    super(number, hand, bank);

    //////////////////Query Selectors///////////////////////
    this.you = document.querySelector(".you")
    this.yourTurn = document.querySelector(".your-turn-container");
    this.buttons = document.querySelector(".buttons");

    this.youCheck = this.you.querySelector(".player-check");
    this.youCall = this.you.querySelector(".player-call");
    this.youBet = this.you.querySelector(".player-bet");
    this.youRaise = this.you.querySelector(".player-raise");
    this.raiseOk = document.querySelector(".raise-ok-button");
    this.back = document.querySelector(".raise-back-button");
    this.youFold = this.you.querySelector(".player-fold");
  }

  //methods
  toggleButtonContainer() {
    this.buttons.classList.toggle("slide-in");
    this.buttons.classList.toggle("slide-out");
  }

  toggleWinContainer() {
    this.container.querySelector(".win-container").classList.toggle("hidden");
    document.querySelector(".huge-win-container").classList.toggle("hidden");
  }

  toggleCall() {
    this.buttons.querySelector(".check-button").classList.add("hidden");
    this.buttons.querySelector(".call-button").classList.remove("hidden");
  }
  toggleCheck() {
    this.buttons.querySelector(".check-button").classList.remove("hidden");
    this.buttons.querySelector(".call-button").classList.add("hidden");
  }

  //used for ties
  showWinningHand(betPile) {
    if(betPile === undefined)
      betPile = Number(document.querySelector(".bet").innerText);

    this.addBetPileToHand(betPile);
    this.toggleWinContainer();
    this.container.querySelector(".winning-hand").innerText = this.checkHand();
  }
}
/* ************************************************* */
/*                    POKER                          */
/* ************************************************* */
class Poker {

  //constructor
  constructor(deck, arrOfPlayers) {
    this.deck = deck
    this.players = arrOfPlayers
    this.numOfPlayers = this.players.length //5
    this.blinds = 5; // small blind money value

    //used to count how many community cards have been flipped
    this.communityCardCount = 0;

    //used to count which dealer number we are at
    this.dealerCount = 3;

    //used to count how many times cycle players has ran
    this.cycleCount = 0;
    
    //checks how many players have gone since someone raised. Used to end betting phase
    this.raiseCount = 0;

    //counts how many players have folded
    this.foldCount = 0;
    this.lostCount = 0;

    // card value array
    this.CARD_VALUE_MAP = {"2": 2,"3": 3, "4": 4,"5": 5,"6": 6,"7": 7,"8": 8,"9": 9,"10": 10, J: 11, Q: 12, K: 13,A: 14}
    
    //hand rankings
    this.handRankings = {
      "Royal Flush" : 10,
      "Straight Flush" : 9,
      "4 of a Kind" : 8,
      "Full House" : 7,
      "Flush" : 6,
      "Straight" : 5,
      "3 of a Kind" : 4,
      "2 Pair" : 3,
      "1 Pair" : 2,
      "High Card" : 1
    }
  }

  //methods
  
  deal(num1, num2) {
    let numOfPlayers = num1;
    let numOfCards = num2;

    if(numOfCards === 2 && numOfPlayers === this.dealerCount-1) {
      this.players[2].cardFlipUp();
      this.players.forEach(player => {
        player.hideBlinds();
      })
      return;
    }

    if(numOfPlayers === 4) {
      numOfPlayers = 0;
    } else 
      numOfPlayers++;

    if(this.players[numOfPlayers].hasLost === false) {
      this.dealCard(numOfPlayers, numOfCards);
    } else {
      if(numOfPlayers === this.dealerCount-1)
        numOfCards++;
      this.deal(numOfPlayers, numOfCards);
      return;
    }

    if(numOfPlayers === this.dealerCount-1)
      numOfCards++;

    setTimeout(() => {
      this.deal(numOfPlayers, numOfCards) 
    }, (100 * (this.lostCount + 2)))
    
  }
  async dealCard(num1, num2) {
    //draw a card from the deck
    let card = this.deck.draw();
    //store in player hand
    this.players[num1].hand.push(card);
    //store the html content into
    let cardHTML = card.getHTML();

    //create a face down div
    let faceDown = document.createElement("div");
    faceDown.classList.add("card" , "back");

    //deal card to specified player (front and back)
    this.players[num1].container.querySelector(num2 === 0 ? ".cards-one" : ".cards-two" ).appendChild(faceDown);
    this.players[num1].container.querySelector(num2 === 0 ? ".cards-one" : ".cards-two" ).appendChild(cardHTML);
  }


  // Check dealer chip 
  checkDealer() {
    let dealerNum = "";
    //change dealer chip to count
    dealerNum = this.findNumWord(this.dealerCount);

    this.toggleDealer(dealerNum);
  }

  toggleDealer(dealerNum) {//eg PlayerNum = "three"
    this.players.forEach(player => {
      if(player.container.classList.contains(`player-${dealerNum}`))
        player.container.querySelector(`.dealer-chip`).classList.remove("invisible");
      else
        player.container.querySelector(`.dealer-chip`).classList.add("invisible");
    })
  }

  //bet blinds
  betBlinds(blindCount) {

    if(blindCount > 2)
      return;
    
    this.betBlind(blindCount)
    blindCount++;
    
    setTimeout( () => {
      this.betBlinds(blindCount);
    }, 700)
  }

  
  betBlind(blindCount) {
    let count = this.dealerCount + blindCount;
    
    //check playerCount to see if blinds start at player 5
    if(count > this.numOfPlayers)
      count -= this.numOfPlayers;
    
    //check to see if players have lost
    for(let i = 0; i < this.players.length; i++) {
      if(this.players[count-1].hasLost === true) {
        count++;
        if(count > this.numOfPlayers)
          count -= this.numOfPlayers;
      } else  
        break;
    }
    console.log(count)
    //edit money of each player
    let money = Number(this.players[count-1].container.querySelector(`.money`).innerText);
    money -= (this.blinds * blindCount);
    this.players[count-1].container.querySelector(`.money`).innerText = money;
    this.players[count-1].previousBet = this.blinds * blindCount;

    //edit blinds on DOM for each player
    let blind = this.players[count-1].container.querySelector(blindCount === 1 ? ".small-blind" : ".big-blind");
    let blindContainer = this.players[count-1].container.querySelector(blindCount === 1 ? ".player-small-blind" : ".player-big-blind");
    blind.innerText = this.blinds * blindCount
    blindContainer.classList.remove("hidden");


    //edit bet pile
    let bet = Number(document.querySelector(`.bet`).innerText);
    bet += (this.blinds * blindCount);
    document.querySelector(`.bet`).innerText = bet;

    this.editBetTrackers(this.blinds * blindCount);
    this.players[count-1].bank -= (this.blinds * blindCount)
  }


  //cycle through the players until it's the player's turn
  cyclePlayers() {

     //if four players have folded, end the round
     if(this.foldCount + this.lostCount === 4) {
      setTimeout( () => {
        this.cycleCount = 0;
        this.raiseCount = 0;
        this.togglePlayerOptions();
        this.showPlayerHands();
        this.checkWin();
      })
      return;
    }

    //if all players have gone, flip community cards
    if(this.raiseCount === 5 || (this.raiseCount === 0 && this.cycleCount === 5)) {
      setTimeout( () => {
        this.cycleCount = 0;
        this.raiseCount = 0;
        this.togglePlayerOptions();
        players.forEach(player => {
          player.betTracker = 0;
          player.previousBet = 0;
        })

        if(this.communityCardCount === 0) 
          setTimeout( () => {
            this.flop();
            setTimeout( () => this.cyclePlayers(), 500)
          , 700});
        else if(this.communityCardCount === 3)
          setTimeout( () => {
            this.turn();
            setTimeout( () => this.cyclePlayers(), 500)
          , 700});
        else if(this.communityCardCount === 4)
          setTimeout( () => {
            this.river();
            setTimeout( () => this.cyclePlayers(), 500)
            , 700});
        else {
          //if all community cards have been flipped, show hands
          this.showPlayerHands();
          this.checkWin();
        }
      }, 1000);
      return;
  }

    //update counts
    if(this.raiseCount > 0)
      this.raiseCount++;

    if(this.cycleCount > (this.numOfPlayers))
      this.cycleCount = 1;
     
      this.cycleCount++;

    //set count variable for ease of reading
    let count = this.cycleCount + this.dealerCount + 2; 
    while(count > this.numOfPlayers)
      count -= this.numOfPlayers;
  
    //check if player has folded
    if(this.players[count-1].hasFolded === true || this.players[count-1].hasLost === true || this.players[count-1].bank === 0) {
      this.cyclePlayers();
      console.log("skip", this.cycleCount, this.raiseCount, count)
      return;
    }

    //do every turn until player's turn
    setTimeout( () => {

      //check to see if it's the player's turn
      if(count === 3) {

        document.querySelector(".your-turn-container").classList.remove("hidden");
        this.players[count-1].yourTurn.querySelector(".bet-to-call").classList.add("hidden")
        if(this.players[count-1].betTracker > this.players[count-1].previousBet) {
          this.players[count-1].toggleCall();
          this.players[count-1].yourTurn.querySelector(".bet-to-call").classList.remove("hidden")
          document.querySelector(".call-bet").innerText = this.players[count-1].betTracker - this.players[count-1].previousBet
        } else  
          this.players[count-1].toggleCheck();

        this.players[count-1].toggleButtonContainer();
        return;
      }

      //player AI control
      //if player doesn't need to call, randomize check, raise, or fold
      if(this.players[count-1].betTracker <= this.players[count-1].previousBet){
        let random = Math.floor(Math.random() * 100);
        if(random < 11 && this.players[count-1].hasRaised === false) {
          this.togglePlayerOptions();
          this.players[count-1].raise();
          this.editBetTrackers(this.players[count-1].betTracker);
          this.raiseCount = 1;
        } else
          this.players[count-1].check();
      } else {
        //if player needs to call, randomize raise, call, or fold
        let random = Math.floor(Math.random() * 100);
        if(random < 11 && this.players[count-1].hasRaised === false) {
          this.togglePlayerOptions();
          this.players[count-1].raise();
          this.editBetTrackers(this.players[count-1].betTracker);
          this.raiseCount = 1;
        } else if(random < 90) {
          this.players[count-1].call();
          this.editBetTrackers(this.players[count-1].betTracker);
        } else {
          this.players[count-1].fold();
          this.foldCount++;
        }
      }

      this.cyclePlayers();
    }, 1000)
  }

  flop() {
   this.dealCardtoCommunityPile(3);
  //  setTimeout( () => this.cyclePlayers(), 1500);
  }

  turn() {
    this.dealCardtoCommunityPile(1);
    // setTimeout( () => this.cyclePlayers(), 1500);
  }

  river() {
    this.dealCardtoCommunityPile(1);
    // setTimeout( () => this.cyclePlayers(), 1500);
  }

  //checking who won
  async checkWin() {
    //get array of winning hand values
    let playerWinningHands = []; //cards
    let playerHandValues = []; //value map, 1 is high card, 10 is Royal Flush
  
    this.players.forEach(player => {
      if(player.hasLost) {
        playerWinningHands.push([0]);
        playerHandValues.push(0);
      } else {
        playerWinningHands.push(player.winningHand); //stores all winningHands
        playerHandValues.push(this.handRankings[player.checkHand()]) // stores all hand values
      }
    })

    let maxIndexes = await this.findMaxIndexes(playerHandValues);
    //if only one hand has highest value, only one winner
    if(maxIndexes.length === 1) {
      this.players[maxIndexes[0]].showWinningHand();
      this.winScreen(maxIndexes[0])
      this.blinds = Math.floor(this.blinds * 1.5); 
      this.checkLose();
      return;
    } else {
      let cardValues = [];

      //if multiple hands have highest value, compare values of cards in winning hand
      for(let i = 0; i < this.players[maxIndexes[0]].winningHand.length; i++) {
        //compare values, if all equal, compare next highest cards until all values in winning
        //hand are compared
        cardValues = [];
        this.players.forEach(player => {
          if(maxIndexes.includes(this.players.indexOf(player)))
            cardValues.push(player.CARD_VALUE_MAP[player.winningHand[i].value]); //create an array of highest cards in each player's winning hand
          else 
            cardValues.push(0);
        })
        //get highest value out of cardValue array
        maxIndexes = await this.findMaxIndexes(cardValues);

        if(maxIndexes.length === 1) {
          this.players[maxIndexes[0]].showWinningHand();
          //win screen
          this.winScreen(maxIndexes[0]);
          this.blinds = Math.floor(this.blinds * 1.5); 
          this.checkLose();
          return;
        }
      }

      //if for loop finishes, hands are eqaul. Check high card next
      this.players.forEach(player => {
        if(maxIndexes.includes(this.players.indexOf(player)))
          player.checkHighCard();
      })

      for(let i = 0; i < this.players[maxIndexes[0]].winningHand.length; i++) {
        //compare values, if all equal, compare next highest cards until all values in winning
        //hand are compared
        cardValues = [];
        this.players.forEach(player => {
          if(maxIndexes.includes(this.players.indexOf(player)))
            cardValues.push(player.CARD_VALUE_MAP[player.winningHand[i].value]); //create an array of highest cards in each player's winning hand
          else 
            cardValues.push(0);
        })
        //get highest value out of cardValue array
        maxIndexes = await this.findMaxIndexes(cardValues);
        if(maxIndexes.length === 1) {
          this.players[maxIndexes[0]].showWinningHand();
          //win screen
          this.winScreen(maxIndexes[0]);
          this.blinds = Math.floor(this.blinds * 1.5); 
          this.checkLose();
          return;
        }
      }

      //if loop finishes, players tie
      console.log("Tie!")
      this.showTie(maxIndexes);
      this.tieScreen(maxIndexes);
      this.blinds = Math.floor(this.blinds * 1.5); 
      this.checkLose();
    }
  }

  checkLose() {
    this.players.forEach(player => {
      if(player.hasLost === false) 
        if(player.bank === 0 || player.bank < this.blinds*2) {
          player.container.classList.add("hidden");
          player.hasLost = true;
          this.lostCount++;

          if(player.number === "three") {
            document.querySelector(".game-over-overlay").classList.remove("hidden");
          }
        }
    })
  }


  //edits in win screen for player winner
  winScreen(index) {
    // this.toggleBlackScreen();
    this.toggleNewRoundContainer();
     //find cards that are in winning player's hand 
    // let allCards = [...document.querySelectorAll(".front")];
    // players[index].winningHand.forEach(card => {
    //   for(let i = 0; i < allCards.length; i++) {
    //     if(allCards[i].dataset.value === `${card.value} ${card.suit}`) {
    //       allCards[i].style.zIndex = 100;
    //       continue;
    //     }
    //   }
    // })
  }

  //edits in win screen for ties
  tieScreen(arrOfIndexes) {
    this.toggleNewRoundContainer();
  }


  storeCard() {
    var card;
    //draw a card from the deck
    card = this.deck.draw();
    //store in player hand
    this.players.forEach(player => {
      if(player.hasFolded === false)
        player.hand.push(card);
    })
    return card;
  }

  dealCardtoCommunityPile(num){
    var card;
    var cardHTML;
    //throwaway card
    this.deck.draw();

    for(let i = 0; i < num; i++) {
      this.communityCardCount++;

      //draw a card and add to players' hands
      card = this.storeCard();
      //store the html content into
      cardHTML = card.getHTML();

      //find out which div to append card to
      let divNum = this.findNumWord(this.communityCardCount);
      
      //create a face down div
      let faceDown = document.createElement("div");
      faceDown.classList.add("card", "back");

      //add front and back to community card div
      document.querySelector(`.community-card-${divNum}`).appendChild(faceDown);
      document.querySelector(`.community-card-${divNum}`).appendChild(cardHTML);

      this.communityCardFlipUp(document.querySelector(`.community-card-${divNum}`));
    } 
  }
  communityCardFlipUp(div) {
    div.classList.add("community-card-flip");
  }
  communityCardFlipDown(div) {
    div.classList.remove("community-card-flip");
  }
  
  //Determining player hands
  showPlayerHands() {
    this.players.forEach(player => {
      if(player.container.classList.contains("you") === false && player.hasFolded === false)
        player.cardFlipUp();
    })
  }

  showTie(arrayOfIndexes) {
    //divide betPile by number of tied players
    let betPile = Math.floor(Number(document.querySelector(".bet").innerText) / arrayOfIndexes.length); 
    //show tied player's winning hands
    this.players.forEach(player => {
      if(arrayOfIndexes.includes(this.players.indexOf(player))) {
        player.showWinningHand(betPile);
      }
    })
  }

  editBetTrackers(bet) {
    players.forEach(player => { 
      player.betTracker = bet;
     })
  }

  findNumWord(num) {
    switch(num) {
      case 1:
        return "one";
      case 2:
        return "two";
      case 3:
        return "three";
      case 4:
        return "four";
      case 5:
        return "five"; 
      default:
        console.log("communityCardDeal Error");
    }
  }

  findMaxIndexes(array) {
    //find the max values in array values
    let maxIndexes = array.reduce((maxes, n, i, arr) => {
      let cur = arr[maxes[0]]  // current max value
      if (cur === undefined || n > cur) return [i]
      return (cur === n) ? maxes.concat(i) : maxes
    }, []);

    return maxIndexes;
  }

  //closes player check, call, etc
  togglePlayerOptions() {
    this.players.forEach(player => {
      let options = [...player.container.querySelector(".player-turn").children];
      options.forEach(option => {
        option.classList.add("hidden");
      })
    })
  }

  toggleBlackScreen() {
    // document.querySelector(".win-screen").classList.toggle("hidden")
    // let allCards = document.querySelectorAll(".front")
    // winScreenExtras.forEach(screen => {
    //   screen.classList.toggle("hidden")
    // })
  }

  //toggle click anywhere notice
  toggleNewRoundContainer() {
    document.querySelector(".new-round-container").classList.toggle("hidden")
    document.querySelector(".click-for-new-round").classList.toggle("hidden")
  }
}

/* ************************************************* */
/*                  CREATING A DECK                  */
/* ************************************************* */
const SUITS = ["♠", "♣", "♥", "♦"]
const VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function freshDeck() {
  return SUITS.flatMap(suit => {
    return VALUES.map(value => {
      return new Card(suit, value)
    })
  })
}

/* ************************************************* */
/*                RUNNING GAME                       */
/* ************************************************* */


//////////////////Constants///////////////////////
//poker and players const
const players = [];
const poker = new Poker("",[]);

startGame()
//////////////////Functions///////////////////////
  
async function startGame() {
 //create a const of players
  for(let i = 0; i < 5; i++) {
    players.push( i === 2 ? new You(i+1, [], 1000) : new Player(i+1, [], 1000))
  }
   //set "you" event listeners
  setEventListeners(players[2]);

   //apply money
   players.forEach(player => {
    player.container.querySelector(".money").innerText = player.bank;
  })

  //create a poker object with players
  poker.players = players;
  poker.numOfPlayers = players.length;

  //start new round
  newRound();
}


async function newRound() {
  //create a deck
  const deck = new Deck()
  //shuffle it
  deck.shuffle() 
  // deck.test();
  
  //check dealer 
  poker.checkDealer();

  //bet blinds
  poker.betBlinds(1);

  //add deck to poker object
  poker.deck = deck;

  //deal out the cards to each player
  setTimeout( () => poker.deal(poker.dealerCount-1,0), 1500);

  //cycle through players
  setTimeout( () => poker.cyclePlayers(), 3800);
}
 
//Click to clear board and start next round
document.querySelector(".click-for-new-round").addEventListener("click", async () => {
  //clear board
  let communityCards = document.querySelector(".community-cards").querySelectorAll(".community-card");
  communityCards.forEach(card => {
    card.innerHTML = "";
    poker.communityCardFlipDown(card)
  })

  //clear player hands
  poker.players.forEach(async player => {
    await player.clearBoard();
  })

  //reset poker values
  poker.communityCardCount = 0;
  poker.dealerCount === 5 ? poker.dealerCount = 1 : poker.dealerCount++;
  for(let i = 0; poker.players.length; i++) {
    if(poker.players[poker.dealerCount].hasLost === true) {
      poker.dealerCount === 5 ? poker.dealerCount = 1 : poker.dealerCount++;
    } else  
      break;
  }
  poker.toggleNewRoundContainer();
  poker.foldCount = 0;
  
  //set betPile to 0
  document.querySelector(".bet").innerText = 0;

  //new round
  newRound();
})
/* ************************************************* */
/*                  YOUR TURN                        */
/* ************************************************* */
function setEventListeners(you) {
  //////////////////Event Listeners///////////////////////

[...you.buttons.querySelectorAll(".button")].forEach(button => {
  button.addEventListener("click", () => {
    you.yourTurn.classList.toggle("hidden");
    you.toggleButtonContainer();
    button.disabled = true;
    setTimeout(() => {button.disabled = false},2000);
  })
})

you.buttons.querySelector(".check-button").addEventListener(`click`, () => {
  you.check();
  poker.cyclePlayers();
})

you.buttons.querySelector(".call-button").addEventListener(`click`, () => {
  you.call();
  poker.editBetTrackers(you.betTracker);
  poker.cyclePlayers();
})

you.buttons.querySelector(".raise-button").addEventListener(`click`, () => {
  document.querySelector(".slider-wrapper").classList.toggle("hidden");
  if(you.bank - you.betTracker < 150)
    document.querySelector(".bet-slider").max = you.bank - you.betTracker + you.previousBet
})
you.raiseOk.addEventListener(`click`, () => {
  poker.togglePlayerOptions();
  you.youRaise.classList.toggle("hidden");
  document.querySelector(".slider-wrapper").classList.toggle("hidden");

  let bet = you.betTracker - you.previousBet + Number(document.querySelector(".slider").value);
  you.addBetToBetPile(bet);

  poker.editBetTrackers(bet);
  poker.raiseCount = 1;
  poker.cyclePlayers();

  let sliderValue = document.querySelector(".slider-value")
  let inputSlider = document.querySelector(".bet-slider")
  let raiseValue = document.querySelector(".raise-value")

  inputSlider.value = 1;
  raiseValue.innerText = inputSlider.value;
  sliderValue.style.left = 0 + "%"
  sliderValue.classList.add("show")
})
you.back.addEventListener(`click`, () => {
  document.querySelector(".slider-wrapper").classList.toggle("hidden");
  you.yourTurn.classList.toggle("hidden");
  you.toggleButtonContainer()
})

you.buttons.querySelector(".fold-button").addEventListener(`click`, () => {
  you.fold();
  poker.foldCount++;
  poker.cyclePlayers();
})

you.buttons.querySelector(".all-in-button").addEventListener(`click`, () => {
  poker.togglePlayerOptions();
  you.youRaise.classList.toggle("hidden");

  let bet = you.bank;
  you.addBetToBetPile(bet);

  poker.editBetTrackers(bet);
  poker.raiseCount = 1;
  poker.cyclePlayers();
})
}

/* ************************************************* */
/*                  SLIDER                           */
/* ************************************************* */
const slideValue = document.querySelector(".slider-value")
const inputSlide = document.querySelector(".bet-slider")
const bet = document.querySelector(".raise-value")

bet.innerText = inputSlide.value;

inputSlide.oninput = (() =>{
    let value = inputSlide.value
    let max = inputSlide.max
    bet.innerText = value
    slideValue.style.left = (value-1)/(max-1)*100 + "%" 
    slideValue.classList.add("show")
})
inputSlide.onblur = (() => {
    slideValue.classList.remove("show")
})