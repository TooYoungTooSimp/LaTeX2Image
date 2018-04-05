//EventTarget.prototype.addEventsListener = function () { (arguments = Array.apply(null, arguments)).shift().split(' ').forEach(e => this.addEventListener.apply(this, [e].concat(arguments))); }
//EventTarget.prototype.addEventsListener = function (events, ...args) { events.split(' ').forEach(e => this.addEventListener.apply(this, [e].concat(args))); };
EventTarget.prototype.addEventsListener = function () { arguments[0].split(' ').forEach(e => (arguments[0] = e, this.addEventListener.apply(this, arguments))); }

var IO = {
    File: {
        Create: (dirEntry, fileName, successHandle, failureHandle) =>
            dirEntry.getFile(fileName, { create: true }, successHandle, failureHandle)
    },
    Directory: {
        Create: (rootDirEntry, dirName, successHandle, failureHandle) =>
            rootDirEntry.getDirectory(dirName, { create: true }, successHandle, failureHandle)
    }
};

document.addEventListener((isCordova = !(typeof (cordova) === "undefined")) ? "deviceready" : "DOMContentLoaded", () => {
    console.log("Application Loading");
    var txtInput = document.getElementById("txtInput");
    var mathjax_result = document.getElementById("mathjax_result");
    var toast = isCordova ? window.plugins.toast : null;
    txtInput.addEventsListener("propertychange input change", () => {
        txtInput.style.height = "auto";
        txtInput.style.height = txtInput.scrollHeight + "px";
        mathjax_result.innerHTML = txtInput.value;
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "mathjax_result"]);
        mathjax_result.style.height = "auto";
        mathjax_result.style.height = (mathjax_result.scrollHeight + 10) + "px";
    }, false);
    if (isCordova) {
        var storage = window.localStorage;
        document.addEventListener("pause", () => storage.setItem("__txtInput_value", txtInput.value), false);
        document.addEventListener("resume", () => txtInput.value = storage.getItem("__txtInput_value"), false);
        document.addEventListener("backbutton", () => {
            storage.setItem("__txtInput_value", txtInput.value);
            navigator.app.exitApp();
        }, false);
        txtInput.value = storage.getItem("__txtInput_value");
        txtInput.dispatchEvent(new Event("change"));
    }
    document.getElementById("btnSave").addEventListener("click", () =>
        setTimeout(() => html2canvas(mathjax_result).then(isCordova
            ? canvas => window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, rootDirEntry =>
                IO.Directory.Create(rootDirEntry, "LaTeX2Image", dirEntry =>
                    IO.File.Create(dirEntry, Date.now().toString() + ".png",
                        fileEntry => canvas.toBlob(blob => fileEntry.createWriter(fileWriter => {
                            fileWriter.onwriteend = () => (msg = "Image saved in {sdcard}/LaTeX2Image", window.plugins.toast.showShortBottom(msg), console.log(msg));
                            fileWriter.onerror = (e) => (msg = "Can't save file, consider making a screenshot.",
                                window.plugins.toast.showShortBottom(msg), console.log([msg, ": ", e.toString()].join('')));
                            fileWriter.write(blob);
                        })),
                        () => toast.showShortBottom("Can't create file, consider making a screenshot.")),
                    () => toast.showShortBottom("Can't create directory, consider making a screenshot.")),
                () => toast.showShortBottom("No FileSystem provided, consider making a screenshot."))
            : canvas => document.getElementById("holder").src = canvas.toDataURL()
        ), 200), false);
    console.log("Application Loaded")
}, false);