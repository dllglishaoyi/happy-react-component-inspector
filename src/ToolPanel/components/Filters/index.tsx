import React, { useState } from 'react';
import FoldIcon from '../FoldIcon';
import s from './style.scss';

type FilterType = {
  _enable: boolean;
  _regex: string;
};

type PropsType = {
  onAdd: () => void;
  apply: () => void;
  onRemove: (index: number) => void;
  filters: FilterType[];
  onRegexChange: (index: number, regex: string) => void;
  onEnable: (index: number, enable: boolean) => void;
};
const Filters = (props: PropsType) => {
  const [expended, setExpended] = useState(true);
  function toggleExpended() {
    setExpended(!expended);
  }
  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <FoldIcon onclick={toggleExpended} expended={expended} />
          Global Filter
        </div>
        {expended && <button onClick={props.onAdd}>ADD</button>}
      </div>
      {expended && (
        <div>
          {props.filters &&
            props.filters.map((item, index) => {
              return (
                <div className={s.filterItem} key={index}>
                  <input
                    onChange={(ev) => {
                      props.onRegexChange(index, ev.target.value);
                    }}
                    value={item._regex || ''}
                    placeholder="Regular expression"
                    className={s.filterInput}
                  />
                  <button
                    onClick={() => {
                      props.onRemove(index);
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          <button onClick={props.apply}>APPLY</button>
        </div>
      )}
    </div>
  );
};
export default Filters;
