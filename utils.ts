// @ts-nocheck
/* eslint-disable no-useless-escape */
/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import sourceMap from 'source-map';
export const SHOPEE_COMPONENT_FILTERS = '__SHOPEE_COMPONENT_FILTERS__';
const filtersString = localStorage.getItem(SHOPEE_COMPONENT_FILTERS);
const filters = filtersString ? JSON.parse(filtersString) : [];

export const getSourceLocation = async (error: Error) => {
  if (!error) {
    return { source: null };
  }
  const path = error.stack.match(
    /((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?/gi
  );
  const currentLocation = path && path[0] && path[0].replace(/^\(|\)$/g, '');
  const tokens = currentLocation.split(':');
  const row = Number(tokens[tokens.length - 2]);
  const column = Number(tokens[tokens.length - 1]);
  const filePath = currentLocation.replace(`:${row}:${column}`, '');
  const ganeratedFileKey = `ganeratedFileKey:${filePath}`;
  const mapString = localStorage.getItem(ganeratedFileKey);
  let rawSourceMap = null;
  if (mapString) {
    rawSourceMap = JSON.parse(mapString);
  } else {
    const response = await fetch(filePath);
    const body = await response.text();
    const mapPath = body.split('\n').slice(-1)[0].split('sourceMappingURL=')[1];
    const mapPesponse = await fetch(`/${mapPath}`);
    rawSourceMap = await mapPesponse.json();
    try {
      localStorage.setItem(ganeratedFileKey, JSON.stringify(rawSourceMap));
    } catch (e) {
      console.log(e);
    }
  }
  const consumer = await new sourceMap.SourceMapConsumer(rawSourceMap);
  const res = consumer.originalPositionFor({
    line: row,
    column: column,
  });
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
