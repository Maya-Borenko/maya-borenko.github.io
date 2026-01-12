const leftItems = document.querySelectorAll('#left .item');
const rightItems = document.querySelectorAll('#right .item');
const ropes = [];
let selectLeft = null;

leftItems.forEach(item => {
    item.addEventListener('click', () => {
        leftItems.forEach(x => x.classList.remove('selected'));
        item.classList.add('selected');
        selectLeft = item;
    });
});

rightItems.forEach(item => {
    item.addEventListener('click', () => {
        if (!selectLeft) return;
        // Проверить, что соединения нет
        if (ropes.some(r => r.left === selectLeft || r.right === item)) return;
        ropes.push({left: selectLeft, right: item});
        leftItems.forEach(x => x.classList.remove('selected'));
        selectLeft = null;
        drawLines();
    });
});

function drawLines() {
    const canvas = document.getElementById('ropes');
    canvas.width = document.getElementById('puzzle').offsetWidth;
    canvas.height = document.getElementById('puzzle').offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ropes.forEach(({left, right}) => {
        const lRect = left.getBoundingClientRect();
        const rRect = right.getBoundingClientRect();
        const puzzleRect = document.getElementById('puzzle').getBoundingClientRect();
        const leftX = lRect.right - puzzleRect.left;
        const leftY = lRect.top + lRect.height / 2 - puzzleRect.top;
        const rightX = rRect.left - puzzleRect.left;
        const rightY = rRect.top + rRect.height / 2 - puzzleRect.top;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.bezierCurveTo(
            leftX + 60, leftY,
            rightX - 60, rightY,
            rightX, rightY
        );
        ctx.strokeStyle = "#4091e3";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
    });

    checkAnswer();
}

function checkAnswer() {
    if (ropes.length < leftItems.length) {
        document.getElementById('result').innerText = '';
        return;
    }
    // правильные пары: [A-1, B-2, C-3]
    const correct = [
        {l: "A", r: "1"},
        {l: "B", r: "2"},
        {l: "C", r: "3"}
    ];
    let ok = 0;
    ropes.forEach(({left, right}) => {
        if (correct.some(p => p.l === left.getAttribute('data-id') && p.r === right.getAttribute('data-id'))) {
            ok++;
        }
    });
    document.getElementById('result').innerText =
        ok === leftItems.length ? 
        'Поздравляем! Всё правильно.' :
        `Есть ошибки: угадано ${ok} из ${leftItems.length}`;
}

// Redraw on resize
window.addEventListener('resize', drawLines);
