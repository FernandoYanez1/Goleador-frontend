import React from "react";
import CommonQuestionItem from "./CommonQuestionItem";
import CommonQuestionMock from "../../../../mocks/common-question-mock";

export default function CommonQuestion() {
    const list = CommonQuestionMock.LIST
    return (
        <>
            <div className="common-question">
                <h1>PERGUNTAS FREQUENTES</h1>
                {list.map((m: any, index: any) => <CommonQuestionItem key={index} title={m.title} answer={m.answer}/>)}

            </div>
        </>
    );
}
