import * as React from 'react';
import s from './style.scss';
type PropsType = {
  expended: boolean;
  onclick: () => void;
};
const FoldIcon = (props: PropsType) => {
  const { expended, onclick } = props;
  return (
    <i
      onClick={onclick}
      className={`${s.arrow} ${expended ? s.down : s.right}`}
    ></i>
  );
};
export default FoldIcon;
