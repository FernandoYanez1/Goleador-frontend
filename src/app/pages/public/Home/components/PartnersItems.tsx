import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight, faLocationDot} from "@fortawesome/free-solid-svg-icons";
import {faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import PhonePipe from "../../../../pipe/PhonePipe";
import AppButton from "../../../../../vendors/components/Button";

interface Props {
    item: any;
    index: any;
}

export default function PartnersItems({item, index}: Props) {
    const mod = (index % 3) + 1;
    return (
        <>
            <div className="item-pre-wrapper">
                <div className="item" style={{backgroundImage: `url('${item.img}')`}}>
                    <div></div>
                    <div className="wave" style={{backgroundImage: `url('/media/svg/waves-${mod}.svg')`}}>
                        <h4>{item.name ? item.name.toUpperCase() : ''}</h4>
                        <div className="wave-wrapper">
                            <div>
                                <section>
                                    <FontAwesomeIcon icon={faLocationDot} color="var(--orange)"
                                                     style={{fontSize: '25px'}}/>
                                    <label style={{marginLeft: '10px'}}>{item.location}</label>
                                </section>
                                <section>
                                    <FontAwesomeIcon icon={faWhatsapp} color="var(--orange)"
                                                     style={{fontSize: '25px'}}/>
                                    <label style={{marginLeft: '10px'}}>{PhonePipe({value: item.phone})}</label>
                                </section>
                            </div>
                            <div>
                                <AppButton
                                    color="var(--orange)"
                                    faIconStyle={{fontSize: '15px'}}
                                    className="rounded-button"
                                    faIcon={faArrowRight}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
