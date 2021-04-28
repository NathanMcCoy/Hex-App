let colorSample = null;
let answers = [];
let correctColorCode = null;
let score = 0;
let total = 0;
let inGame = false; // when false, prevents the user from picking a game button, to revent multiple presses on the same question
let gameMode = 0; // 0: pick the shown color, 1: pick the shown hex code
let gameDifficulty = 1; // 0: easy, 1: normal, 2: hard
let gameDifficulty2 = 1;
let menuDiffOpen = false;
let menuModeOpen = false;
let menuInstOpen = false;
let menuDifOp1Open = false;
let menuDifOp2Open = false;
let menuOpen = false;

//////////////////////////////////
//          ISSUES:
// 1.
// 2.
// 3.
//////////////////////////////////
//          TODO:
// 1.
// 2.
//////////////////////////////////

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// init game
window.onload = function() {
  colorSample = document.getElementById("colorSample");

  answers.push(document.getElementById("a"));
  answers.push(document.getElementById("b"));
  answers.push(document.getElementById("c"));
  answers.push(document.getElementById("d"));
  answers.push(document.getElementById("e"));
  answers.push(document.getElementById("f"));
  answers.push(document.getElementById("g"));
  answers.push(document.getElementById("h"));

  for (let i = 0; i < answers.length; i++) {
    answers[i].addEventListener("click", function() {
      markIt(this);
    });
  }
  newGame();
};

// changes the size of the menu bar (quite abruptly) at 1400px wide to keep the spacing decent
/*window.addEventListener('resize', function() {
    if(window.innerWidth <= 1600){
        console.log("TINY WINDOW");
        document.getElementById("bigGrid").style.gridTemplateColumns = "25% 70% 5%";
    }else{
        document.getElementById("bigGrid").style.gridTemplateColumns = "15% 70% 15%";
    }
});*/

// resets game variables and loads a new scoreboard / question
function newGame() {
  score = 0;
  total = 0;
  correctColorCode = null;
  updateScore();
  inGame = true;
  loadNewQuestion();
}

// creates a new question
function loadNewQuestion() {
  correctColorCode = null;
  correctColorCode = getRandomHexCode();
  setNumberOfAnswers();

  if (gameMode == 0) {
    colorSample.innerHTML = "";
    colorSample.style.backgroundColor = correctColorCode;

    let solution = Math.floor(Math.random() * Math.pow(2, gameDifficulty2 + 1));
    for (let i = 0; i < answers.length; i++) {
      answers[i].style.backgroundColor = "#000";
      if (i == solution) answers[i].innerHTML = correctColorCode;
      else answers[i].innerHTML = getRandomHexCode();
      answers[i].style.color = visibleText(answers[i]);
    }
  } else {
    colorSample.style.backgroundColor = "#444";
    colorSample.innerHTML = correctColorCode;

    let solution = Math.floor(Math.random() * Math.pow(2, gameDifficulty2 + 1));
    for (let i = 0; i < answers.length; i++) {
      answers[i].innerHTML = correctColorCode;
      if (i == solution) answers[i].style.backgroundColor = correctColorCode;
      else answers[i].style.backgroundColor = getRandomHexCode();
      answers[i].style.color = visibleText(answers[i]);
    }
  }
}

// disables the correct number of answers based on dificulty2
function setNumberOfAnswers() {
  for (let i = 0; i < 8; i++) {
    answers[i].style.visibility = "visible";
  }
  for (let i = Math.pow(2, gameDifficulty2 + 1); i < 8; i++) {
    answers[i].style.visibility = "hidden";
  }
}

