// Resolve o caminho da foto aceitando URL absoluta, caminho relativo e apenas o nome do arquivo
export function resolveFoto(foto?: string | null) {
  const fallback = 'https://via.placeholder.com/300x200?text=Sem+Imagem';
  if (!foto) return fallback;
  const raw = foto.trim();
  if (!raw) return fallback;
  // Já é absoluta ou começa com /
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  // Remove fakepath do Windows e drive letters
  const nome = raw.replace(/^([A-Za-z]:\\)?fakepath\\/i, '').replace(/^[A-Za-z]:\\/, '');
  return `/uploads/${nome}`;
}
