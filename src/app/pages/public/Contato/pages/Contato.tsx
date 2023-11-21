import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import {InputMask} from "primereact/inputmask";
import AppButton from "../../../../../vendors/components/Button";
import {Toast} from "primereact/toast";
import ToastService from "../../../../../vendors/services/toastService";
import ContatoController from "../controller/contato.controller";
import {useEffect} from "react";

export default function Contato() {
    const controller = new ContatoController();

    useEffect(() => {
        controller.init();
    }, []);
    return (
        <>
            <Toast
                baseZIndex={8000}
                ref={(el) => ToastService.init(el)}
                style={{paddingTop: 40, width: 'auto', height: 'auto'}}
            />
            <div className="contato">
                <Card title="Cadastro de barbearias">
                    <div style={{marginBottom: '20px'}}>
                        <b>Quantidade de registros cadastrados: </b>
                        <label>{controller.qtde}</label>
                    </div>

                    <div className="flex justify-content-center flex-column">
                        <InputText placeholder="Local"
                                   className="mt-5"
                                   value={controller.local}
                                   onChange={(e) => controller.setLocal(e.target.value)}
                        />
                        <InputText placeholder="Nome"
                                   className="mt-5"
                                   value={controller.nome}
                                   onChange={(e) => controller.setNome(e.target.value)}
                        />
                        <InputMask className="mt-5"
                                   mask="(99) 9 9999-9999"
                                   autoClear={false}
                                   value={controller.telefone}
                                   onChange={(e) => controller.setTelefone(e.value)}
                                   unmask={true}
                                   placeholder="Telefone"/>
                        <AppButton
                            disabled={controller.block}
                            onClick={() => controller.cadastrar()}
                            label="Cadastrar"
                            className="mt-5 p-button-orange"
                        />
                    </div>
                </Card>
            </div>
        </>
    );
}
