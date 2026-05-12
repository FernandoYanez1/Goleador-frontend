import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons/faAnglesRight";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons"; // Ícone de escudo para o Admin
import AppButton from "../../../../../vendors/components/Button";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import If from "../../../../../vendors/components/If";
import { useHistory } from "react-router-dom";

export default function Topbar() {
  const [show, setShow] = useState(false);
  const history = useHistory();

  // PEGA OS DADOS DO USUÁRIO LOGADO
  const usuarioSalvo = localStorage.getItem("usuarioLogado");
  const estaLogado = !!usuarioSalvo;
  const usuario = estaLogado ? JSON.parse(usuarioSalvo) : null;

  // TRAVA DE SEGURANÇA: Só aparece se o nome for Fernando
  // Você também pode usar: usuario?.email === 'seu-email@gmail.com'
  const eAdmin =
    usuario?.email === "yanezfer31@gmail.com";

  const handleLoginClick = () => history.push("/public/login");
  const handlePerfilRealClick = () => history.push("/public/perfil");
  const handlePalpiteClick = () => history.push("/public/meus-palpites");
  const handleRegrasClick = () => history.push("/public/regras");
  const handlePlacarClick = () => history.push("/public/placar");
  const handleRankingClick = () => history.push("/public/ranking");
  const handleAdminClick = () => history.push("/public/admin");

  return (
    <>
      <div className="public-topbar-wrapper hide-mobile">
        <div className="public-topbar-group">
          <div>
            <img
              className="public-topbar-logo"
              src="/media/goleador-logo.png"
              alt="Logo"
            />
          </div>
          <div className="public-topbar-items">
            <div onClick={handleRegrasClick}>
              <h5>REGRAS</h5>
            </div>
            <div onClick={handlePalpiteClick}>
              <h5>MEUS PALPITES</h5>
            </div>
            <div onClick={handlePlacarClick}>
              <h5>FAZER PALPITE</h5>
            </div>
            <div onClick={handleRankingClick}>
              <h5>RANKING</h5>
            </div>

            {/* BOTÃO VIP: SÓ O FERNANDO VÊ */}
            {eAdmin && (
              <div
                onClick={handleAdminClick}
                style={{ cursor: "pointer", marginLeft: "15px" }}
              >
                <h5
                  style={{
                    color: "yellow",
                    border: "1px solid yellow",
                    padding: "2px 5px",
                    borderRadius: "4px",
                  }}
                >
                  ADMIN
                </h5>
              </div>
            )}

            {estaLogado ? (
              <div className="meu-perfil" onClick={handlePerfilRealClick}>
                <h5>MEU PERFIL</h5>
                <FontAwesomeIcon
                  style={{ marginLeft: "5px" }}
                  color="white"
                  icon={faAnglesRight}
                />
              </div>
            ) : (
              <div className="meu-perfil" onClick={handleLoginClick}>
                <h5>ENTRAR / CADASTRAR</h5>
                <FontAwesomeIcon
                  style={{ marginLeft: "5px" }}
                  color="white"
                  icon={faAnglesRight}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE --- */}
      <div className="public-topbar-wrapper-mobile hide-desktop">
        <div className="wrapper">
          <div>
            <AppButton
              onClick={() => setShow(!show)}
              color="#B56B57"
              faIconStyle={{ fontSize: "50px" }}
              faIcon={faBars}
            />
          </div>
          <div className="flex justify-content-center">
            <img
              className="public-topbar-logo"
              src="/media/goleador-logo.png"
              alt="Logo"
            />
          </div>
        </div>
      </div>

      <If condition={show}>
        <div className="public-mobile-menu hide-desktop">
          {eAdmin && (
            <div
              onClick={handleAdminClick}
              style={{ backgroundColor: "#444", color: "gold" }}
            >
              <h5>ADMINISTRAÇÃO</h5>
            </div>
          )}
          {estaLogado ? (
            <div className="meu-perfil" onClick={handlePerfilRealClick}>
              <h5>MEU PERFIL</h5>
            </div>
          ) : (
            <div className="meu-perfil" onClick={handleLoginClick}>
              <h5>ENTRAR</h5>
            </div>
          )}
          <div onClick={handlePlacarClick}>
            <h5>FAZER PALPITES</h5>
          </div>
          <div onClick={handlePalpiteClick}>
            <h5>MEUS PALPITES</h5>
          </div>
          <div onClick={handleRankingClick}>
            <h5>RANKING</h5>
          </div>
          <div onClick={handleRegrasClick}>
            <h5>REGRAS</h5>
          </div>
        </div>
      </If>
    </>
  );
}
