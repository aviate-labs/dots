var canvas = document.querySelector("canvas");

var videoStream = canvas.captureStream(30);
var mediaRecorder = new MediaRecorder(videoStream);

var chunks = [];
mediaRecorder.ondataavailable = function (e) {
    chunks.push(e.data);
};

mediaRecorder.onstop = function (e) {
    var blob = new Blob(chunks, { 'type': 'video/mp4' });
    chunks = [];
    var videoURL = URL.createObjectURL(blob);

    var fileName = "video.mp4";
    var a = document.createElement('a');
    a.href = videoURL;
    a.download = fileName;
    a.textContent = "DOWNLOAD " + fileName;
    document.getElementById('blobURL').innerHTML = "BLOB URL: <b>" + videoURL + "</b>";
    document.getElementById('download').appendChild(a);
};

mediaRecorder.ondataavailable = function (e) {
    chunks.push(e.data);
};

mediaRecorder.start();
setTimeout(function () { mediaRecorder.stop(); }, 5000);