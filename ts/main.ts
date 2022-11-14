window.onload = function () {
    let newGameBtn = getByID("new_game");
    newGameBtn.onclick = createNewGame;

    getByID("roll").onclick = rollDie;

    getByID("hold").onclick = holdDie;
}

class Player {
    name: string;
    totalScore: number;

    constructor(playerName: string, playerTotalScore: number) {
        this.name = playerName;
        this.totalScore = playerTotalScore;
    }
}

// create list of players if expanding to more than 2 players in needs
var playerList: Player[] = [];

class Game {
    currTurnPlayer: string;
    currTotalScore: number;
    currGameState: boolean; // true for ongoing, false for over

    constructor(currTurnPlayer: string, currTurnTotalScore: number, currGameState: boolean) {
        this.currTurnPlayer = currTurnPlayer;
        this.currTotalScore = currTurnTotalScore;
        this.currGameState = currGameState;
    }
}

var currGame: Game;

/**
 * generate a random value for rolling dice
 * @param minValue 1
 * @param maxValue 6
 * @returns value from minValue to maxValue
 */
function generateRandomValue(minValue: number, maxValue: number): number {
    // use random to generate a number between min and max
    var random = Math.floor(Math.random() * (maxValue + 1 - minValue) + minValue);
    return random;
}

/**
 * switch player when dice hits 1
 */
function changePlayers(): void {
    let currentPlayerName = getByID("current").innerText;

    // swap from player to player by comparing current name to player names
    // set currentPlayerName to the next player
    // go through the list of players (to the second last player)
    // to find position/index of current player, change current player to next
    // if current player is last player, next one is first in list.
    let j = 0;
    for (let i = 0; i < playerList.length - 1; i++) {
        if (currentPlayerName == playerList[i].name) {
            j = i + 1;
        }
    }
    currentPlayerName = playerList[j].name;
    currGame = new Game(currentPlayerName, playerList[j].totalScore, true);
    getByID("current").innerText = currentPlayerName;
    getInputByID("die").value = "";
    getInputByID("total").value = "0";
}

/**
 * creates a new game 
 */
function createNewGame() {
    //verify each player has a name
    //if both players don't have a name display error
    //if both players do have a name start the game!
    getByID("errMsg").innerText = "";
    resetData();
    let player1Name = getInputValueByID("player1").toUpperCase();
    let player2Name = getInputValueByID("player2").toUpperCase();
    if (isValid()) {
        //set player 1 and player 2 scores to 0
        (getInputByID("score1")).value = "0";
        (getInputByID("score2")).value = "0";
        getByID("turn").classList.add("open");
        (<HTMLInputElement>getByID("total")).value = "0";

        //lock in player names and then change players
        getByID("player1").setAttribute("disabled", "disabled");
        getByID("player2").setAttribute("disabled", "disabled");

        // add players to player list
        let player1 = new Player(player1Name, 0);
        playerList.push(player1);
        let player2 = new Player(player2Name, 0);
        playerList.push(player2);

        // create first game for first player on player list
        currGame = new Game(playerList[0].name, playerList[0].totalScore, true);
        getByID("current").innerText = currGame.currTurnPlayer;
        getByID("total").innerText = currGame.currTotalScore.toString();
        textToSpeech(currGame.currTurnPlayer + "'s turn. Please start rolling");
        freezeButtons(3);
    }

}

