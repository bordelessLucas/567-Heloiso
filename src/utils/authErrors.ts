/** Maps Firebase Auth error codes to user-facing Portuguese messages. */
export function getAuthErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return 'Não foi possível concluir a operação. Tente novamente.';
  }

  const code = String((error as { code: string }).code);

  switch (code) {
    case 'app/firebase-not-configured':
      return 'Firebase nao foi configurado nesta build. Verifique as variaveis do EAS.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/invalid-email':
      return 'Informe um e-mail válido.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um momento e tente de novo.';
    case 'auth/network-request-failed':
      return 'Falha de rede. Verifique sua conexão.';
    case 'auth/operation-not-allowed':
      return 'Login por e-mail/senha não está habilitado no Firebase Console.';
    case 'permission-denied':
      return 'Sem permissão para gravar o perfil. Verifique as regras do Firestore.';
    default:
      return 'Não foi possível concluir a operação. Tente novamente.';
  }
}