// generates and returns a random hex code in a string "#aabbcc"
function getRandomHexCode() {
  let result = [];
  let hexRef = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f"
  ];
  result.push("#");
  if (correctColorCode == null || gameDifficulty == 1) {
    for (let i = 0; i < 6; i++) {
      result.push(hexRef[Math.floor(Math.random() * 16)]);
    }
  } else {
    if (gameDifficulty == 0) {
      for (let i = 0; i < 3; i++) {
        console.log("correct: " + correctColorCode);
        let tmp1 = Math.floor(Math.random() * 8) + 4;
        console.log("tmp1: " + tmp1);
        let tmp2 = parseInt(correctColorCode.charAt(i * 2 + 1), 16);
        console.log("tmp2: " + tmp2);
        let res = tmp2 + tmp1 < 16 ? tmp2 + tmp1 : tmp2 + tmp1 - 16;
        console.log("res: " + res);
        result.push(hexRef[res]);
        result.push(hexRef[Math.floor(Math.random() * 16)]);
      }
      console.log("Correct: " + correctColorCode + ", new: " + result.join(""));
    } else if (gameDifficulty == 2) {
      for (let i = 0; i < 3; i++) {
        result.push(correctColorCode.charAt(i * 2 + 1));
        result.push(hexRef[Math.floor(Math.random() * 16)]);
      }
      console.log("Correct: " + correctColorCode + ", new: " + result.join(""));
    }
  }
  if (result.join == correctColorCode) return getRandomHexCode();

  return result.join("");
}

// determines whether the option the user pressed is correct
// also handles when 10 rounds have been played to restart
function markIt(elem) {
  if (inGame) {
    let gotItRight = false;
    inGame = false;
    total++;
    if (gameMode == 0) {
      if (elem.innerHTML == correctColorCode) {
        score++;
        gotItRight = true;
      }
    } else {
      if (rgbToHex(elem.style.backgroundColor) == correctColorCode) {
        score++;
        gotItRight = true;
      }
    }

    updateScore();

    setTimeout(function() {
      if (gotItRight) {
        colorSample.innerHTML = "Correct!";
        colorSample.style.color = visibleText(colorSample);
        elem.style.border = "thin solid green";
        elem.style.color = "green";
        setTimeout(function() {
          elem.style.border = null;
          elem.style.color = visibleText(elem);
        }, 1250);
      } else {
        colorSample.innerHTML = "Incorrect!";
        colorSample.style.color = visibleText(colorSample);
        elem.style.border = "thin solid red";
        elem.style.color = "red";
        let correctAns;
        if (gameMode == 0) {
          for (let i = 0; i < Math.pow(2, gameDifficulty2 + 1); i++) {
            if (answers[i].innerHTML == correctColorCode)
              correctAns = answers[i];
          }
        } else {
          for (let i = 0; i < Math.pow(2, gameDifficulty2 + 1); i++) {
            if (rgbToHex(answers[i].style.backgroundColor) == correctColorCode)
              correctAns = answers[i];
          }
        }
        correctAns.style.border = "thin solid green";
        correctAns.style.color = "green";
        setTimeout(function() {
          elem.style.border = null;
          elem.style.color = visibleText(elem);
          correctAns.style.border = null;
          correctAns.style.color = visibleText(correctAns);
        }, 1250);
      }
    }, 100);
    if (total < 10) {
      setTimeout(function() {
        loadNewQuestion();
        inGame = true;
      }, 1300);
    } else {
      setTimeout(function() {
        colorSample.innerHTML =
          '<div id="newGameButton"onClick="newGame()">Click here to restart</div>';
        document.getElementById("newGameButton").style.height = "100%";
        document.getElementById(
          "newGameButton"
        ).style.display.color = visibleText(colorSample);
      }, 1300);
    }
  }
}

// opens and closes the main menu
function displayMenu() {
  let pannel = document.getElementById("wholeMenuPannel");
  if (menuOpen) {
    pannel.style.visibility = "hidden";
    menuOpen = false;
  } else {
    pannel.style.visibility = "visible";
    menuOpen = true;
  }
}

