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
      let sourceRes = null;
      if (dom) {
        try {
          sourceRes = await getSourceLocation(sourceTrace);
        } catch (error) {
          console.log('getSourceLocation faild', error);
        }

        store.addElement({
          dom,
          displayName,
          isFromFilter,
          source:
            sourceRes && sourceRes.source
              ? getEditorScheme(sourceRes.source)
              : '',
        });
      }
    } catch (e) {
      console.log('======Inspector Wrap Failed======', e);
    }
  }
  render() {
    return this.props.children;
  }
}