function rollDie(): void {
    if (currGame.currGameState) {
        getInputByID("errMsg").value =  "";
        let currTotal = parseInt(getInputValueByID("total"));

        //roll the die and get a random value 1 - 6 (use generateRandomValue function)
        let roll = generateRandomValue(1, 6);

        // show another picture when roll button click
        getByID("dice-spinning").classList.add("hide");
        getByID("dice-shake").classList.add("shake");
        
        // return to previous picture after certain time
        setTimeout(() => { 
            getByID("dice-shake").classList.remove("shake");
            getByID("dice-spinning").classList.remove("hide"); }, 2000);
        getByID("white-flag").classList.remove("show");

        //if the roll is 1
        //  change players
        //  set current total to 0
        if (roll == 1) {
            playAudio("rolling-dice");
            setTimeout(() => { textToSpeech("uh oh. Next player please!"); }, 1000);
            // display a picture for a certain time
            getByID("white-flag").classList.add("show");
            setTimeout(() => { getByID("white-flag").classList.remove("show"); }, 4000);
            setTimeout(() => { changePlayers(); }, 3500);
            freezeButtons(3);
        }

        // if the roll is greater than 1
        // add roll value to current total
        // set the die roll to value player rolled
        // display current total on form
        else {
            playAudio("rolling-dice");
            getInputByID("die").value = roll.toString();
            currTotal += roll;
            getInputByID("total").value = currTotal.toString();
            if (currTotal >= 100 || currTotal + currGame.currTotalScore >= 100) {
                currGame.currGameState = !currGame.currGameState;
                getByID("announcement").innerText = "The WINNER is: " + currGame.currTurnPlayer;
                textToSpeech("The WINNER is: " + currGame.currTurnPlayer);
            }
        }
    }

}

function holdDie(): void {
    //get the current turn total
    let currTotal = parseInt(getInputValueByID("total"));

    //determine who the current player is
    //add the current turn total to the player's total score
    for (let i = 0; i < playerList.length; i++) {
        if (currGame.currTurnPlayer == playerList[i].name) {
            playerList[i].totalScore += currTotal;
            (<HTMLInputElement>document.getElementById("score" + (i + 1))).value = playerList[i].totalScore.toString();
        }
    }
    //reset the turn total to 0

    //change players
    getInputByID("die").value = "";
    getInputByID("total").value = "0";
    textToSpeech("Next player please!");
    freezeButtons(2);
    //changePlayers();
    setTimeout(() => {  changePlayers(); }, 2000);

}

function isValid(): boolean {
    getByID("errMsg").innerText = "";
    let player1Name = getInputValueByID("player1").toUpperCase();
    let player2Name = getInputValueByID("player2").toUpperCase();
    if (player1Name !== "" &&
        player2Name !== "" &&
        player1Name !== player2Name) {
        return true;
    }
    else {
        if (player1Name == "" || player2Name == "") {
            getByID("errMsg").innerText = "Players' names can't be empty!";
            textToSpeech("Players' names can't be empty!");
        }
        else if (player1Name == player2Name) {
            getByID("errMsg").innerText = "Players should have identical names";
            textToSpeech("Players should have identical names");
        }
        return false;
    }
}

function resetData(): void {
    getInputByID("score1").value = "";
    getInputByID("score2").value = "";
    getInputByID("die").value = "";
    getInputByID("total").value = "";
    playerList = [];
}

/**
 * short version of document.getElementById()
 * @param id of HTML element
 * @returns document.getElementById(id); 
 */
function getByID(id: string) {
    return document.getElementById(id);
}

/**
 * short version of (<HTMLInputElement>document.getElementById()).value
 * @param id of input textbox
 * @returns value of input textbox
 */
function getInputByID(id: string) {
    return <HTMLInputElement>getByID(id);
}

/**
 * short version of (<HTMLInputElement>document.getElementById()).value
 * use one way to retrieve the data, not to insert
 * @param id of input textbox
 * @returns value of input textbox
 */
function getInputValueByID(id: string) {
    return (<HTMLInputElement>getByID(id)).value;
}

/**
 * short version of (<HTMLElement>document.getElementById())
 * @param id of HTML element
 * @returns <HTMLElement>document.getElementById()
 */
function castByID(id: string) {
    return (<HTMLElement>getByID(id));
}

/**
 * function that converts text to speech
 * @param {*} text is the content to be read out loud
 */
 function textToSpeech(text:string) {
    var msg = new SpeechSynthesisUtterance();
    msg.text = text;
    window.speechSynthesis.speak(msg);
}

function freezeButtons(second: number) {
    getInputByID("roll").disabled = true;
    getInputByID("hold").disabled = true;
    setTimeout(() => { enableButtons(); }, second * 1000);
}

function enableButtons(){
    getInputByID("roll").disabled = false;
    getInputByID("hold").disabled = false;
}

// Create function to play audio
function playAudio(id:string) {
    var x = <HTMLAudioElement>getByID(id);
    x.play();
}