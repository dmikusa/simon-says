/*jslint
    browser : true, continue : true,
    devel  : true, indent  : 2,    maxerr   : 50,
    newcap : true, nomen   : true, plusplus : true,
  ￼￼￼  regexp : true, sloppy  : true, vars
    white  : true
*/

var gameButton = (function() {
    var gameInProgress = false;
    var text = 'Start';
    var gameButton = undefined;
    var start = undefined;
    var stop = undefined;

    var toggleStatus = function() {
        if (gameInProgress) {
            gameInProgress = false;
            text = 'Start';
            stop();
        } else {
            gameInProgress = true;
            text = 'Stop';
            start();
        }
        gameButton.text(text);
    };

    var isInProgress = function() {
        return gameInProgress;
    };

    var setup = function(gb, startFunc, stopFunc) {
        gameButton = gb;
        start = startFunc;
        stop = stopFunc;
        gameButton.click(toggleStatus);
    };

    return {
        setup: setup,
        isInProgress: isInProgress,
        toggleStatus: toggleStatus
    };
}());

var statusBox = (function() {
    var msgBox = undefined;

    var info = function(msg) {
        msgBox.removeClass();
        msgBox.addClass('msg-info');
        msgBox.html(msg);
    };

    var error = function(msg) {
        msgBox.removeClass();
        msgBox.addClass('msg-error');
        msgBox.html(msg);
    };

    var good = function(msg) {
        msgBox.removeClass();
        msgBox.addClass('msg-good');
        msgBox.html(msg);
    };

    var setup = function(msgElement, msg) {
        msgBox = msgElement;
        info(msg);
    };

    return {
        setup: setup,
        info: info,
        error: error,
        good: good
    };
}());

var diffCtrl = (function() {
    var radioGroup = undefined;
    var difficulty = 1000;
    var diffBump = 50;

    var getDifficulty = function() {
        return difficulty;
    };

    var nudgeHarder = function() {
        difficulty -= diffBump;
    };

    var nudgeEasier = function() {
        difficulty += diffBump;
    };

    var reset = function() {
        difficulty = radioGroup.parent().find('input:checked').val();
    };

    var clicked = function(e) {
        difficulty = $(e.target).val();
    };

    var setup = function(diffSelect) {
        radioGroup = diffSelect;
        diffSelect.each(function() {
            $(this).click(clicked);
        });
        difficulty = diffSelect.parent().find('input:checked').val();
    }

    return {
        setup: setup,
        reset: reset,
        getDifficulty: getDifficulty,
        nudgeHarder: nudgeHarder,
        nudgeEasier: nudgeEasier
    }
}());

var score = (function() {
    var value = 0;
    var roundBonus = 10;

    var reset = function() {
        value = 0;
        scoreDisplay.text(value);
    }

    var roundComplete = function() {
        value += roundBonus;
        roundBonus += 10;
        scoreDisplay.text(value);
    }

    var boxCorrect = function() {
        value += 5;
        scoreDisplay.text(value);
    }

    var setup = function(scoreSpan) {
        scoreDisplay = scoreSpan;
        value = 0;
        scoreDisplay.text(value);
    };

    return {
        setup: setup,
        reset: reset,
        boxCorrect: boxCorrect,
        roundComplete: roundComplete
    };
}());

var msgGen = (function() {
    var posMsgs = [
        "Correct!",
        "Way to Go!",
        "Good Job!",
        "You get a &#9734;",
        "Good Work!",
        "&#9786; &#9786; &#9786;",
        "&#9787; &#9787; &#9787;",
        "&#10004; &#10004; &#10004;",
        "That is correct!"
    ];

    var negMsgs = [
        "Incorrect!",
        "WRONG!",
        "Fail &#x1f433;",
        "You're &#10052; cold",
        "&#10062; &#10062; &#10062;",
        "&#9785; &#9785; &#9785;",
        "&#9760; &#9760; &#9760;",
        "&#9762; &#9762; &#9762;",
        "Nope",
        "Game over!",
        "Try again"
    ]

    var positiveMsg = function() {
        return posMsgs[Math.floor((Math.random() * posMsgs.length))];
    };

    var negativeMsg = function() {
        return negMsgs[Math.floor((Math.random() * posMsgs.length))];
    };

    var setup = function() {
    };

    return {
        setup: setup,
        positiveMsg: positiveMsg,
        negativeMsg: negativeMsg
    }
}());

/* global jQuery */
var game = (function( $ ) {

    var correctPattern = [];
    var userPattern = [];

    var generateRandomSquare = function() {
        return Math.floor((Math.random() * 4)) + 1;
    };

    var countDown = function(from) {
        var app = $("#app");
        var oneIteration = function(i) {
            app.queue(function(next) {
                statusBox.info('Starting in &#' + (9314 - i) + '; ...');
                next();
            });
            app.delay(1000);
        }
        for (var i = 0; i < from; i++) {
            oneIteration(i);
        }
    }

    var toggleBox = function(element) {
        var app = $("#app");
        var box = app.find('#box' + element);
        app.queue(function(next) {
          box.addClass('clicked');
          next();
        });
        app.delay(diffCtrl.getDifficulty());
        app.queue(function(next) {
          box.removeClass('clicked');
          next();
        });
        app.delay(diffCtrl.getDifficulty() / 2);
    }

    var playRound = function() {
        console.log('Correct pattern [' + correctPattern + ']');
        var app = $("#app");
        app.queue(function(next) {
            statusBox.info('Watch the pattern.');
            next();
        });
        app.delay(1000);
        correctPattern.forEach(function(element) {
            toggleBox(element);
        });
        app.queue(function(next) {
            statusBox.info('Go!');
            next();
        });
        userPattern = [];
        userIsPlaying = true;
    };

    var recordClick = function(e) {
        if (userIsPlaying) {
            var id = e.target.id.substr(-1);
            if (id == correctPattern[userPattern.length]) {
                userPattern.push(id);
                score.boxCorrect();
                if (correctPattern.length == userPattern.length) {
                  score.roundComplete();
                  statusBox.good(msgGen.positiveMsg());
                  correctPattern.push(generateRandomSquare());
                  diffCtrl.nudgeHarder();
                  clearAnimation();
                  $("#app").delay(1000);
                  playRound();
                }
            } else {
                statusBox.error(msgGen.negativeMsg());
                gameButton.toggleStatus();
            }
        }
    };

    var start = function() {
        correctPattern = [];
        correctPattern.push(generateRandomSquare());
        diffCtrl.reset();
        score.reset();
        countDown(3);
        playRound();
    };

    var clearAnimation = function() {
        var app = $("#app");
        app.finish();
        app.find('div').removeClass('clicked');
    };

    var stop = function() {
        correctPattern = [];
        userPattern = [];
        clearAnimation();
    };

    var setup = function(startButton, appDiv, msgBox, diffSelect, scoreSpan) {
        gameButton.setup(startButton, start, stop);
        statusBox.setup(msgBox, 'Press start to begin');
        diffCtrl.setup(diffSelect);
        score.setup(scoreSpan);
        msgGen.setup();
        appDiv.find('div').click(recordClick);
    }

    return {
        setup: setup
    };
}(jQuery));
