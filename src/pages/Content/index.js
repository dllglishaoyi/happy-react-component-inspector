import '../../assets/img/icon-new-34.png';
import '../../assets/img/icon-new-128.png';
var s = document.createElement('script');
s.src = chrome.runtime.getURL('index.bundle.js');
s.onload = function () {
  this.remove();
};

(document.head || document.documentElement).appendChild(s);

window.addEventListener('message', function (event) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  var message = event.data;
  // Only accept messages that we know are ours
  if (
    typeof message !== 'object' ||
    message === null ||
    !(message.source === 'happy-inspector')
  ) {
    return;
  }
  chrome.runtime.sendMessage(chrome.runtime.id, message);
});
