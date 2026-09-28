/* ==========================================
   DATA KELOMPOK
========================================== */

const teams = [

    {
        name: "Kelompok 1",
        score: 150,
        position: 0,
        area: 0,
        shield: 0,
        freeze: false,
        extraMove: false,
        eliminated: false
    },

    {
        name: "Kelompok 2",
        score: 150,
        position: 0,
        area: 0,
        shield: 0,
        freeze: false,
        extraMove: false,
        eliminated: false
    },

    {
        name: "Kelompok 3",
        score: 150,
        position: 0,
        area: 0,
        shield: 0,
        freeze: false,
        extraMove: false,
        eliminated: false
    },

    {
        name: "Kelompok 4",
        score: 150,
        position: 0,
        area: 0,
        shield: 0,
        freeze: false,
        extraMove: false,
        eliminated: false
    }

];


let currentTeam = 0;

let currentDifficulty = null;

let currentCell = null;

let timer;

let timeLeft = 30;

let correctAnswer = null;



/* ==========================================
   SOAL
========================================== */

const questions = {

    E: [

        {
            q: "Tentukan suku ke-5 dari 2, 4, 6, 8, ...",
            a: "10"
        },

        {
            q: "Tentukan suku berikutnya: 3, 6, 9, 12, ...",
            a: "15"
        },

        {
            q: "Pola 5, 10, 15, 20 memiliki beda ...",
            a: "5"
        },

        {
            q: "Tentukan suku ke-6 dari 1, 3, 5, 7, ...",
            a: "11"
        }

    ],


    M: [

        {
            q: "Tentukan suku ke-10 dari 3, 6, 9, 12, ...",
            a: "30"
        },

        {
            q: "Tentukan suku ke-8 dari 2, 5, 8, 11, ...",
            a: "23"
        },

        {
            q: "Jika Un = 4n - 1, tentukan U7.",
            a: "27"
        },

        {
            q: "Tentukan suku ke-10 dari 5, 8, 11, 14, ...",
            a: "32"
        }

    ],


    H: [

        {
            q: "Tentukan suku ke-20 dari 5, 9, 13, 17, ...",
            a: "81"
        },

        {
            q: "Jika Un = 3n - 2, tentukan U15.",
            a: "43"
        },

        {
            q: "Jumlah 10 suku pertama 2, 4, 6, 8, ...",
            a: "110"
        },

        {
            q: "Jumlah 15 suku pertama 3, 6, 9, ...",
            a: "360"
        }

    ]

};



/* ==========================================
   DEPOSIT
========================================== */

function getDeposit(level) {

    if (level === "E") return 5;

    if (level === "M") return 10;

    if (level === "H") return 15;

}



/* ==========================================
   LOG
========================================== */

function addLog(text) {

    const log =
        document.getElementById("log");

    const item =
        document.createElement("div");

    item.textContent =
        "▶ " + text;

    log.appendChild(item);

    log.scrollTop =
        log.scrollHeight;

}



/* ==========================================
   DADU
========================================== */

function rollDice() {

    const team =
        teams[currentTeam];


    if (team.eliminated) {

        nextTurn();

        return;

    }


    if (team.freeze) {

        addLog(
            team.name +
            " terkena FREEZE dan tidak bergerak."
        );

        team.freeze = false;

        nextTurn();

        return;

    }


    const number =
        Math.floor(
            Math.random() * 6
        ) + 1;


    const diceSymbols = [

        "⚀",
        "⚁",
        "⚂",
        "⚃",
        "⚄",
        "⚅"

    ];


    document.getElementById("dice")
        .textContent =
        diceSymbols[number - 1];


    addLog(
        team.name +
        " mendapatkan dadu " +
        number
    );


    movePlayer(number);

}



/* ==========================================
   GERAK
========================================== */

