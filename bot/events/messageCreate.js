import { Events, PermissionFlagsBits } from "discord.js";
import { isChannelLocked } from "../state/imageLockStore.js";

const imageLinkRegex = /\.(png|jpe?g|gif|webp)(\?.*)?/i;

const deleteSafely = async (message) => {
  try {
    await message.delete();
  } catch (error) {
    if (error?.code === 10008) {
      return;
    }

    console.warn("Falha ao deletar mensagem no image lock.", error);
  }
};

export const name = Events.MessageCreate;

export const execute = async (message) => {
  if (message.author?.bot || message.webhookId) {
    return;
  }

  if (!message.inGuild()) {
    return;
  }

  if (!isChannelLocked(message.channelId)) {
    return;
  }

  const botPermissions = message.channel.permissionsFor(message.client.user);
  if (!botPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    return;
  }

  const attachments = message.attachments;
  if (attachments.size > 0) {
    for (const attachment of attachments.values()) {
      const contentType = attachment.contentType ?? "";
      if (!contentType.startsWith("image/")) {
        await deleteSafely(message);
        return;
      }
    }

    return;
  }

  if (!imageLinkRegex.test(message.content ?? "")) {
    await deleteSafely(message);
  }
};
