import React, {ReactNode} from 'react';

interface Props {
  condition: boolean;
  children: ReactNode;
};

const If: React.FC<Props> = ({condition, children}) => {
  if (!condition) {
    return <></>
  }
  return <>{children}</>
}
export default If;
