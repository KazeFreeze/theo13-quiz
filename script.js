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
    showQuestion();
    stopTimer();
    startTimer();
  }

  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById(
      "timer"
    ).textContent = `Time elapsed: ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function calculateScore() {
    return userAnswers.reduce((acc, answer) => {
      return acc + (answer.selected === answer.correct ? 1 : 0);
    }, 0);
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
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      showQuestion();
    } else {
      stopTimer();
      alert(
        `Quiz completed! Final score: ${calculateScore()}/${questions.length}`
      );
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
