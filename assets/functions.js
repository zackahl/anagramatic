/*jslint browser: true*/
/*jshint esnext: true*/
/*jshint sub: true*/
/*global $, moment*/

// Create game object
var gameObject = {};

// Allow user to press enter to check word
$("#userInput").keyup(function(event){
    if(event.keyCode == 13){
        $("#checkWord").click();
    }
});
// Allow user to press spacebar to load new word
    $("#userInput").keyup(function(event){
    if(event.keyCode == 32){
        $("#newWord").click();
        $('#userInput').val("");
    }
});

//--------- Access dictionary words on page load --------//
$( document ).ready(function() {
    $.get("https://raw.githubusercontent.com/dwyl/english-words/master/words.txt", function(data) {
        // Create array containing words
        var words = data.split("\n");
        var wordsArray = [];
        for(var i = 0; i < words.length; i++) {
            // Only add words of length [3-8] containing letters only
            if(words[i].length > 2 && words[i].length < 9 && /^[a-zA-Z]+$/.test(words[i])) { 
                wordsArray.push(words[i].toUpperCase());
            }
        }
        // Create gameObject propertys
        gameObject.dictionary = wordsArray;
        gameObject.userWords = [];
        gameObject.score = 0;
        gameObject.bestScore = 0;

        // Set default values on page load
        $("#score").text("Score: " + gameObject.score);
        $("#countdown").text("Time: 1:00");
        $("#currentBestScore").text(localStorage.getItem("bestScore"));

        // Create random word
        newWord();

        // Loading animation
        if(gameObject.currentWordLength > 0) {
            $('#loader').hide();
        }
    });
});

//--------- Generate a new random word ----------//
var newWord = function() {
    // Randomly output a new word
    var numRand = Math.floor((Math.random() * gameObject.dictionary.length) + 1);
    $("#randomWord").text(gameObject.dictionary[numRand]);

    // Create gameObject properties
    gameObject.currentWord = gameObject.dictionary[numRand];
    gameObject.currentWordLength = gameObject.currentWord.length;                       
};
$("#newWord").on("click", function() {
	newWord();
});

//--------- Check user input is a valid word --------//
var checkWord = function() {

    // Seperate arrays for different length words
		var threeChars = [];
    var fourChars = [];
    var fiveChars = [];
    var sixChars = [];
    var sevenChars = [];
    var eightChars = [];

    // Push words into seperate arrays
    for(var i = 0; i < gameObject.dictionary.length; i++) {
        switch(gameObject.dictionary[i].length) {
						case 3:
                threeChars.push(gameObject.dictionary[i]);
                break;
            case 4:
                fourChars.push(gameObject.dictionary[i]);
                break;
            case 5:
                fiveChars.push(gameObject.dictionary[i]);
                break;
            case 6:
                sixChars.push(gameObject.dictionary[i]);
                break;
            case 7:
                sevenChars.push(gameObject.dictionary[i]);
                break;
            case 8:
                eightChars.push(gameObject.dictionary[i]);
                break;
        }
    }

    // Create user input variables
    var ui = $('#userInput').val().toUpperCase();
    var uiLength = ui.length;
    var abc = "";
    var valid = false;
    var duplicateChar = false;

    // Validate that only characters within the original word are used
    for(var a = 0; a < uiLength; a++) {
        for(var b = 0; b < gameObject.currentWordLength; b++) {
            if(ui[a] === gameObject.currentWord[b]) {

                abc += gameObject.currentWord[b];

                // If user input uses only the available characters
                if(ui === abc) {
                    valid = true;
                }

                // Count the number of each character in a word i.e how many a's there are
                var reg1 = new RegExp(ui[a],"g");
                var reg2 = new RegExp(gameObject.currentWord[b],"g");

                // If user input uses only the correct amount of each character
                if((ui.match(reg1).length <= gameObject.currentWord.match(reg2).length) === false) {
                    valid = false;
                    duplicateChar = true;
                    a = uiLength;
                }

                b = gameObject.currentWordLength;
            }
        }
    }

    // Clear messages
    $("#messages").text("");

    // Error validation
    $("#messages").removeClass("success");
    $("#messages").addClass("error");
    if(uiLength > 0) {
        // Too many of the same character
        if(duplicateChar === true) {
            $("#messages").text("You can only use the letters avaiable.");
            valid = false;  
        }
        // Invalid word
        else if(valid !== true) {
            $("#messages").text("Words must only contain letters from the above word.");
        }
        // Word identical to origanl word
        else if(ui === gameObject.currentWord) {
            $("#messages").text("Words must differ from original word.");
            valid = false;    
        }
         // Word too long
        else if(uiLength > 8) {
            $("#messages").text("Word is too long.");
            valid = false; 
        }
        //Word too short
        else if(uiLength < 3) {
            $("#messages").text("Word is too short.");
            valid = false; 
        }
        // Word already used
        for(var c = 0; c <= gameObject.userWords.length; c++) {
            if(ui === gameObject.userWords[c]) {
                $("#messages").text(ui + " has already been used.");
                valid = false;
            }
        }
    }
    else {
        // No user input
        $("#messages").text("No word entered.");
        valid = false;   
    }

    // If valid characters then validate word exists
    if(valid) {
			var points = 0;
			var isAnagram = false;
			// Assign points to complexity of word
			switch(uiLength) {
					case 3:
							if(threeChars.indexOf(ui) >= 0) {
									points = 0.5;  
									gameObject.userWords.push(ui);
							}
							break;
					case 4:
							if(fourChars.indexOf(ui) >= 0) {
									points = 1;  
									gameObject.userWords.push(ui);
							}
							break;
					case 5:
							if(fiveChars.indexOf(ui) >= 0) {
									points = 2; 
									gameObject.userWords.push(ui);
							}
							break;
					case 6:
							if(sixChars.indexOf(ui) >= 0) {
									points = 3;  
									gameObject.userWords.push(ui);
							}
							break;
					case 7:
							if(sevenChars.indexOf(ui) >= 0) {
									points = 4;  
									gameObject.userWords.push(ui);
							}
							break;
					case 8:
							if(eightChars.indexOf(ui) >= 0) {
									points = 5;  
									gameObject.userWords.push(ui);
							}
							break; 
			}

			// Multiply by 5 if word is an anagram
			if(uiLength === gameObject.currentWordLength) {
				points *= 10;
				isAnagram = true;
			}

			// Display points
			if(points > 0) {
					$("#messages").removeClass("error");
					$("#messages").addClass("success");
					if (isAnagram) {
						$("#messages").text("Anagram: " + ui + " + " + points);
					} else {
						$("#messages").text(ui + " + " + points);
					}
					// Load new word
					newWord();
			}
			else {
					$("#messages").text("Not a valid word.");  
			}

			// Add to and display total score
			gameObject.score += points;
			$("#score").text("Score: " + gameObject.score);
    }

    // Display user's list of words
    $("#words").text(gameObject.userWords.join(', '));   

    // Display message
    $('#messages').fadeIn('fast');
    setTimeout(function() {
        $('#messages').fadeOut('fast');
    }, 2000);

    // Clear user input on click
    $('#userInput').val("");
};
$("#checkWord").on("click", function() {
	checkWord();
});

