let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";

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
    timerInterval = setInterval(() => {
        document.getElementById("timer").innerText = time + "s";
        time--;

        if (time < 0) {
            clearInterval(timerInterval);
            analyzeAnswer();
        }
    }, 1000);
}


async function startInterview() {
    let role = document.getElementById("role").value;

    let prompt = `Generate a professional interview question for ${role}`;

    let question = await callAI(prompt);

    document.getElementById("questionBox").innerText = question;

    speak(question);
    startTimer();
}


async function analyzeAnswer() {
    clearInterval(timerInterval);

    let role = document.getElementById("role").value;
    let answer = document.getElementById("answer").value;

    let prompt = `
You are a professional interviewer.

Evaluate this answer for the role: ${role}

Answer: "${answer}"

Give:
1. Score out of 10
2. Strengths
3. Weaknesses
4. Improved answer
5. Is candidate fit for role (Yes/No)
6. Communication feedback
`;

    let feedback = await callAI(prompt);

    document.getElementById("feedback").innerText = feedback;
}


async function callAI(prompt) {

    const API_KEY = "YOUR_GEMINI_API_KEY"; 

    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    let data = await response.json();

    return data.candidates[0].content.parts[0].text;
      }
