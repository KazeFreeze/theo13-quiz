document.addEventListener("DOMContentLoaded", () => {
  let currentQuestion = 0;
  let questions = [];
  let originalQuestions = [];
  let isShuffled = false;
  let userAnswers = [];
  let startTime;
  let timerInterval;
  let quizId = "";
  let quizTitle = "";
  let elapsedSeconds = 0;
  let quizCompleted = false;

  // Get the quiz ID from the URL hash
  function getQuizId() {
    const hash = window.location.hash;
    if (hash) {
      return hash.substring(1); // Remove the # character
    }
    return "Q1"; // Default to Q1 if no hash is present
  }

  // Handle back to menu button
  document.getElementById("backToMenu").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Fisher-Yates shuffle algorithm
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function toggleShuffle() {
    isShuffled = !isShuffled;
    const btn = document.getElementById("shuffleBtn");
    btn.textContent = isShuffled ? "Unshuffle Questions" : "Shuffle Questions";
    btn.className = isShuffled ? "active" : "";

    questions = isShuffled
      ? shuffleArray([...originalQuestions])
      : [...originalQuestions];

    currentQuestion = 0;
    userAnswers = [];
    document.getElementById("score").textContent = "";
    document.getElementById("explanation").classList.remove("show");
    document.getElementById("next").style.display = "none";
    document.getElementById("back").style.display = "none";

    // Clear any existing results
    const oldResults = document.querySelector(".results-container");
    if (oldResults) {
      oldResults.remove();
    }

    quizCompleted = false;
    showQuestion();
    createQuestionIndicators();
    stopTimer();
    startTimer();
  }

  function startTimer() {
    startTime = Date.now();
    elapsedSeconds = 0;
    timerInterval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    elapsedSeconds++;
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    document.getElementById(
      "timer"
    ).textContent = `Time elapsed: ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function calculateScore() {
    return userAnswers.reduce((acc, answer) => {
      return acc + (answer.selected === answer.correct ? 1 : 0);
    }, 0);
  }

  function createQuestionIndicators() {
    // Remove existing indicators if any
    const oldIndicators = document.querySelector(".question-indicators");
    if (oldIndicators) {
      oldIndicators.remove();
    }

    // Create new indicators container
    const indicatorsDiv = document.createElement("div");
    indicatorsDiv.className = "question-indicators";

    // Create indicator for each question
    for (let i = 0; i < questions.length; i++) {
      const indicator = document.createElement("div");
      indicator.className = "question-indicator";
      indicator.textContent = i + 1;

      // Add appropriate classes based on answer status
      if (i === currentQuestion) {
        indicator.classList.add("current");
      }

      if (userAnswers[i]) {
        indicator.classList.add("answered");
        if (userAnswers[i].selected === userAnswers[i].correct) {
          indicator.classList.add("correct");
        } else {
          indicator.classList.add("incorrect");
        }
      }

      // Add tooltip to show question info on hover
      indicator.innerHTML = `<span>${i + 1}</span>
        <div class="tooltip-text">Question ${i + 1}${
        userAnswers[i]
          ? userAnswers[i].selected === userAnswers[i].correct
            ? " - Correct!"
            : " - Incorrect"
          : " - Not answered"
      }</div>`;
      indicator.classList.add("tooltip");

      // Add click handler to jump to that question
      indicator.addEventListener("click", () => {
        currentQuestion = i;
        showQuestion();
        updateQuestionIndicators();
      });

      indicatorsDiv.appendChild(indicator);
    }

    // Insert indicators after the progress div
    const progressDiv = document.getElementById("progress");
    progressDiv.parentNode.insertBefore(indicatorsDiv, progressDiv.nextSibling);
  }

  function updateQuestionIndicators() {
    const indicators = document.querySelectorAll(".question-indicator");

    indicators.forEach((indicator, index) => {
      // Reset all
      indicator.classList.remove("current", "answered", "correct", "incorrect");

      // Add appropriate classes
      if (index === currentQuestion) {
        indicator.classList.add("current");
      }

      if (userAnswers[index]) {
        indicator.classList.add("answered");
        if (userAnswers[index].selected === userAnswers[index].correct) {
          indicator.classList.add("correct");
        } else {
          indicator.classList.add("incorrect");
        }
      }

      // Update tooltip
      const tooltipText = indicator.querySelector(".tooltip-text");
      tooltipText.textContent = `Question ${index + 1}${
        userAnswers[index]
          ? userAnswers[index].selected === userAnswers[index].correct
            ? " - Correct!"
            : " - Incorrect"
          : " - Not answered"
      }`;
    });
  }

  function initializeQuiz() {
    quizId = getQuizId();
    const questionFile = `${quizId}-questions.json`;

    fetch(questionFile)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load questions. Redirecting to menu...");
        }
        return response.json();
      })
      .then((data) => {
        originalQuestions = data.questions;
        quizTitle = data.title || "Moral Theology Quiz";
        document.getElementById("quiz-title").textContent = quizTitle;
        document.title = quizTitle;

        questions = [...originalQuestions];
        document
          .getElementById("shuffleBtn")
          .addEventListener("click", toggleShuffle);
        document.getElementById("next").addEventListener("click", nextQuestion);
        document
          .getElementById("back")
          .addEventListener("click", previousQuestion);

        createQuestionIndicators();
        startTimer();
        showQuestion();
      })
      .catch((error) => {
        console.error("Error loading questions:", error);
        alert("Could not load quiz questions. Returning to menu.");
        window.location.href = "index.html";
      });
  }

  function showQuestion() {
    const question = questions[currentQuestion];
    document.getElementById("question").innerHTML = question.question;
    document.getElementById("progress").textContent = `Question ${
      currentQuestion + 1
    } of ${questions.length}`;

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";

    for (const [key, value] of Object.entries(question.choices)) {
      const choice = document.createElement("div");
      choice.className = "choice";
      choice.innerHTML = `<strong>${key}:</strong> ${value}`;
      choice.dataset.answer = key;
      choice.onclick = handleAnswer;
      choicesDiv.appendChild(choice);
    }

    const userAnswer = userAnswers[currentQuestion];
    if (userAnswer) {
      document.querySelectorAll(".choice").forEach((choice) => {
        const answerKey = choice.dataset.answer;
        choice.style.backgroundColor =
          answerKey === userAnswer.correct ? "#d4edda" : "#f8d7da";
        if (answerKey === userAnswer.selected) {
          choice.style.transform = "scale(1.02)";
        }
        choice.style.cursor = "not-allowed";
      });
      document.getElementById(
        "explanation"
      ).innerHTML = `<strong>Correct Answer:</strong> ${userAnswer.correct}<br>
        <strong>Explanation:</strong> ${userAnswer.explanation}`;
      document.getElementById("explanation").classList.add("show");
      document.getElementById("next").style.display = "block";
    } else {
      document.getElementById("explanation").innerHTML = "";
      document.getElementById("explanation").classList.remove("show");
      document.getElementById("next").style.display = "none";
      document.querySelectorAll(".choice").forEach((choice) => {
        choice.style.backgroundColor = "";
        choice.style.cursor = "pointer";
      });
    }

    document.getElementById("back").style.display =
      currentQuestion > 0 ? "block" : "none";
    document.getElementById(
      "score"
    ).textContent = `Score: ${calculateScore()}/${questions.length}`;

    // Update question indicators
    updateQuestionIndicators();
  }

  function handleAnswer(e) {
    const selected = e.currentTarget.dataset.answer;
    const correct = questions[currentQuestion].correctAnswer;
    const explanation = questions[currentQuestion].explanation;

    userAnswers[currentQuestion] = { selected, correct, explanation };

    document.querySelectorAll(".choice").forEach((choice) => {
      const answerKey = choice.dataset.answer;
      choice.style.backgroundColor =
        answerKey === correct ? "#d4edda" : "#f8d7da";
      choice.style.cursor = "not-allowed";
      if (answerKey === selected) {
        choice.style.transform = "scale(1.02)";
      }
    });

    document.getElementById(
      "explanation"
    ).innerHTML = `<strong>Correct Answer:</strong> ${correct}<br>
      <strong>Explanation:</strong> ${explanation}`;
    document.getElementById("explanation").classList.add("show");
    document.getElementById("next").style.display = "block";
    document.getElementById(
      "score"
    ).textContent = `Score: ${calculateScore()}/${questions.length}`;

    // Update question indicators
    updateQuestionIndicators();
  }

  function showResults() {
    // Stop the timer
    stopTimer();
    quizCompleted = true;

    // Calculate final score
    const finalScore = calculateScore();
    const percentage = Math.round((finalScore / questions.length) * 100);

    // Create results container
    const resultsContainer = document.createElement("div");
    resultsContainer.className = "results-container";

    // Add header and summary
    resultsContainer.innerHTML = `
      <div class="results-header">
        <h2>Quiz Results</h2>
      </div>
      <div class="results-score">
        You scored <span>${finalScore}/${
      questions.length
    }</span> (${percentage}%)
      </div>
      <div class="results-time">
        Completion time: ${formatTime(elapsedSeconds)}
      </div>
      <div class="results-breakdown">
        <h3>Question Breakdown</h3>
        <div id="results-list"></div>
      </div>
      <div class="result-actions">
        <button id="retry-quiz" class="btn-primary">Try Again</button>
        <button id="return-menu" class="btn-secondary">Return to Menu</button>
      </div>
    `;

    // Add to the DOM
    const container = document.querySelector(".container");
    container.appendChild(resultsContainer);

    // Add question breakdown
    const resultsList = document.getElementById("results-list");
    userAnswers.forEach((answer, index) => {
      const isCorrect = answer.selected === answer.correct;
      const resultItem = document.createElement("div");
      resultItem.className = `result-item ${
        isCorrect ? "correct" : "incorrect"
      }`;

      resultItem.innerHTML = `
        <div><strong>Question ${index + 1}:</strong> ${questions[
        index
      ].question.substring(0, 100)}${
        questions[index].question.length > 100 ? "..." : ""
      }</div>
        <div>Your answer: ${answer.selected} - ${
        isCorrect ? "Correct" : "Incorrect"
      }</div>
      `;

      resultsList.appendChild(resultItem);
    });

    // Add event listeners for action buttons
    document.getElementById("retry-quiz").addEventListener("click", () => {
      resultsContainer.remove();
      resetQuiz();
    });

    document.getElementById("return-menu").addEventListener("click", () => {
      window.location.href = "index.html";
    });

    // Hide the question container
    document.getElementById("question-container").style.display = "none";
  }

  function resetQuiz() {
    currentQuestion = 0;
    userAnswers = [];
    document.getElementById("score").textContent = "";
    document.getElementById("explanation").classList.remove("show");
    document.getElementById("next").style.display = "none";
    document.getElementById("back").style.display = "none";
    document.getElementById("question-container").style.display = "block";
    quizCompleted = false;
    showQuestion();
    createQuestionIndicators();
    startTimer();
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      showQuestion();
    } else {
      // Check if all questions have been answered
      if (userAnswers.length === questions.length && !quizCompleted) {
        showResults();
      } else {
        stopTimer();
        showResults();
      }
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion();
    }
  }

  // Handle hash changes (if someone changes the hash while on the quiz page)
  window.addEventListener("hashchange", () => {
    location.reload();
  });

  initializeQuiz();
});
