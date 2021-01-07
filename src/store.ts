// @ts-nocheck
import Overlay from './Overlay';
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
};
class Filter {
  _enable = true;
  _type = 'ComponentName';
  _regex = null;
  constructor() {}
}
class Store {
  _elementSet = new Set();
  constructor() {}
  addElement = (element: TraceElement) => {
    if (!this._elementSet.has(element)) {
      this._elementSet.add(element);
    }
  };
  toggleInspector = (toggle: boolean) => {
    if (toggle) {
      this._elementSet.forEach((element: TraceElement) => {
        if (element.dom.offsetParent) {
          const overlay = new Overlay();
          element.overlay = overlay;
          !devilmode &&
            element.dom.addEventListener(
              'mouseenter',
              (e) => {
                this.showElementOvlerLay(element);
                this.setOverlayBorder(element);
              },
              true
            );
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
          overlay.onLeave(() => {
            if (!element.inspected) {
              this.hideElementOvlerLay(element);
            }
          });
          overlay.hide();
        }
      });
    } else {
      this._elementSet.forEach((element) => {
        element.overlay && element.overlay.remove();
        element.overlay = null;
      });
    }
  };
  initialState = {
    elementSet: this._elementSet,
    filters: filters,
  };
  setInspect = (element: TraceElement, inspect: boolean) => {
    if (inspect) {
      if (!element.overlay) {
        element.overlay = new Overlay();
      }
      element.overlay.inspect(
        [element.dom],
        element.displayName,
        element.source
      );
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
    if (element && element.overlay) {
      element.overlay.show();
    }
  };
  hideElementOvlerLay = (element: TraceElement) => {
    if (element && element.overlay) {
      element.overlay.hide();
    }
  };
  onSelectAll = (checked: boolean) => {
    this._elementSet.forEach((element: TraceElement) => {
      element.inspected = checked;
      const overlay = element.overlay;
      if (overlay) {
        checked ? overlay.show() : overlay.hide();
      }
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
