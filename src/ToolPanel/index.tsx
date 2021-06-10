/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState, useReducer } from 'react';
import * as ReactDOM from 'react-dom';
import { useLocalStorage } from 'react-use';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { blue } from '@material-ui/core/colors';

import Switch from '@material-ui/core/Switch';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FoldIcon from './components/FoldIcon';
import Filters from './components/Filters';

import store from '../store';

import s from './style.scss';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      // Purple and green play nicely together.
      main: blue[500],
    },
    secondary: {
      // This is green.A700 as hex.
      main: '#11cb5f',
    },
  },
});

export const setupPannel = () => {
  const document = window.document;
  const pannelDom = document.createElement('div');
  pannelDom.setAttribute('id', 'componentInspector');
  document.body.appendChild(pannelDom);
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <Panel />
    </ThemeProvider>,
    document.getElementById('componentInspector')
  );
};

const Panel = () => {
  const { reducer, initialState } = store;
  const [toggle, setToggle] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [expended, setExpended] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [devilMode, setDevilMode, remove] = useLocalStorage('__devil_mode__');
  function toggleExpended() {
    setExpended(!expended);
  }
  return (
    <div className={s.panel}>
      <div>
        <div className={s.panelHeader}>
          <div>
            {toggle && (
              <FoldIcon onclick={toggleExpended} expended={expended} />
            )}{' '}
            Happy Inspector!
          </div>
          <Switch
            checked={state.checkedB}
            onChange={(event) => {
              setToggle(event.target.checked);
              store.toggleInspector(event.target.checked);
            }}
            color="primary"
          />
        </div>
        {toggle && expended && (
          <div>
            {/* <div className={s.panelHeader}>
              <div>Devil Mode</div>
              <Switch
                checked={!!devilMode}
                onChange={(event) => {
                  setDevilMode(event.target.checked);
                  window.location.reload();
                }}
                color="primary"
              />
            </div> */}
            <div className={s.listItem}>
              <input
                value={filterText}
                onChange={(event) => {
                  setFilterText(event.target.value);
                }}
                type="search"
                placeholder="Search a component"
              />
            </div>
            {/* <div className={s.listItem}>
              <label>
                <input
                  onChange={(event) => {
                    // console.log(event.target.checked);
                    dispatch({
                      type: 'selectAll',
                      checked: event.target.checked,
                    });
                  }}
                  type="checkbox"
                />
                &nbsp;&nbsp; Select All
              </label>
            </div> */}
            <div className={s.componentsList}>
              {Array.from(state.elementSet)
                .filter((element: any) => {
                  return (
                    filterText &&
                    element.displayName.includes(filterText) &&
                    element.dom &&
                    element.dom.offsetParent
                  );
                })
                .slice(0, 10)
                .map((element: any, index: number) => (
                  <div
                    onMouseOver={() => {
                      dispatch({
                        type: 'onMouseOver',
                        element,
                      });
                    }}
                    onMouseOut={() => {
                      dispatch({
                        type: 'onMouseOut',
                        element,
                      });
                    }}
                    className={`${s.listItem} ${
                      element.isFromFilter ? s.noSourceItem : ''
                    }`}
                    key={index}
                  >
                    <label>
                      <input
                        onChange={(event) => {
                          // console.log(event.target.checked);
                          dispatch({
                            type: 'selectComponent',
                            element,
                            checked: event.target.checked,
                          });
                        }}
                        checked={!!(element.overlay && element.inspected)}
                        type="checkbox"
                      />
                      &nbsp;&nbsp;
                      {element.displayName}
                    </label>
                  </div>
                ))}
            </div>
            {/* <Filters
              onAdd={() => {
                dispatch({
                  type: 'addFilter',
                });
              }}
              onRemove={(index) => {
                dispatch({
                  type: 'removeFilter',
                  index,
                });
              }}
              apply={() => {
                dispatch({
                  type: 'applyFilter',
                });
              }}
              onRegexChange={(index, regex) => {
                dispatch({
                  type: 'updateFilterRegex',
                  index,
                  regex,
                });
              }}
              onEnable={(index, enable) => {
                dispatch({
                  type: 'updateFilterEnable',
                  index,
                  enable,
                });
              }}
              filters={state.filters}
            /> */}
          </div>
        )}
      </div>
    </div>
  );
};