// opens and closes menu pannels as the user clicks them
function openMenuPannel(option) {
  if (option == "dif") {
    let pannel = document.getElementById("difficultyOptions");
    if (!menuDiffOpen) {
      if (menuModeOpen) openMenuPannel("gm");
      if (menuInstOpen) openMenuPannel("inst");

      pannel.innerHTML +=
        '<div id="difOp1" class="menuSubButton" onclick="openMenuPannel(\'do1\')">Ease of Options</div>';
      pannel.innerHTML += '<span id="easeOptions"></span>';
      pannel.innerHTML +=
        '<div id="difOp2" class="menuSubButton" onclick="openMenuPannel(\'do2\')">Number of Options</div>';
      pannel.innerHTML += '<span id="difOptions"></span>';

      menuDiffOpen = true;
    } else {
      pannel.innerHTML = "";
      menuDiffOpen = false;
    }
  } else if (option == "do1") {
    let pannel = document.getElementById("easeOptions");
    if (!menuDifOp1Open) {
      if (menuDifOp2Open) openMenuPannel("do2");

      pannel.innerHTML +=
        '<div id="easyDif" class="menuSubButton" onclick="setDifficulty(1)">Easy</div>';
      pannel.innerHTML +=
        '<div id="normalDif" class="menuSubButton" onclick="setDifficulty(2)">Normal</div>';
      pannel.innerHTML +=
        '<div id="hardDif" class="menuSubButton" onclick="setDifficulty(3)">Hard</div>';

      menuDifOp1Open = true;
    } else {
      pannel.innerHTML = "";
      menuDifOp1Open = false;
    }
  } else if (option == "do2") {
    let pannel = document.getElementById("difOptions");

    if (!menuDifOp2Open) {
      if (menuDifOp1Open) openMenuPannel("do1");

      pannel.innerHTML +=
        '<div id="easyDif" class="menuSubButton" onclick="setOtherDifficulty(1)">Easy (2)</div>';
      pannel.innerHTML +=
        '<div id="normalDif" class="menuSubButton" onclick="setOtherDifficulty(2)">Normal (4)</div>';
      pannel.innerHTML +=
        '<div id="hardDif" class="menuSubButton" onclick="setOtherDifficulty(3)">Hard (8)</div>';

      menuDifOp2Open = true;
    } else {
      pannel.innerHTML = "";
      menuDifOp2Open = false;
    }
  } else if (option == "gm") {
    let pannel = document.getElementById("gameModeOption");
    if (!menuModeOpen) {
      if (menuDiffOpen) openMenuPannel("dif");
      if (menuInstOpen) openMenuPannel("inst");

      pannel.innerHTML +=
        '<div id="color" class="menuSubButton" onclick="setGameMode(1)">Pick the Color</div>';
      pannel.innerHTML +=
        '<div id="code" class="menuSubButton" onclick="setGameMode(2)">Pick the Code</div>';

      menuModeOpen = true;
    } else {
      pannel.innerHTML = "";
      menuModeOpen = false;
    }
  }
}

// just edits the scoreboard to be accurate
function updateScore() {
  document.getElementById("score").innerHTML = score + " / " + total;
}

// sets the game's difficulty
function setDifficulty(dif) {
  gameDifficulty = dif - 1;
  openMenuPannel("dif");
  newGame();
}

//sets the game's number of answers
function setOtherDifficulty(dif) {
  gameDifficulty2 = dif - 1;
  openMenuPannel("dif");
  newGame();
}

//sets the game mode and restarts
function setGameMode(mode) {
  gameMode = mode - 1;
  openMenuPannel("gm");
  newGame();
  console.log(gameMode);
}

// god forsaken way to get a hex code from the data returned by a css element
// 1 hour and 45 minutes I'll never get back ):
// https://gist.github.com/agirorn/0e740d012b620968225de58859ccef5c was helpful though tough to find
function rgbToHex(rgb) {
  let step1 = rgb.split("(");
  let step2 = step1[1].split(")");
  let step3 = step2[0].split(", ");
  let p1 = Number(step3[0]).toString(16);
  if (p1.length == 1) p1 = "0" + p1;
  let p2 = Number(step3[1]).toString(16);
  if (p2.length == 1) p2 = "0" + p2;
  let p3 = Number(step3[2]).toString(16);
  if (p3.length == 1) p3 = "0" + p3;
  return "#" + p1 + p2 + p3;
}

// checks the color of the element, and makes sure that the text has enough contrast
// returns a hex code (#000, or #fff)
function visibleText(elem) {
  let lightColors = ["f", "e", "d", "c", "b", "a", "9", "8"];
  let hex = rgbToHex(elem.style.backgroundColor);
  let numOfLightColors = 0;
  if (lightColors.includes(hex.charAt(1))) numOfLightColors++;
  if (lightColors.includes(hex.charAt(3))) numOfLightColors++;
  if (lightColors.includes(hex.charAt(5))) numOfLightColors++;
  if (numOfLightColors >= 1) {
    console.log("dark " + hex);
    return "#000";
  } else return "#fff";
}
