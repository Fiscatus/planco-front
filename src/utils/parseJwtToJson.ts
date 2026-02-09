const parseJwtToJson = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decodificar como UTF-8
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        // biome-ignore lint/style/useTemplate: <looks like a template string>
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erro ao decodificar JWT:', e);
    return null;
  }
};

export default parseJwtToJson;
