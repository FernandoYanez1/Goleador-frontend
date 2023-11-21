import React, {useState} from "react";
import {Card} from "primereact/card";
import If from "../../../../../vendors/components/If";
import AppButton from "../../../../../vendors/components/Button";
import {faCirclePlus, faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";

interface Props {
    title: any;
    answer: any;
}
export default function CommonQuestionItem({ title, answer} : Props) {
    const [show, setShow] = useState(false);

    const header = () => <>
        <div className="header-wrapper">
            <h3>{title}</h3>
            <AppButton
                color="var(--orange)"
                faIcon={!show ? faPlus : faMinus}
                onClick={() => setShow(!show)}
            />
        </div>
    </>
    return (
        <>
            <Card header={header}>
                <If condition={show}>
                    <p className="answer-wrapper">
                        {answer}
                    </p>
                </If>
            </Card>
        </>
    );
}
