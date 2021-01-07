chrome.devtools.panels.create('Happy Inspector', null, './devtools.html', null);
window.document.getElementById('inspectbtn').addEventListener('click', () => {
  chrome.devtools.inspectedWindow.eval('inspect(window.__SOURCE_TO_INSPECT__)');
});
window.document.getElementById('restartbtn').addEventListener('click', () => {
  chrome.devtools.inspectedWindow.eval(
    'window.__HAPPY_INSPECTOR__.init(React,ReactDom)'
  );
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (
    request.message === 'inspectsource' &&
    request.source === 'happy-inspector'
  ) {
    chrome.devtools.inspectedWindow.eval(
      'inspect(window.__SOURCE_TO_INSPECT__)'
    );
  } else if (
    request.message === 'sethappyinspectorignore' &&
    request.source === 'happy-inspector'
  ) {
    window.document.getElementById('ignorecomponents').value = request.source;
  }
});

const toggle = localStorage.getItem('__devil_mode__');
window.document.getElementById('devilmode').checked = toggle === true;
window.document.getElementById('devilmode').addEventListener('change', (e) => {
  localStorage.setItem('__devil_mode__', e.target.checked);
  chrome.devtools.inspectedWindow.eval(
    `localStorage.setItem('__devil_mode__', ${e.target.checked})`
  );
});
// window.document.getElementById('ignorecomponents').value = localStorage.getItem(
//   '__HAPPY_IGNORE_RULES__'
// );

window.document.getElementById('setignore').addEventListener('click', (e) => {
  const value = window.document.getElementById('ignorecomponents').value;
  chrome.devtools.inspectedWindow.eval(
    `localStorage.setItem('__HAPPY_IGNORE_RULES__', ${JSON.stringify(
      value.replace(`'`, '')
    )})`
  );
});

//
