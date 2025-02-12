document.addEventListener("DOMContentLoaded", () => {
  let currentQuestion = 0;
  let score = 0;
  let questions = [];
  let originalQuestions = [];
  let isShuffled = false;

  // Add shuffle function
  function shuffleQuestions() {
    const shuffled = [...originalQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Toggle shuffle function
  function toggleShuffle() {
    isShuffled = !isShuffled;
    const btn = document.getElementById("shuffleBtn");
    btn.textContent = isShuffled ? "Unshuffle Questions" : "Shuffle Questions";
    btn.classList.toggle("active", isShuffled);

    questions = isShuffled ? shuffleQuestions() : [...originalQuestions];
    currentQuestion = 0;
    score = 0;
    showQuestion();
    document.getElementById("score").textContent = "";
  }

  fetch("questions.json")
    .then((response) => response.json())
    .then((data) => {
      originalQuestions = data.questions;
      questions = [...originalQuestions];
      document.getElementById("shuffleBtn").onclick = toggleShuffle;
      showQuestion();
    });

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

    // Prepare for next question
    currentQuestion++;
    if (currentQuestion < questions.length) {
      setTimeout(() => {
        showQuestion();
        document.getElementById("submit").style.display = "block";
      }, 3000);
    }
  }
});
