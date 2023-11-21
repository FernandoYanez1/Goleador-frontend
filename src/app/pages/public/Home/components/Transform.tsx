import React from "react";
import TransformItems from "./TransformItems";
import AppButton from "../../../../../vendors/components/Button";
import {faGlobeAmericas, faPhone} from "@fortawesome/free-solid-svg-icons";
import {faWhatsapp} from "@fortawesome/free-brands-svg-icons";

export default function Transform() {

    return (
        <>
            <section className="public-transform">
                <h1>TRANSFORME SEU NEGÓCIO COM NOSSOS RECURSOS</h1>
                <p className="semi-title">Descubra como nossa solução completa revulociona a gestão do seu negócio:</p>
                <div className="public-card-transform">
                    <div className="wrapper">
                        <div className="public-card-transform-line">
                            <TransformItems icon="/media/svg/schedule.svg" title="AGENDAMENTOS SIMPLIFICADOS"
                                            isImage={true}
                                            description="Gerencie sua agenda de maneira simples e eficiente."/>
                            <TransformItems icon={faWhatsapp}
                                            title="ESTEJA SEMPRE INFORMADO"
                                            description="Com a Moicanos você recebe lembretes de tudo via Whatsapp."/>
                        </div>
                        <div className="public-card-transform-line">
                            <TransformItems icon={faGlobeAmericas}
                                            title="JÁ PENSOU EM EXPANDIR SUAS FRONTEIRAS?"
                                            description="Com a nossa vitrine sua barbearia pode ser encontrada de qualquer lugar do Brasil."/>
                            <TransformItems icon="/media/svg/chart.svg" title="SABE AQUELA PROMOÇÃO?"
                                            isImage={true}
                                            description="Com nossa plataforma você poderá enviar mensagens customizadas para todos os seus clientes."/>
                        </div>
                        <div className="public-card-transform-line">
                            <TransformItems icon="/media/svg/page.svg" title="TENHA UMA PÁGINA WEB PARA CHAMAR DE SUA"
                                            isImage={true}
                                            description="Customize sua própria página com a cara do seu negócio."/>
                            <TransformItems icon="/media/svg/finance.svg" title="DÊ ADEUS ÀS PLANILHAS"
                                            isImage={true}
                                            description="Nossa plataforma conta com um sistema de gestão completo,
                                            incluindo gráficos e métricas que ajudarão a alavancar seu faturamento."/>
                        </div>
                    </div>
                    <div className="flex justify-content-center">
                        <AppButton className="p-button-orange"
                                   label="EXPERIMENTE AGORA"/>
                    </div>
                </div>
            </section>
        </>
    );

}
