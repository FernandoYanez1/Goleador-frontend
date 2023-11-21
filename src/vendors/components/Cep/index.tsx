import React, {useState} from 'react';
import {InputMask} from 'primereact/inputmask';

const AnttCep: React.FC<any> = ({ campo, setCampo, placeHolder, ...rest }) => {
  const cepMask = '99.999-999';
  const [mask, setMask] = useState(cepMask);
  return (
    <>
      <InputMask
        placeholder={placeHolder}
        mask={mask}
        className="form-control"
        value={campo}
        slotChar={'_'}
        autoClear={false}
        unmask={true}
        onChange={(e: any) => {
          setCampo(e.target.value);
          setMask(cepMask);
        }}
        {...rest}
      />
    </>
  );
};
export default AnttCep;
