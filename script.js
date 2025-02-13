document.addEventListener("DOMContentLoaded", () => {
  let currentQuestion = 0;
  let score = 0;
  let questions = [];
  let originalQuestions = [];
  let isShuffled = false;
  let userAnswers = [];
  let quizStartTime;

  // Timer
  function startTimer() {
    quizStartTime = Date.now();
    setInterval(() => {
      const elapsed = Date.now() - quizStartTime;
      const seconds = Math.floor(elapsed / 1000) % 60;
      const minutes = Math.floor(elapsed / 60000);
      document.getElementById("timer").textContent = `Time: ${String(
        minutes
      ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, 1000);
  }

  // Fisher-Yates shuffle
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
    score = 0;
    userAnswers = new Array(questions.length).fill(null);
    document.getElementById("score").textContent = "";
    showQuestion();
  }

  function initializeQuiz() {
    fetch("questions.json")
      .then((response) => response.json())
      .then((data) => {
        originalQuestions = data.questions;
        questions = [...originalQuestions];
        userAnswers = new Array(questions.length).fill(null);
        document
          .getElementById("shuffleBtn")
          .addEventListener("click", toggleShuffle);
        document
          .getElementById("next")
          .addEventListener("click", goToNextQuestion);
        document
          .getElementById("back")
          .addEventListener("click", goToPreviousQuestion);
        showQuestion();
        startTimer();
      })
      .catch((error) => console.error("Error loading questions:", error));
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
      choice.onclick = () => selectAnswer(key);
      if (userAnswers[currentQuestion] === key) {
        choice.classList.add("selected");
      }
      choicesDiv.appendChild(choice);
    }

    if (userAnswers[currentQuestion] !== null) {
      showExplanation();
    } else {
      document.getElementById("explanation").innerHTML = "";
    }

    document.getElementById("back").disabled = currentQuestion === 0;
    document.getElementById("next").disabled =
      userAnswers[currentQuestion] === null;
  }

  function selectAnswer(selected) {
    userAnswers[currentQuestion] = selected;
    document.querySelectorAll(".choice").forEach((choice) => {
      if (choice.dataset.answer === selected) {
        choice.classList.add("selected");
      } else {
        choice.classList.remove("selected");
      }
    });
    showExplanation();
    document.getElementById("next").disabled = false;
    updateScore();
  }

  function showExplanation() {
    const question = questions[currentQuestion];
    const explanationDiv = document.getElementById("explanation");
    explanationDiv.innerHTML = `<strong>Correct Answer:</strong> ${question.correctAnswer}<br>
      <strong>Explanation:</strong> ${question.explanation}`;

    // Trigger fade-in animation
    explanationDiv.classList.remove("fade-in");
    void explanationDiv.offsetWidth;
    explanationDiv.classList.add("fade-in");

    document.querySelectorAll(".choice").forEach((choice) => {
      if (choice.dataset.answer === question.correctAnswer) {
        choice.classList.add("correct");
        choice.classList.remove("incorrect");
      } else if (choice.dataset.answer === userAnswers[currentQuestion]) {
        choice.classList.add("incorrect");
        choice.classList.remove("correct");
      } else {
        choice.classList.remove("correct", "incorrect");
      }
    });
  }

  function updateScore() {
    score = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) score++;
    });
    document.getElementById(
      "score"
    ).textContent = `Score: ${score}/${questions.length}`;
  }

  function goToNextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      showQuestion();
    }
  }

  function goToPreviousQuestion() {
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion();
    }
  }

  initializeQuiz();
});
