import React from "react";

interface Props {
    value: any;
}

export default function PhonePipe({value}: Props) {
    if (!value || value.length < 10) {
        return <></>;
    }
    let _value = value;
    if (value.length == 10) {
        _value = value.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
        _value = value.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    }
    return (
        <>
            {_value}
        </>
    );
}
