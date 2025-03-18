// Questions for the quiz
const quizData = [
    {
        question: "Which of these artists did not perform at Spring Weekend?",
        answers: ["Snoop Dogg", "Doechii", "Lil Nas X", "Childish Gambino"],
        correct: "Lil Nas X",
        message: "Snoop Dogg has performed in 2010. Doechii has performed in 2023. Childish Cambino has performed in 2012. However, Lil Nas X has never performed at Spring Weekend yet..."
    },
    {
        question: "Which of these artist who performed at Spring Weekend has the most Grammy awards?",
        answers: ["Kendrick Lamar", "U2", "Ella Fitzgerald", "Bob Dylan"],
        correct: ["Kendrick Lamar", "U2"],
        message: "Both Kendrick Lamar and U2 has the most Grammy awards with 22 awards!"
    },
    {
        question: "Which genre artist was most feature at Spring Weekned?",
        answers: ["Rock", "Pop", "Alternative", "Rap"],
        correct: "Rap",
        message: "We love Rap artists!"
    }
];

// currentQuestion - the question number (starts at 0)
// score - the number of questions user got correct
// isMessageShowing - boolean for if the message is being displayed or not
// currentSelection - holds the string of the selected answer
// selectedButton - holds the DOM element of the selected answer
let currentQuestion = 0;
let score = 0;
let isMessageShowing = false;
let currentSelection = null;
let selectedButton = null;

// elements for the quiz 
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const nextButton = document.getElementById("next");
const scoreElement = document.getElementById("score");

function produceQuestion() {
    currentSelection = null;
    selectedButton = null;
    isMessageShowing = false;

    answersElement.innerHTML = "";
    nextButton.disabled = true;

    const currentQuiz = quizData[currentQuestion];
    questionElement.innerText = currentQuiz.question;

    currentQuiz.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerText = answer;
        button.addEventListener("click", (event) => selectAnswer(answer, event));
        answersElement.appendChild(button);
    });
}

function selectAnswer(selected, event) {
    // if an answer was previously selected, remove its highlight
    if (selectedButton) {
        selectedButton.style.backgroundColor = "";
    }

    // Store the new selection and highlight it
    selectedButton = event.target;
    currentSelection = selected;
    selectedButton.style.backgroundColor = "green";

    // Enable the Next button since a selection is made
    nextButton.disabled = false;
}

// next button and message display
nextButton.addEventListener("click", () => {
    if (!isMessageShowing) {
        // First click: show the feedback message from the current question
        const currentQuiz = quizData[currentQuestion];
        if (Array.isArray(currentQuiz.correct)) {
            if (currentQuiz.correct.includes(currentSelection)) {
                score++;
            }
        } else {
            if (currentSelection === currentQuiz.correct) {
                score++;
            }
        }
        questionElement.innerText = currentQuiz.message;
        answersElement.innerHTML = "";
        nextButton.innerText = "Continue";
        isMessageShowing = true;
    } else {
        // Second click ("Continue"): move to the next question.
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            produceQuestion();
            // Reset the Next button label
            nextButton.innerText = "Next Question";
            isMessageShowing = false;
        } else {
            // quiz done
            questionElement.innerText = "Quiz completed!";
            answersElement.innerHTML = "";
            scoreElement.innerText = `You got ${score} questions right out of ${quizData.length}.`;
            nextButton.style.display = "none";
        }
    }
});

produceQuestion();