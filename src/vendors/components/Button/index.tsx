import React, {useState} from 'react';
import {Button} from 'primereact/button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const AppButton: React.FC<any> = ({
                                      permission,
                                      children,
                                      color,
                                      faIcon,
                                      faIconPos,
                                      faIconStyle,
                                      faIconOpts,
                                      ...rest
                                  }) => {
    const _rest: any = rest;
    const [showButton, setShowButton] = useState(true);

    const _children = () => {
        if (!faIcon) {
            return <>{children}</>;
        }
        const _icon = () => {
            return (
                <>
                    <FontAwesomeIcon
                        style={faIconStyle}
                        icon={faIcon}
                        color={color}
                        {...faIconOpts}
                    />
                </>
            );
        };
        if (!faIconPos || faIconPos === 'left') {
            return (
                <>
                    {_icon()}
                    {children}
                </>
            );
        }
        return (
            <>
                {children}
                {_icon()}
            </>
        );
    }
    return <>{showButton && <Button type="button"  {..._rest}>{_children()}</Button>}</>;
};
export default AppButton;
