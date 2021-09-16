const socket = io();

const room = document.getElementById("room");
room.hidden = true;
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const h3 = room.querySelector("h3");

let roomName = "";

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    socket.emit("new_message", input.value, roomName,() => {
        addMessage(`You: ${input.value}`);
        input.value = "";
    });
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value)
    input.value = "";
}

form.addEventListener("submit", event => {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, () => {
        welcome.hidden = true;
        room.hidden = false;
        h3.innerText = `Room : ${roomName}`
        const chatForm = room.querySelector("#msg");
        const nameForm = room.querySelector("#name");
        chatForm.addEventListener("submit", handleMessageSubmit);
        nameForm.addEventListener("submit", handleNicknameSubmit);
    });
    roomName = input.value;
    input.value = "";
})

socket.on("welcome", (user, newCount) => {
    addMessage(`${user} joined!`);
    h3.innerText = `Room : ${roomName} (${newCount})`;
})

socket.on("bye", (left, newCount) => {
    addMessage(`${left} left ㅠㅠ`);
    h3.innerText = `Room : ${roomName} (${newCount})`
})

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
})


// const messageList = document.querySelector("ul");
// const messageForm = document.querySelector("#msg");
// const nickForm = document.querySelector("#nick");
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload){
//     const msg = {type, payload}
//     return JSON.stringify(msg);
// }


// socket.addEventListener("open", () => {
//     console.log("Connected to Server ✅")
// })

// socket.addEventListener("message", (message) => {
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
// })

// socket.addEventListener("close", () => {
//     console.log("Disconnected to Server ❌")
// })

// messageForm.addEventListener("submit", (event) => {
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     socket.send(makeMessage("new_message", input.value));

//     const li = document.createElement("li");
//     li.innerText = `You : ${input.value}`;
//     messageList.append(li);

//     input.value = "";
// })

// nickForm.addEventListener("submit", (event) => {
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMessage("nickname", input.value));
//     input.value = "";
// })