function movePlayer(steps) {

    const team =
        teams[currentTeam];


    const oldPosition =
        team.position;


    team.position =
        (team.position + steps) % 20;


    /*
       Mendapat +5 jika melewati START
    */

    if (
        oldPosition + steps >= 20
    ) {

        team.score += 5;

        addLog(
            team.name +
            " melewati START dan mendapat +5 poin."
        );

    }


    renderTokens();


    const cell =
        document.querySelector(
            `[data-index="${team.position}"]`
        );


    if (!cell) {

        nextTurn();

        return;

    }


    const level =
        getCellLevel(cell);


    if (
        level === "E" ||
        level === "M" ||
        level === "H"
    ) {

        handleTerritory(level);

        return;

    }


    if (
        cell.classList.contains("bonus")
    ) {

        getBonusCard();

        return;

    }


    addLog(
        team.name +
        " berada di petak START."
    );


    nextTurn();

}



/* ==========================================
   LEVEL PETAK
========================================== */

function getCellLevel(cell) {

    if (
        cell.classList.contains("easy")
    ) {

        return "E";

    }


    if (
        cell.classList.contains("medium")
    ) {

        return "M";

    }


    if (
        cell.classList.contains("hard")
    ) {

        return "H";

    }


    return null;

}



/* ==========================================
   WILAYAH
========================================== */

function handleTerritory(level) {

    currentDifficulty = level;

    currentCell =
        teams[currentTeam].position;


    const cell =
        document.querySelector(
            `[data-index="${currentCell}"]`
        );


    const owner =
        cell.dataset.owner;


    /*
       Belum punya pemilik
    */

    if (!owner) {

        const deposit =
            getDeposit(level);


        const team =
            teams[currentTeam];


        if (team.shield > 0) {

            team.shield--;

            addLog(
                team.name +
                " menggunakan Shield."
            );

        }

        else {

            team.score -= deposit;

            addLog(
                team.name +
                " membayar deposit " +
                deposit +
                " poin."
            );

        }


        updateScore();

        showQuestion(level);

        return;

    }


    /*
       Milik sendiri
    */

    if (
        Number(owner) === currentTeam
    ) {

        addLog(
            "Wilayah ini sudah dimiliki " +
            teams[currentTeam].name
        );

        nextTurn();

        return;

    }


    /*
       Milik lawan
    */

    const ownerTeam =
        teams[Number(owner)];


    const choice =
        confirm(

            "Wilayah ini milik " +
            ownerTeam.name +
            ".\n\n" +

            "OK = Battle\n" +

            "Cancel = Bayar " +
            getDeposit(level) +
            " poin."

        );


    if (!choice) {

        const deposit =
            getDeposit(level);


        teams[currentTeam].score -=
            deposit;


        ownerTeam.score +=
            deposit;


        addLog(

            teams[currentTeam].name +
            " membayar " +
            deposit +
            " poin kepada " +
            ownerTeam.name

        );


        updateScore();

        nextTurn();

        return;

    }


    /*
       Battle
    */

    addLog(
        teams[currentTeam].name +
        " memilih BATTLE!"
    );


    showQuestion(level);

}



/* ==========================================
   SOAL
========================================== */

function showQuestion(level) {

    const list =
        questions[level];


    const selected =
        list[
            Math.floor(
                Math.random() * list.length
            )
        ];


    correctAnswer =
        normalize(selected.a);


    document.getElementById(
        "questionTitle"
    ).textContent =
        "Soal " + level;


    document.getElementById(
        "question"
    ).textContent =
        selected.q;


    document.getElementById(
        "answer"
    ).value = "";


    document.getElementById(
        "questionModal"
    ).style.display =
        "flex";


    startTimer();

}



/* ==========================================
   NORMALIZE
========================================== */

function normalize(value) {

    return String(value)
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/,/g, "");

}



/* ==========================================
   TIMER
========================================== */

function startTimer() {

    clearInterval(timer);

    timeLeft = 30;


    document.getElementById(
        "timer"
    ).textContent =
        timeLeft;


    timer =
        setInterval(() => {

            timeLeft--;


            document.getElementById(
                "timer"
            ).textContent =
                timeLeft;


            if (timeLeft <= 0) {

                clearInterval(timer);

                alert(
                    "⏱️ Waktu habis!"
                );

                closeQuestion();

                addLog(
                    teams[currentTeam].name +
                    " gagal menjawab."
                );

                nextTurn();

            }

        }, 1000);

}



