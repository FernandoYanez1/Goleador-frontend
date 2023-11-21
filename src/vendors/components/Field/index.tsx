import React, {ReactNode} from 'react';
import If from '../If';

interface Props {
  breakLine?: boolean;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  className?: string;
  offset?: number;
  label?: string;
  labelClassName?: string;
  valid?: boolean;
  invalidLabel?: string;
  style?: any;
  required?: boolean;
  col: number;
  children: ReactNode;
  id?: any;
}

const Field: React.FC<Props> = (props) => {
  let valid = props.valid;
  let required = props.required;
  if (valid !== false) {
    valid = true;
  }
  if (required !== true) {
    required = false;
  }
  const sm = props.sm ? props.sm : '12';
  const md = props.md ? props.md : props.col;
  const lg = props.lg ? props.lg : props.col;
  const xl = props.xl ? props.xl : props.col;
  const offset = props.offset ? `lg:col-offset-${props.offset} xl:col-offset-${props.offset}` : '';
  const className = `form-layout col-12 sm:col-${sm} md:col-${md} lg:col-${lg} xl:col-${xl} ${
    props.className ? props.className : ''
  } ${offset}`;

  const labelClassName = `antt-field ${valid === true ? '' : 'antt-field-invalid'} ${props.labelClassName}`

  return (
    <>
      <div id={props.id} style={{...props.style, paddingBottom: (valid ? '30px' : '')}} className={className}>
        <If condition={!!props.label}>
          <label className={labelClassName}>{props.label}<span style={{color: 'red'}}>{required ? ' *' : ''}</span></label>
        </If>
        {props.children}
        <If condition={!valid}>
          <label
            style={{marginTop: '5px'}}
            className="antt-field-invalid">
            {props.invalidLabel ? props.invalidLabel : 'Campo obrigatório.'}
          </label>
        </If>
      </div>
      <If condition={!!props.breakLine}>
        <div style={{padding: '0!important', width: '100%'}}></div>
      </If>
    </>
  );
};
export default Field;
