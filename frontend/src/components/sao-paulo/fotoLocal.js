// Fotos são consultadas apenas ao selecionar o local, sem persistir URLs temporárias.
export async function buscarFotoLocal(maps, placeId) {
  if (!placeId) return null;
  const { Place } = await maps.importLibrary('places');
  const place = new Place({ id: placeId });
  await place.fetchFields({ fields: ['photos'] });
  const photo = place.photos?.[0];
  if (!photo) return null;
  return {
    url: photo.getURI({ maxWidth: 600, maxHeight: 400 }),
    autores: (photo.authorAttributions || []).map(author => ({ nome: author.displayName, url: author.uri })),
  };
}
