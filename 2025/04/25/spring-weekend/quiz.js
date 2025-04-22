document.addEventListener("DOMContentLoaded", function () {
    // Questions for the quiz
    const quizData = [
        {
            question: "Which of these artists has not performed at Spring Weekend?",
            answers: ["Snoop Dogg", "Doechii", "Lil Nas X", "Childish Gambino"],
            correct: "Lil Nas X",
            message: "Snoop Dogg performed in 2010, Doechii performed in 2023 and Childish Cambino performed in 2012. However, Lil Nas X hasn't performed at Spring Weekend...yet"
        },
        {
            question: "Which of these Spring Weekend performers has the most Grammy awards?",
            answers: ["Kendrick Lamar", "U2", "Ella Fitzgerald", "Bob Dylan"],
            correct: ["Kendrick Lamar", "U2"],
            message: "Both Kendrick Lamar and U2 have the most Grammy awards with 22 awards!"
        },
        {
            question: "Which genre has been most featured at Spring Weekned?",
            answers: ["Rock", "Pop", "Alternative", "Rap"],
            correct: "Rap",
            message: "There was a total of 48 Rap performances, closely followed by a 40 performances of Rock music. Alternative and Pop had 35 and 12 respectively."
        },
        {
            question: "How many different countries have been represented at Spring Weekend?",
            answers: ["38", "23", "16", "10"],
            correct: "16",
            message: "35 international artists have represented 16 different countries at Spring Weekend"
        },
        {
            question: "Which of the following artists has performed more than once at Spring Weekend?",
            answers: ["Bob Dylan", "Phoebe Bridgers", "Young Thug", "Smokey Robinson"],
            correct: "Bob Dylan",
            message: "Bob Dylan has performed twice at Spring Weekend—in 1964 and 1997."
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

    document.getElementById("start-btn").addEventListener("click", () => {
        // Hide the start screen
        document.getElementById("start-screen").style.display = "none";

        // Show the quiz container
        document.getElementById("quiz-box").style.display = "block";

        // Start the quiz by loading the first question
        produceQuestion();
    });


    function produceQuestion() {
        document.getElementById("message").innerText = "";

        currentSelection = null;
        selectedButton = null;
        isMessageShowing = false;

        answersElement.innerHTML = "";
        nextButton.disabled = true;

        const currentQuiz = quizData[currentQuestion];
        questionElement.style.fontWeight = "bold";
        questionElement.innerText = currentQuiz.question;

        currentQuiz.answers.forEach(answer => {
            const button = document.createElement("button");
            button.innerText = answer;
            button.addEventListener("click", (event) => selectAnswer(answer, event));
            answersElement.appendChild(button);
        });
    }

    function selectAnswer(selected, event) {
        Array.from(answersElement.children).forEach(button => {
            button.classList.remove("selected");
        });

        event.target.classList.add("selected");

        currentSelection = selected;

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
                    feedbackPrefix = "Correct! ";
                } else {
                    feedbackPrefix = "Wrong! ";
                }
            } else {
                if (currentSelection === currentQuiz.correct) {
                    score++;
                    feedbackPrefix = "Correct! ";
                } else {
                    feedbackPrefix = "Wrong! ";
                }
            }
            const feedbackMessage = feedbackPrefix + currentQuiz.message;
            questionElement.style.fontWeight = "normal";
            questionElement.innerText = feedbackMessage;
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
                questionElement.style.fontWeight = "bold";
                questionElement.innerText = "Quiz completed!";
                answersElement.innerHTML = "";
                document.getElementById("message").innerText = "";
                scoreElement.innerText = `You got ${score}/${quizData.length} questions correct.`;
                nextButton.style.display = "none";
                document.getElementById("read-more").style.display = "block";
            }
        }
    });

    document.getElementById("start-btn").addEventListener("click", () => {
        document.getElementById("start-screen").style.display = "none";
        document.getElementById("quiz-content").style.display = "block";
        produceQuestion();
    });
});