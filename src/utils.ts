// @ts-nocheck
import sourceMap from 'source-map';
import StackTrace from 'stacktrace-js';
import ignoreListConfig from './ignoreList';

export const SHOPEE_COMPONENT_FILTERS = '__SHOPEE_COMPONENT_FILTERS__';
const filtersString = localStorage.getItem(SHOPEE_COMPONENT_FILTERS);
const filters = filtersString ? JSON.parse(filtersString) : [];
const sourceMapCache: any = {};

const ignore = localStorage.getItem('__HAPPY_IGNORE_RULES__');
const ignoreList = ignore ? JSON.parse(ignore) : ignoreListConfig;
//https://gist.github.com/dperini/729294
var re_weburl = new RegExp(
  '^' +
    '(?:(?:(?:https?|ftp):)?\\/\\/)' +
    '(?:\\S+(?::\\S*)?@)?' +
    '(?:' +
    '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
    '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
    '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
    '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
    '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
    '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
    '|' +
    '(?:' +
    '(?:' +
    '[a-z0-9\\u00a1-\\uffff]' +
    '[a-z0-9\\u00a1-\\uffff_-]{0,62}' +
    ')?' +
    '[a-z0-9\\u00a1-\\uffff]\\.' +
    ')+' +
    '(?:[a-z\\u00a1-\\uffff]{2,}\\.?)' +
    ')' +
    '(?::\\d{2,5})?' +
    '(?:[/?#]\\S*)?' +
    '$',
  'i'
);
console.log('ignoreList', ignoreList);
if (!ignore) {
  localStorage.setItem(
    '__HAPPY_IGNORE_RULES__',
    JSON.stringify(ignoreList).replace(`'`, `"`)
  );
}
window.postMessage(
  {
    message: 'sethappyinspectorignore',
    source: JSON.stringify(ignoreList),
  },
  '*'
);

export const getSourceLocation = async (error: Error) => {
  if (!error) {
    return { source: null };
  }
  // get paths match http(s) from error stack
  const paths =
    error.stack &&
    error.stack.match(
      /((ht|f)tps?):\/\/[\w\-]+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?/gi
    );

  // the first path should be the component location in ganerated code
  const currentLocation = paths && paths[0] && paths[0].replace(/^\(|\)$/g, '');
  // tokens eg ['http(s)',//filepath,row,column]
  const tokens = currentLocation ? currentLocation.split(':') : [];
  const row = Number(tokens[tokens.length - 2]);
  const column = Number(tokens[tokens.length - 1]);
  const filePath = currentLocation
    ? currentLocation.replace(`:${row}:${column}`, '')
    : '';
  const ganeratedFileKey = `ganeratedFileKey:${filePath}`;
  // const mapString = localStorage.getItem(ganeratedFileKey);
  let rawSourceMap = sourceMapCache[ganeratedFileKey];
  console.log('rawSourceMap', !!rawSourceMap);
  if (!rawSourceMap) {
    const response = await fetch(filePath);
    const body = await response.text();
    const mapPath = body.split('\n').slice(-1)[0].split('sourceMappingURL=')[1];
    const mapRealPath = re_weburl.test(mapPath)
      ? mapPath
      : filePath.split('/').slice(0, -1).join('/') + `/${mapPath}`;
    const mapPesponse = await fetch(mapRealPath);
    rawSourceMap = await mapPesponse.json();

    // try {
    //   localStorage.setItem(ganeratedFileKey, JSON.stringify(rawSourceMap));
    // } catch (e) {
    //   console.log('save rawSourceMap faild:', mapRealPath);
    // }
  }
  const consumer = await new sourceMap.SourceMapConsumer(rawSourceMap);

  const res = consumer.originalPositionFor({
    line: row,
    column: column,
  });
  if (res && res.source) {
    sourceMapCache[ganeratedFileKey] = rawSourceMap;
  }
  return res;
};

export function getDisplayName(type: any, fallbackName = 'Anonymous'): string {
  let displayName = fallbackName;
  if (typeof type.displayName === 'string') {
    displayName = type.displayName;
  } else if (typeof type.name === 'string' && type.name !== '') {
    displayName = type.name;
  }
  return displayName;
}

export function checkFilter(type: any) {
  const name = getDisplayName(type);
  return (
    filters.filter((item: any) => {
      if (item._regex && name && RegExp(item._regex, 'g').exec(name) !== null) {
        return true;
      }
    }).length > 0
  );
}

export function getEditorScheme(
  path: string,
  line: number,
  column: number,
  editor: string = 'vscode'
) {
  switch (editor) {
    case 'vscode':
      return `vscode://file${path}:${column}:${line}`;
      break;
    case 'atom':
      return `atom://open?url=file://${path}`;
      break;
    default:
      return `vscode://file${path}`;
      break;
  }
}
export function isIgnored(name: string) {
  if (ignoreList.some((rx: any) => new RegExp(rx).test(name))) {
    return true;
  }
  return false;
}

export const checkCodeInEditor = async (sourceTrace: Error) => {
  // console.log('checkCodeInEditor');
  // StackTrace.fromError(sourceTrace).then((stackframes) => {
  //   console.log('stackframes', stackframes);
  // });
  const sourceRes = await getSourceLocation(sourceTrace);
  const { source, line, column } = sourceRes;
  const sourceLocation = getEditorScheme(source, line, column);
  window.location.href = sourceLocation;
};

export const getElementFiber = (element: any): any => {
  const fiberKey = Object.keys(element).find(
    (key) =>
      key.startsWith('__reactInternalInstance$') ||
      key.startsWith('__reactFiber$')
  );

  if (fiberKey) {
    return element[fiberKey];
  }

  return null;
};

export function isLocalEnv() {
  return (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === ''
  );
}

export function checkCodeInDevtool(element) {
  const fiber = getElementFiber(element.dom);
  window.__SOURCE_TO_INSPECT__ =
    fiber && (fiber.return.elementType || fiber.return.type);
  window.postMessage(
    {
      message: 'inspectsource',
      source: 'happy-inspector',
    },
    '*'
  );
}
