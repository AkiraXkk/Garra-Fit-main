const lockedChannelIds = new Set();

// TODO: Carregue os canais trancados do seu datastore aqui para persistir após reinicializações.
export const isChannelLocked = (channelId) => lockedChannelIds.has(channelId);

export const toggleChannelLock = (channelId) => {
  if (lockedChannelIds.has(channelId)) {
    lockedChannelIds.delete(channelId);
    // TODO: Persista o desbloqueio no seu datastore aqui.
    return false;
  }

  lockedChannelIds.add(channelId);
  // TODO: Persista o bloqueio no seu datastore aqui.
  return true;
};
