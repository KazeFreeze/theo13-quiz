document.addEventListener("DOMContentLoaded", () => {
  let currentQuestion = 0;
  let score = 0;
  let questions = [];
  let originalQuestions = [];
  let isShuffled = false;
  let startTime;
  let timerInterval;

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

    // Create new shuffled array or reset to original
    questions = isShuffled
      ? shuffleArray([...originalQuestions])
      : [...originalQuestions];

    // Reset quiz state
    currentQuestion = 0;
    score = 0;
    document.getElementById("score").textContent = "";
    showQuestion();
  }

  function initializeQuiz() {
    fetch("questions.json")
      .then((response) => response.json())
      .then((data) => {
        originalQuestions = data.questions;
        questions = [...originalQuestions];
        document
          .getElementById("shuffleBtn")
          .addEventListener("click", toggleShuffle);
        document
          .getElementById("previous")
          .addEventListener("click", previousQuestion);
        document
          .getElementById("submit")
          .addEventListener("click", nextQuestion);
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
        showQuestion();
      })
      .catch((error) => console.error("Error loading questions:", error));
  }

  function updateTimer() {
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    document.getElementById("timer").textContent = `Time Elapsed: ${elapsed}s`;
  }

  function showQuestion() {
    const question = questions[currentQuestion];
    document.getElementById("question").innerHTML = question.question;
    document.getElementById("progress").textContent = `Question ${
      currentQuestion + 1
    } of ${questions.length}`;

    // Clear previous choices
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";

    // Add new choices
    for (const [key, value] of Object.entries(question.choices)) {
      const choice = document.createElement("div");
      choice.className = "choice";
      choice.innerHTML = `<strong>${key}:</strong> ${value}`;
      choice.dataset.answer = key;
      choice.onclick = handleAnswer;
      choicesDiv.appendChild(choice);
    }

    document.getElementById("explanation").innerHTML = "";
    document.getElementById("previous").style.display =
      currentQuestion === 0 ? "none" : "inline-block";
    document.getElementById("submit").style.display = "inline-block";
  }

  function handleAnswer(e) {
    const selected = e.target.dataset.answer;
    const correct = questions[currentQuestion].correctAnswer;
    const explanation = questions[currentQuestion].explanation;

    // Show explanation
    document.getElementById(
      "explanation"
    ).innerHTML = `<strong>Correct Answer:</strong> ${correct}<br>
           <strong>Explanation:</strong> ${explanation}`;

    // Update score
    if (selected === correct) score++;

    // Update UI
    document.querySelectorAll(".choice").forEach((choice) => {
      choice.style.backgroundColor =
        choice.dataset.answer === correct ? "#d4edda" : "#f8d7da";
      choice.style.cursor = "not-allowed";
    });

    document.getElementById("submit").style.display = "none";
    document.getElementById(
      "score"
    ).textContent = `Score: ${score}/${questions.length}`;
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      showQuestion();
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion();
    }
  }

  initializeQuiz();
});