/* ==========================================
   JAWAB SOAL
========================================== */

function submitAnswer() {

    clearInterval(timer);


    const answer =
        normalize(
            document.getElementById(
                "answer"
            ).value
        );


    if (
        answer === correctAnswer
    ) {

        correctAnswerAction();

    }

    else {

        wrongAnswerAction();

    }

}



/* ==========================================
   BENAR
========================================== */

function correctAnswerAction() {

    const team =
        teams[currentTeam];


    const cell =
        document.querySelector(
            `[data-index="${currentCell}"]`
        );


    /*
       Jika wilayah belum dimiliki
    */

    if (!cell.dataset.owner) {

        cell.dataset.owner =
            currentTeam;


        team.area++;


        const owner =
            document.createElement("span");


        owner.className =
            "owner";


        owner.textContent =
            "K" +
            (currentTeam + 1);


        cell.appendChild(owner);


        addLog(

            team.name +
            " berhasil mengklaim wilayah!"

        );


        alert(
            "🎉 Jawaban benar!\n" +
            "Wilayah berhasil diklaim."
        );

    }

    else {

        /*
           Battle:
           wilayah berpindah
        */

        const oldOwner =
            Number(cell.dataset.owner);


        if (
            oldOwner !== currentTeam
        ) {

            teams[oldOwner].area--;


            team.area++;


            cell.dataset.owner =
                currentTeam;


            const oldLabel =
                cell.querySelector(".owner");


            if (oldLabel) {
                oldLabel.remove();
            }


            const owner =
                document.createElement("span");


            owner.className =
                "owner";


            owner.textContent =
                "K" +
                (currentTeam + 1);


            cell.appendChild(owner);


            addLog(
                team.name +
                " memenangkan BATTLE!"
            );


            alert(
                "⚔️ Battle dimenangkan!\n" +
                "Wilayah berhasil direbut."
            );

        }

    }


    closeQuestion();

    updateScore();

    nextTurn();

}



/* ==========================================
   SALAH
========================================== */

function wrongAnswerAction() {

    const team =
        teams[currentTeam];


    const deposit =
        getDeposit(
            currentDifficulty
        );


    const cell =
        document.querySelector(
            `[data-index="${currentCell}"]`
        );


    /*
       Jika wilayah kosong:
       deposit sudah hangus.
    */

    if (!cell.dataset.owner) {

        addLog(
            team.name +
            " salah menjawab. Deposit hangus."
        );

    }

    else {

        /*
           Battle kalah:
           bayar 2x
        */

        const owner =
            teams[
                Number(
                    cell.dataset.owner
                )
            ];


        const payment =
            deposit * 2;


        team.score -= payment;

        owner.score += payment;


        addLog(

            team.name +
            " kalah Battle dan membayar " +
            payment +
            " poin kepada " +
            owner.name

        );

    }


    alert(
        "❌ Jawaban salah!"
    );


    closeQuestion();

    updateScore();

    nextTurn();

}



/* ==========================================
   BONUS CARD
========================================== */

