const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName = "";
let myPeerConnection;




async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label === camera.label){
                option.selected = true;
            }
            cameraSelect.appendChild(option);
        })
    }catch(e){console.log(e)}
}


async function getMedia(deviceId){
    const constraints = {
        audio: true,
        video: {facingMode: "user"}
    }
    if(deviceId){
        constraints.video = {deviceId: {exact: deviceId}}
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(constraints)
        myFace.srcObject = myStream;
        if(!deviceId){
            await getCameras();
        }
    }catch (e) {
        console.log(e);
    }
}


muteBtn.addEventListener("click", (e) => {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    }else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
})
cameraBtn.addEventListener("click", (e) => {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    if(cameraOff){
        cameraBtn.innerText = "Camera Off";
        cameraOff = false;
    }else {
        cameraBtn.innerText = "Camera On";
        cameraOff = true;
    }
})

cameraSelect.addEventListener("input", async (e) => {
    await getMedia(cameraSelect.value);
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
})



// Welcome Form (join a room)

const welcome = document.getElementById("welcome"); 
const welcomeForm = welcome.querySelector("form");


async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

welcomeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
})

// socket code
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent offer")
    socket.emit("offer", offer, roomName);
})

socket.on("offer", async (offer) => {
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("send the answer");
})

socket.on("answer", answer => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
})

// RTC Code
function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", (data) => {
        console.log("send candidate");
        socket.emit("ice", data.candidate, roomName);
    })
    myPeerConnection.addEventListener("addstream", data => {
        console.log("got an event from my peer");
        const peerFace = document.getElementById("peerFace");
        peerFace.srcObject = data.stream;
    })
    myStream.getTracks().forEach(track => {
        myPeerConnection.addTrack(track, myStream);
    })
}


// socket.io 사용해서 채팅방 만들기
// const room = document.getElementById("room");
// room.hidden = true;
// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
// const h3 = room.querySelector("h3");

// let roomName = "";

// function addMessage(message){
//     const ul = room.querySelector("ul");
//     const li = document.createElement("li");
//     li.innerText = message;
//     ul.appendChild(li);
// }

// function handleMessageSubmit(event) {
//     event.preventDefault();
//     const input = room.querySelector("#msg input");
//     socket.emit("new_message", input.value, roomName,() => {
//         addMessage(`You: ${input.value}`);
//         input.value = "";
//     });
// }

// function handleNicknameSubmit(event){
//     event.preventDefault();
//     const input = room.querySelector("#name input");
//     socket.emit("nickname", input.value)
//     input.value = "";
// }

// form.addEventListener("submit", event => {
//     event.preventDefault();
//     const input = form.querySelector("input");
//     socket.emit("enter_room", input.value, () => {
//         welcome.hidden = true;
//         room.hidden = false;
//         h3.innerText = `Room : ${roomName}`
//         const chatForm = room.querySelector("#msg");
//         const nameForm = room.querySelector("#name");
//         chatForm.addEventListener("submit", handleMessageSubmit);
//         nameForm.addEventListener("submit", handleNicknameSubmit);
//     });
//     roomName = input.value;
//     input.value = "";
// })

// socket.on("welcome", (user, newCount) => {
//     addMessage(`${user} joined!`);
//     h3.innerText = `Room : ${roomName} (${newCount})`;
// })

// socket.on("bye", (left, newCount) => {
//     addMessage(`${left} left ㅠㅠ`);
//     h3.innerText = `Room : ${roomName} (${newCount})`
// })

// socket.on("new_message", addMessage);

// socket.on("room_change", (rooms) => {
//     const roomList = welcome.querySelector("ul");
//     roomList.innerHTML = "";
//     rooms.forEach(room => {
//         const li = document.createElement("li");
//         li.innerText = room;
//         roomList.append(li);
//     })
// })

// websocket 사용하기
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