import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import If from "../../../../../vendors/components/If";

interface Props {
    icon: any;
    title: any;
    description: any;
    isImage?: any;
}

export default function TransformItems({icon, title, description, isImage}: Props) {

    return (
        <>
            <div className="public-transform-items-wrapper">
                <div>
                    <If condition={isImage}>
                        <img src={icon} alt={title} />
                    </If>
                    <If condition={!isImage}>
                        <FontAwesomeIcon style={{fontSize: '56px', color: 'var(--orange)'}} icon={icon} />
                    </If>
                </div>
                <div>
                    <h5>{title}</h5>
                    <p>{description}</p>
                </div>
            </div>
        </>
    );
}
