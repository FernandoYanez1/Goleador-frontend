import React from 'react';
import {Dropdown, DropdownProps} from 'primereact/dropdown';

const AnttDropdown: React.FC<DropdownProps> = ({ ...rest }) => {
  return (
    <Dropdown
      filter
      filterBy={rest.optionLabel}
      optionLabel="name"
      showClear
      emptyMessage="Nenhum registro"
      emptyFilterMessage="Nenhum registro"
      placeholder="Selecione"
      {...rest}
    />
  );
};
export default AnttDropdown;
