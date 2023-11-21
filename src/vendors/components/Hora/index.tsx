import React from 'react';
import {Calendar} from 'primereact/calendar';

const AnttHora: React.FC<any> = ({ campo, setCampo, placeHolder, formato, ...rest }) => {
  return (
    <>
      <Calendar
        placeholder={placeHolder}
        value={campo}
        onChange={(e) => setCampo(e.value)}
        timeOnly
        className="antt-calendar"
        mask="99:99"
        hourFormat="HH:mm"
        {...rest}
      />
    </>
  );
};
export default AnttHora;
