let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.continuous = false;

let time = 60;
let timerInterval;


function startListening() {
    recognition.start();
}


recognition.onresult = function(event) {
    let transcript = event.results[0][0].transcript;
    document.getElementById("answer").value = transcript;
};


function speak(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}

function startTimer() {
    time = 60;
    document.getElementById("timer").innerText = time + "s";

    timerInterval = setInterval(() => {
        time--;
        document.getElementById("timer").innerText = time + "s";

        if (time <= 0) {
            clearInterval(timerInterval);
            analyzeAnswer();
        }
    }, 1000);
}


function typeText(element, text, speed = 15) {
    element.innerHTML = "";
    let i = 0;

    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }

    typing();
}


async function startInterview() {
    let role = document.getElementById("role").value;

    let prompt = `Generate one professional interview question for ${role}`;

    let question = await callAI(prompt);

    document.getElementById("questionBox").innerText = question;

    speak(question);
    startTimer();
}


async function analyzeAnswer() {
    clearInterval(timerInterval);

    let role = document.getElementById("role").value;
    let answer = document.getElementById("answer").value;

    if (!answer) {
        alert("Please provide an answer first!");
        return;
    }

    let prompt = `
You are an expert interviewer.

Evaluate the candidate strictly.

Role: ${role}
Answer: "${answer}"

Respond in this format:

Score: (out of 10)

Strengths:
- point 1
- point 2

Weaknesses:
- point 1
- point 2

Improved Answer:
(write a perfect answer)

Final Verdict:
(Fit / Not Fit)

Communication:
(brief feedback)
`;

    let feedback = await callAI(prompt);

    typeText(document.getElementById("feedback"), feedback);
}


async function callAI(prompt) {
    const API_KEY = "AIzaSyD7UHcwUq9YslfL768GFhOL4pJZpQFamTY"; 

    try {
        document.getElementById("loader").style.display = "block";

        let response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5:generateText?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "gemini-1.5",
                    prompt: prompt,
                    temperature: 0.7,
                    maxOutputTokens: 512
                })
            }
        );

        let data = await response.json();
        document.getElementById("loader").style.display = "none";

        
        return data?.candidates?.[0]?.output || "⚠️ No response from AI";

    } catch (error) {
        document.getElementById("loader").style.display = "none";
        console.error(error);
        return "❌ Error connecting to AI";
    }
}
