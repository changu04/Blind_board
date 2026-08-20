const Create_Room = document.getElementById("Create-Room");

console.log(Create_Room.offsetWidth);
console.log(Create_Room.offsetHeight);

const Join_Room = document.getElementById("Join-Room");
Join_Room.style.height = Create_Room.offsetHeight + "px";
Join_Room.style.width = Create_Room.offsetWidth + "px";

Join_Room.addEventListener(`click`, () => {
    window.location.href = '../join/join.html';
})