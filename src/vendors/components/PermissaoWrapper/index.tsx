import React, {useEffect, useState} from 'react';
import AuthService from '../../services/authService';

interface Props {
  permissao: string;
  children: any;
}

const AnttPermissaoWrapper: React.FC<Props> = ({ permissao, children }) => {
  const authService = new AuthService();
  const auth = authService.getCurrentState();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!permissao) {
      setShow(true);
      return;
    }
    setShow(authService.temPermissao(permissao));
  }, [auth]);

  return <>{show && <>{children}</>}</>;
};
export default AnttPermissaoWrapper;
