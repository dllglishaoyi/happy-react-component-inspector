// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from 'react';
// import ReactDom from 'react-dom';
import { getSourceLocation, getEditorScheme } from './utils';
import store from './store';

export const getElementFiber = (element: HTMLElement): Fiber | null => {
  const fiberKey = Object.keys(element).find((key) =>
    key.startsWith('__reactInternalInstance$')
  );

  if (fiberKey) {
    return element[fiberKey] as Fiber;
  }

  return null;
};

export default class Monitor extends React.Component {
  constructor() {
    super();
  }
  async componentDidMount() {
    // @ts-expect-error tofix
    const { sourceTrace, displayName, isFromFilter } = this.props;
    // eslint-disable-next-line react/no-find-dom-node
    try {
      const ReactDom = window.ReactDom;
      const dom = ReactDom.findDOMNode(this);
      let sourceLocation = null;
      if (dom) {
        try {
          const fiber = getElementFiber(dom);
          if (fiber && fiber._debugSource) {
            const { fileName, lineNumber, columnNumber } = fiber._debugSource;
            sourceLocation = getEditorScheme(
              fileName,
              lineNumber,
              columnNumber
            );
          } else {
            // const sourceRes = await getSourceLocation(sourceTrace);
            // const { source, line, column } = sourceRes;
            // sourceLocation = getEditorScheme(source, line, column);
          }
        } catch (error) {
          console.log('getSourceLocation faild', error);
        }
        const Element = {
          dom,
          displayName,
          isFromFilter,
          source: sourceLocation,
          sourceTrace,
        };
        dom.__Element__ = Element;
        store.addElement(Element);
      }
    } catch (e) {
      console.log('======Inspector Wrap Failed======', e);
    }
  }
  render() {
    return this.props.children;
  }
}