// Create countdown object
var countdownObj = {};

//--------- Start new game ---------//
var startGame = function() {
	
		$('#userInput').focus();

    // Clear variables
    gameObject.score = 0;
    $("#score").text("Score: " + gameObject.score);
    gameObject.userWords = [];
    $("#words").text(gameObject.userWords);
    newWord();

    // Set game countdown
    countdownObj.time = 60;
    countdownObj.duration = moment.duration(countdownObj.time, 'seconds');
    countdownObj.interval = 1000;
    countdownObj.countdown = setInterval(function() {
        countdownObj.duration = moment.duration(countdownObj.duration.asMilliseconds() - countdownObj.interval, 'milliseconds');
        // Display the timer
        $('#countdown').text("Time: " + moment(countdownObj.duration.asMilliseconds()).format('m:ss'));
        // Gameover message
        if(countdownObj.duration.asSeconds() === 0) {
            $('#randomWord').text("GAME OVER!");
            clearInterval(countdownObj.countdown);

            // Display best score
            if(gameObject.score > gameObject.bestScore) {
                gameObject.bestScore = gameObject.score;
								// Save best score locally
								localStorage.setItem("bestScore", gameObject.bestScore);
            }
            $('#currentBestScore').text(localStorage.getItem("bestScore"));

        }
    }, countdownObj.interval); 

    // Toggle end game button
    $('#startGame').hide();
    $('#endGame').show();
};
$("#startGame").on("click", function() {
	startGame();
});

//--------- End current game ---------//
var endGame = function() {

    // Clear the countdown
    clearInterval(countdownObj.countdown);

    // Clear variables
    gameObject.score = 0;
    $("#score").text("Score: " + gameObject.score);
    gameObject.userWords = [];
    $("#words").text(gameObject.userWords);

    // Reset timer to 1 minute
    $('#countdown').text("Time: 1:00");

    // Toggle new game button
    $('#startGame').show();
    $('#endGame').hide();
};
$("#endGame").on("click", function() {
	endGame();
});

//--------- Reset Best Score ---------//
$("#resetBestScore").on("click", function() {
	gameObject.bestScore = 0;
	localStorage.setItem("bestScore", gameObject.bestScore);
	$('#currentBestScore').text(localStorage.getItem("bestScore"));
});