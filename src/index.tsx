import { getDisplayName, checkFilter, isIgnored } from './utils';

import { setupPannel } from './ToolPanel';
import AgentComponent from './AgentComponent';
const devilmode = localStorage.getItem('__devil_mode__') === 'true';
function componentInspector(React: any) {
  const oriCreat = React.createElement;
  if (React.createElement && !React.createElement.__IS_REPLACED__) {
    React.createElement = function (origType: any, ...rest: any[]) {
      const element = oriCreat.apply(React, [origType, ...rest]);
      // if (origType.__sourceTrace__ || checkFilter(origType)) {
      // console.log(
      //   'devilmode',
      //   devilmode,
      //   localStorage.getItem('__devil_mode__')
      // );
      if (
        (devilmode || origType.__sourceTrace__ || checkFilter(origType)) &&
        !isIgnored(getDisplayName(origType))
      ) {
        let sourceTrace =
          origType.__sourceTrace__ instanceof Error && origType.__sourceTrace__;
        if (!sourceTrace) {
          try {
            origType();
          } catch (e) {
            sourceTrace = e;
          }
        }

        return oriCreat.apply(React, [
          AgentComponent,
          {
            sourceTrace: sourceTrace,
            displayName: getDisplayName(origType),
            isFromFilter: !origType.__sourceTrace__,
          },
          element,
        ]);
      }
      return element;
    };
    React.createElement.__IS_REPLACED__ = true;
  }
}
function init(React: any, ReactDom: any) {
  if (!window.ReactDom && ReactDom) {
    window.ReactDom = ReactDom;
  }
  setupPannel();
  componentInspector(React);
}
window.__HAPPY_INSPECTOR__ = {
  componentInspector,
  init,
};
if (window.React) {
  setupPannel();
  componentInspector(window.React);
}
