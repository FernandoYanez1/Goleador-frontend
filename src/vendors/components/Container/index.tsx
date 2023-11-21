import React, {ReactNode} from 'react';

interface Props {
  style?: any;
  className?: any;
  children: ReactNode;
}

const Container: React.FC<Props> = (props) => {
  const _className = !!props.className ? props.className : '';
  return (
    <div className={`grid ${_className}`} style={props.style}>
      {props.children}
    </div>
  );
};
export default Container;
