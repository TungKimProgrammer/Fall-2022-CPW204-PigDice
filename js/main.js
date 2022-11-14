window.onload = function () {
    var newGameBtn = getByID("new_game");
    newGameBtn.onclick = createNewGame;
    getByID("roll").onclick = rollDie;
    getByID("hold").onclick = holdDie;
};
var Player = (function () {
    function Player(playerName, playerTotalScore) {
        this.name = playerName;
        this.totalScore = playerTotalScore;
    }
    return Player;
}());
var playerList = [];
var Game = (function () {
    function Game(currTurnPlayer, currTurnTotalScore, currGameState) {
        this.currTurnPlayer = currTurnPlayer;
        this.currTotalScore = currTurnTotalScore;
        this.currGameState = currGameState;
    }
    return Game;
}());
var currGame;
function generateRandomValue(minValue, maxValue) {
    var random = Math.floor(Math.random() * (maxValue + 1 - minValue) + minValue);
    return random;
}
function changePlayers() {
    var currentPlayerName = getByID("current").innerText;
    var j = 0;
    for (var i = 0; i < playerList.length - 1; i++) {
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
function createNewGame() {
    getByID("errMsg").innerText = "";
    resetData();
    var player1Name = getInputValueByID("player1").toUpperCase();
    var player2Name = getInputValueByID("player2").toUpperCase();
    if (isValid()) {
        (getInputByID("score1")).value = "0";
        (getInputByID("score2")).value = "0";
        getByID("turn").classList.add("open");
        getByID("total").value = "0";
        getByID("player1").setAttribute("disabled", "disabled");
        getByID("player2").setAttribute("disabled", "disabled");
        var player1 = new Player(player1Name, 0);
        playerList.push(player1);
        var player2 = new Player(player2Name, 0);
        playerList.push(player2);
        currGame = new Game(playerList[0].name, playerList[0].totalScore, true);
        getByID("current").innerText = currGame.currTurnPlayer;
        getByID("total").innerText = currGame.currTotalScore.toString();
        textToSpeech(currGame.currTurnPlayer + "'s turn. Please start rolling");
        freezeButtons(3);
    }
}
function rollDie() {
    if (currGame.currGameState) {
        getInputByID("errMsg").value = "";
        var currTotal = parseInt(getInputValueByID("total"));
        var roll = generateRandomValue(1, 6);
        getByID("dice-spinning").classList.add("hide");
        getByID("dice-shake").classList.add("shake");
        setTimeout(function () {
            getByID("dice-shake").classList.remove("shake");
            getByID("dice-spinning").classList.remove("hide");
        }, 2000);
        getByID("white-flag").classList.remove("show");
        if (roll == 1) {
            playAudio("rolling-dice");
            setTimeout(function () { textToSpeech("uh oh. Next player please!"); }, 1000);
            getByID("white-flag").classList.add("show");
            setTimeout(function () { getByID("white-flag").classList.remove("show"); }, 4000);
            setTimeout(function () { changePlayers(); }, 3500);
            freezeButtons(3);
        }
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
function holdDie() {
    var currTotal = parseInt(getInputValueByID("total"));
    for (var i = 0; i < playerList.length; i++) {
        if (currGame.currTurnPlayer == playerList[i].name) {
            playerList[i].totalScore += currTotal;
            document.getElementById("score" + (i + 1)).value = playerList[i].totalScore.toString();
        }
    }
    getInputByID("die").value = "";
    getInputByID("total").value = "0";
    textToSpeech("Next player please!");
    freezeButtons(2);
    setTimeout(function () { changePlayers(); }, 2000);
}
function isValid() {
    getByID("errMsg").innerText = "";
    var player1Name = getInputValueByID("player1").toUpperCase();
    var player2Name = getInputValueByID("player2").toUpperCase();
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
function resetData() {
    getInputByID("score1").value = "";
    getInputByID("score2").value = "";
    getInputByID("die").value = "";
    getInputByID("total").value = "";
    playerList = [];
}
function getByID(id) {
    return document.getElementById(id);
}
function getInputByID(id) {
    return getByID(id);
}
function getInputValueByID(id) {
    return getByID(id).value;
}
function castByID(id) {
    return getByID(id);
}
function textToSpeech(text) {
    var msg = new SpeechSynthesisUtterance();
    msg.text = text;
    window.speechSynthesis.speak(msg);
}
function freezeButtons(second) {
    getInputByID("roll").disabled = true;
    getInputByID("hold").disabled = true;
    setTimeout(function () { enableButtons(); }, second * 1000);
}
function enableButtons() {
    getInputByID("roll").disabled = false;
    getInputByID("hold").disabled = false;
}
function playAudio(id) {
    var x = getByID(id);
    x.play();
}
