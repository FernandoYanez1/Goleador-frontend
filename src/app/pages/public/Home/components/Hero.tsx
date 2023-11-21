import React, {ReactNode} from "react";

interface Props {
    children: ReactNode;
}

export default function Hero({children}: Props) {
    return (
        <>
            <div className="public-hero-wrapper">
                {children}
            </div>
        </>
    );
}
