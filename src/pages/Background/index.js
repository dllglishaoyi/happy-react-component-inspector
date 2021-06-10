console.log('background script started');

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript(null, {
    code: `var myScript = document.createElement('script');
    myScript.textContent = 'window.__INIT_HAPPY_INSPECTOR__ && window.__INIT_HAPPY_INSPECTOR__()';
    document.head.appendChild(myScript);`,
  });
});
