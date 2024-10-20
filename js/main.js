// Select Element
let countSpan = document.querySelector(".quiz-info .count span");
let bullets = document.querySelector(".bullets");
let bulletsSpanContainer = document.querySelector(".bullets .spans");
let quizArea = document.querySelector(".quiz-area");
let answersArea = document.querySelector(".answers-area");
let submitButton = document.querySelector(".submit-button");
let resultsContainer = document.querySelector(".results");
let countDownElement = document.querySelector(".countdown");
let progressBar = document.querySelector(".progress-bar");

// Set Options
let currentIndex = 0;
let rightAnswer = 0;
let countDownInterval;
let isTimerStarted = false;

function getQuestions() {
  let myRequest = new XMLHttpRequest();

  myRequest.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let questionsObject = JSON.parse(this.responseText);
      let qCount = questionsObject.length;

      // Create Bullets + Set Questions Count
      createBullets(qCount);

      // Add Question Data
      addQuestionData(questionsObject[currentIndex], qCount);

      // Click On Submit
      submitButton.onclick = () => {
        // Get Right Answer
        let theRightAnswer = questionsObject[currentIndex].right_answer;

        // Increase Index
        currentIndex++;

        // Check The Answer
        checkAnswer(theRightAnswer, qCount);

        // Remove Previous Questions
        quizArea.innerHTML = "";
        answersArea.innerHTML = "";

        // Add Question Data
        addQuestionData(questionsObject[currentIndex], qCount);

        // Update Progress Bar
        updateProgressBar();

        // Handle Bullets Class
        handleBullets();

        // Show Results
        showResults(qCount);
      };
    }
  };

  myRequest.open("GET", "../questions_json/html_questions.json", true);
  myRequest.send();
}

getQuestions();

function createBullets(num) {
  countSpan.innerHTML = num;

  // Create Bullet
  for (let i = 0; i < num; i++) {
    // Create Span
    let theBullet = document.createElement("span");

    // Check If Its First Span
    if (i === 0) {
      theBullet.className = "on";
    }

    // Append Bullets To Main Bullet container
    bulletsSpanContainer.appendChild(theBullet);
  }
}

function addQuestionData(obj, count) {
  if (currentIndex < count) {
    // Create h2 Question Title
    let questionTitle = document.createElement("h2");

    // Create Question Text
    let questionText = document.createTextNode(obj["title"]);

    // Append Text To h2
    questionTitle.appendChild(questionText);

    // Append The h2 To The Quiz Area
    quizArea.appendChild(questionTitle);

    // Create The Answers
    for (let i = 1; i <= 4; i++) {
      // Create Main Answer Div
      let mainDiv = document.createElement("div");

      // Add Class To Main Div
      mainDiv.className = "answers";

      // Create Radio Input
      let radioInput = document.createElement("input");

      // Add Type + Name + id + Data-Attribute
      radioInput.name = "question";
      radioInput.type = "radio";
      radioInput.id = `answer_${i}`;
      radioInput.dataset.answer = obj[`answer_${i}`];

      // Create Label
      let theLabel = document.createElement("label");
      // Add For Attribute
      theLabel.htmlFor = `answer_${i}`;

      // Create Label Text
      let theLabelText = document.createTextNode(obj[`answer_${i}`]);
      // Add The Text To Label
      theLabel.appendChild(theLabelText);

      // Append Input + Label To Main Div
      mainDiv.appendChild(radioInput);
      mainDiv.appendChild(theLabel);

      // Append All DivS To Answers Area
      answersArea.appendChild(mainDiv);

      // Add click event on the Main Div
      mainDiv.onclick = () => {
        radioInput.checked = true; // Check the radio input

        // Start the timer only after the first answer is clicked
        if (!isTimerStarted) {
          countDown(89, count); // Start countdown
          isTimerStarted = true; // Prevent it from starting again
        }
      };
    }
  }
}

function checkAnswer(rAnswer, count) {
  let answer = document.getElementsByName("question");
  let theChosenAnswer;

  for (let i = 0; i < answer.length; i++) {
    if (answer[i].checked) {
      theChosenAnswer = answer[i].dataset.answer;
    }
  }
  if (rAnswer === theChosenAnswer) {
    rightAnswer++;
  }
}

function handleBullets() {
  let bulletsSpans = document.querySelectorAll(".bullets .spans span");
  let arrayOfSpans = Array.from(bulletsSpans);
  arrayOfSpans.forEach((span, index) => {
    if (currentIndex === index) {
      span.className = "on";
    }
  });
}

function showResults(count) {
  let theResults;
  if (currentIndex === count) {
    quizArea.remove();
    answersArea.remove();
    submitButton.remove();
    bullets.remove();
    progressBar.remove();

    if (rightAnswer > (count / 2 && rightAnswer < count)) {
      theResults = `<span class = "good">Good</span>, ${rightAnswer} From ${count} Is Good`;
    } else if (rightAnswer === count) {
      theResults = `<span class = "perfect">Perfect</span>, All Answers Is Good`;
    } else {
      theResults = `<span class = "bad">Bad</span>, ${rightAnswer} From ${count}`;
    }

    resultsContainer.style.display = "block";
    resultsContainer.innerHTML = theResults;
    resultsContainer.style.padding = "10px";
    resultsContainer.style.backgroundColor = "#fff";
    resultsContainer.style.marginTop = "10px";
  }
}

function countDown(duration, count) {
  if (currentIndex < count) {
    let minutes, seconds;
    countDownInterval = setInterval(function () {
      minutes = parseInt(duration / 60);
      seconds = parseInt(duration % 60);

      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;

      countDownElement.innerHTML = `${minutes}:${seconds}`;

      if (duration < 30) {
        countDownElement.classList.add("low-time");
      } else if (duration > 30) {
        countDownElement.classList.remove("low-time");
      }

      if (--duration < 0) {
        clearInterval(countDownInterval);
        submitButton.click();

        quizArea.remove();
        answersArea.remove();
        submitButton.remove();
        bullets.remove();
        progressBar.remove();

        let timeOutMessage = `<span class='bad'>Time's up!</span> You didn't finish in time. You answered ${rightAnswer} out of ${count} questions.`;
        resultsContainer.style.display = "block";
        resultsContainer.innerHTML = timeOutMessage;
        resultsContainer.style.padding = "10px";
        resultsContainer.style.backgroundColor = "#fff";
        resultsContainer.style.marginTop = "10px";
      }
    }, 1000);
  }
}

function updateProgressBar() {
  let progress = (currentIndex / countSpan.innerHTML) * 100;
  document.querySelector(".progress").style.width = `${progress}%`;
}