function getBonusCard() {

    const team =
        teams[currentTeam];


    const bonusQuestions =
        questions.H;


    const selected =
        bonusQuestions[
            Math.floor(
                Math.random() *
                bonusQuestions.length
            )
        ];


    const answer =
        prompt(
            "🎁 BONUS CARD\n\n" +
            "Jawab soal HARD:\n\n" +
            selected.q
        );


    if (
        !answer ||
        normalize(answer) !==
        normalize(selected.a)
    ) {

        alert(
            "❌ Jawaban salah.\n" +
            "Kartu Bonus tidak diperoleh."
        );


        nextTurn();

        return;

    }


    const cards = [

        "FREEZE",
        "+10 POIN",
        "SHIELD",
        "EXTRA MOVE"

    ];


    const card =
        cards[
            Math.floor(
                Math.random() *
                cards.length
            )
        ];


    /*
       Efek kartu
    */

    if (card === "FREEZE") {

        const target =
            prompt(
                "Masukkan nomor kelompok yang ingin di-FREEZE (1-4):"
            );


        const index =
            Number(target) - 1;


        if (
            index >= 0 &&
            index < 4 &&
            index !== currentTeam
        ) {

            teams[index].freeze =
                true;

            addLog(
                teams[currentTeam].name +
                " memberikan FREEZE kepada " +
                teams[index].name
            );

        }

    }


    else if (
        card === "+10 POIN"
    ) {

        team.score += 10;

    }


    else if (
        card === "SHIELD"
    ) {

        team.shield += 3;

    }


    else if (
        card === "EXTRA MOVE"
    ) {

        team.extraMove = true;

    }


    document.getElementById(
        "bonus"
    ).textContent =

        team.name +
        " mendapatkan: " +
        card;


    alert(
        "🎉 Kartu Bonus: " +
        card
    );


    updateScore();

    nextTurn();

}



/* ==========================================
   QR
========================================== */

function scanQR(level) {

    if (
        currentDifficulty !== level
    ) {

        alert(
            "❌ QR tidak sesuai dengan petak!"
        );

        return;

    }


    addLog(
        "QR " +
        level +
        " berhasil dipindai."
    );


    showQuestion(level);

}



/* ==========================================
   GANTI GILIRAN
========================================== */

function nextTurn() {

    const current =
        teams[currentTeam];


    /*
       Extra Move
    */

    if (
        current.extraMove
    ) {

        current.extraMove = false;


        addLog(
            current.name +
            " menggunakan Extra Move."
        );


        document.getElementById(
            "turn"
        ).textContent =
            current.name;


        return;

    }


    do {

        currentTeam++;

        if (
            currentTeam >= 4
        ) {

            currentTeam = 0;

        }

    } while (
        teams[currentTeam].eliminated
    );


    currentDifficulty = null;

    currentCell = null;


    document.getElementById(
        "turn"
    ).textContent =
        teams[currentTeam].name;


    addLog(
        "Giliran " +
        teams[currentTeam].name
    );


    checkElimination();

}



/* ==========================================
   ELIMINASI
========================================== */

function checkElimination() {

    teams.forEach(
        team => {

            if (
                team.score <= 0 &&
                !team.eliminated
            ) {

                team.score = 0;

                team.eliminated = true;


                addLog(
                    "💀 " +
                    team.name +
                    " TERELIMINASI!"
                );

            }

        }
    );


    const active =
        teams.filter(
            team =>
                !team.eliminated
        );


    if (
        active.length === 1
    ) {

        alert(
            "🏆 PEMENANG!\n\n" +
            active[0].name
        );

    }

}



/* ==========================================
   UPDATE SCORE
========================================== */

function updateScore() {

    teams.forEach(
        (team, index) => {

            const n =
                index + 1;


            document.getElementById(
                "score" + n
            ).textContent =
                team.score;


            document.getElementById(
                "area" + n
            ).textContent =
                team.area;


            document.getElementById(
                "shield" + n
            ).textContent =
                team.shield;

        }
    );

}



/* ==========================================
   BIDAK
========================================== */

function renderTokens() {

    document
        .querySelectorAll(".token")
        .forEach(
            token =>
                token.remove()
        );


    teams.forEach(
        (team, index) => {

            if (
                team.eliminated
            ) return;


            const cell =
                document.querySelector(
                    `[data-index="${team.position}"]`
                );


            if (!cell) return;


            const token =
                document.createElement("span");


            token.className =
                "token token" +
                (index + 1);


            token.title =
                team.name;


            cell.appendChild(token);

        }
    );

}



/* ==========================================
   TUTUP SOAL
========================================== */

function closeQuestion() {

    clearInterval(timer);


    document.getElementById(
        "questionModal"
    ).style.display =
        "none";

}



/* ==========================================
   MULAI
========================================== */

updateScore();

renderTokens();

addLog(
    "🎮 POLBILPOLY siap dimainkan!"
);
