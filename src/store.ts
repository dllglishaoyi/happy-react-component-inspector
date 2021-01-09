// @ts-nocheck
import Overlay from './Overlay';
import { checkCodeInEditor } from './utils';
export const SHOPEE_COMPONENT_FILTERS = '__SHOPEE_COMPONENT_FILTERS__';
const filtersString = localStorage.getItem(SHOPEE_COMPONENT_FILTERS);
const filters = filtersString ? JSON.parse(filtersString) : [];
const devilmode = localStorage.getItem('__devil_mode__') === 'true';

export const getElementFiber = (element: any): any => {
  const fiberKey = Object.keys(element).find((key) =>
    key.startsWith('__reactInternalInstance$')
  );

  if (fiberKey) {
    return element[fiberKey];
  }

  return null;
};

export type TraceElement = {
  dom: HTMLElement;
  displayName: string;
  source: string;
  inspected: boolean;
  overlay?: Overlay;
  sourceTrace?: any;
};
class Filter {
  _enable = true;
  _type = 'ComponentName';
  _regex = null;
  constructor() {}
}
class Store {
  currentDom = null;
  isOn = false;
  _elementSet = new Set();
  constructor() {}
  addElement = (element: TraceElement) => {
    if (!this._elementSet.has(element)) {
      this._elementSet.add(element);
    }
  };
  onClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // console.log(event.target);
    console.log(
      'this._elementSet.has(element)',
      event.target,
      this._elementSet.has(event.currentTarget)
    );
  };
  toggleInspector = (toggle: boolean) => {
    this.isOn = toggle;
    if (toggle) {
      // window.addEventListener('click', this.onClick, true);
      this._elementSet.forEach((element: TraceElement) => {
        element.dom.addEventListener('mouseover', this.onDomMouseOver);
        element.dom.addEventListener('mouseout', this.onDomMouseOut);
      });
    } else {
      this._elementSet.forEach((element) => {
        element.overlay && element.overlay.remove();
        element.overlay = null;
        element.dom.removeEventListener('mouseover', this.onDomMouseOver);
        element.dom.removeEventListener('mouseout', this.onDomMouseOut);
      });
    }
  };
  attachEvent = (element: TraceElement) => {};
  initialState = {
    elementSet: this._elementSet,
    filters: filters,
  };
  setInspect = (element: TraceElement, inspect: boolean) => {
    if (inspect) {
      showElementOvlerLay(element);
    } else {
      element.overlay && element.overlay.remove();
      element.overlay = null;
    }
  };
  setOverlayBorder = (element: TraceElement) => {
    if (element && element.overlay) {
      element.overlay.setBorder();
    }
  };
  removeOverlayBorder = (element: TraceElement) => {
    if (element && element.overlay) {
      element.overlay.removeBorder();
    }
  };
  showElementOvlerLay = (element: TraceElement) => {
    if (element.overlay) {
      element.overlay.show();
    } else {
      const overlay = new Overlay();
      element.overlay = overlay;
      overlay.inspect(
        [element.dom],
        element.displayName,
        element.source,
        () => {
          //  func: getElementFiber(element.dom).return.elementType,
          const fiber = getElementFiber(element.dom);
          window.__SOURCE_TO_INSPECT__ = fiber && fiber.return.elementType;
          window.postMessage(
            {
              message: 'inspectsource',
              source: 'happy-inspector',
            },
            '*'
          );
        }
      );

      overlay.onClickName(() => {
        if (element.source) {
          window.location.href = element.source;
        } else if (element.sourceTrace) {
          checkCodeInEditor(element.sourceTrace);
        }
      });
    }
    element.dom.addEventListener('click', this.onDomClick, true);
  };
  onDomClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const element = e.currentTarget.__Element__;
    // console.log('xxxx', element);
    const fiber = getElementFiber(element.dom);
    window.__SOURCE_TO_INSPECT__ = fiber && fiber.return.elementType;
    window.postMessage(
      {
        message: 'inspectsource',
        source: 'happy-inspector',
      },
      '*'
    );
    if (element.source) {
      window.location.href = element.source;
    } else if (element.sourceTrace) {
      checkCodeInEditor(element.sourceTrace);
    }
  };
  onDomMouseOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const element = e.currentTarget.__Element__;
    if (this.currentDom != element) {
      this.showElementOvlerLay(element);
      if (this.currentDom && !this.currentDom.inspected) {
        this.hideElementOvlerLay(this.currentDom);
      }
      this.currentDom = element;
    }
  };
  onDomMouseOut = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget.__Element__;
    var e = event.toElement || event.relatedTarget;
    if (e.parentNode == this || e == this) {
      return;
    }
    if (!element.inspected) {
      this.hideElementOvlerLay(element);
      this.currentDom = null;
    }
  };
  hideElementOvlerLay = (element: TraceElement) => {
    if (element && element.overlay) {
      element.dom.removeEventListener('click', this.onDomClick, true);
      element.overlay.hide();
    }
  };
  onSelectAll = (checked: boolean) => {
    this._elementSet.forEach((element: TraceElement) => {
      element.inspected = checked;
      checked
        ? this.showElementOvlerLay(element)
        : this.hideElementOvlerLay(element);
    });
  };
  reducer = (state: any, action: any) => {
    const { element } = action;
    switch (action.type) {
      case 'selectComponent':
        element.inspected = action.checked;
        if (action.checked) {
          this.showElementOvlerLay(element);
        } else {
          this.hideElementOvlerLay(element);
        }

        return { ...state };
      case 'selectAll':
        this.onSelectAll(action.checked);
        return { ...state };
      case 'onMouseOver':
        this.showElementOvlerLay(element);
        this.setOverlayBorder(element);
        return state;
      case 'onMouseOut':
        if (element && !element.inspected) {
          this.hideElementOvlerLay(element);
        }
        this.removeOverlayBorder(element);
        return state;
      case 'addFilter':
        return {
          ...state,
          filters: state.filters.concat(new Filter()),
        };
      case 'removeFilter':
        return {
          ...state,
          filters: state.filters.filter((item, index) => {
            return index != action.index;
          }),
        };
      case 'updateFilterRegex':
        return {
          ...state,
          filters: state.filters.map((filter: Filter, index: number) => {
            if (action.index === index) {
              filter._regex = action.regex;
            }
            return filter;
          }),
        };
      case 'updateFilterEnable':
        return {
          ...state,
          filters: state.filters.map((filter: Filter, index: number) => {
            if (action.index === index) {
              filter._enable = action.enable;
            }
            return filter;
          }),
        };
      case 'applyFilter':
        localStorage.setItem(
          SHOPEE_COMPONENT_FILTERS,
          JSON.stringify(state.filters)
        );
        window.location.reload();
        return state;
      default:
        throw new Error();
    }
  };
}
const store = new Store();
export default store;
