document.addEventListener("DOMContentLoaded", () => {
  let currentQuestion = 0;
  let score = 0;
  let questions = [];

  fetch("questions.json")
    .then((response) => response.json())
    .then((data) => {
      questions = data.questions;
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
