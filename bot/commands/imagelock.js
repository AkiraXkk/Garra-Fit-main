import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { toggleChannelLock } from "../state/imageLockStore.js";

export const data = new SlashCommandBuilder()
  .setName("imagelock")
  .setDescription("Liga ou desliga o bloqueio de imagens neste canal.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export const execute = async (interaction) => {
  if (!interaction.inGuild()) {
    return interaction.reply({
      content: "Este comando só pode ser usado em servidores.",
      ephemeral: true,
    });
  }

  const memberPermissions = interaction.memberPermissions;
  const canManageChannels = memberPermissions?.has(
    PermissionFlagsBits.ManageChannels
  );
  const isAdministrator = memberPermissions?.has(
    PermissionFlagsBits.Administrator
  );

  if (!canManageChannels && !isAdministrator) {
    return interaction.reply({
      content: "Você precisa de ManageChannels ou Administrator para usar.",
      ephemeral: true,
    });
  }

  const isLockedNow = toggleChannelLock(interaction.channelId);
  const status = isLockedNow ? "ativado" : "desativado";

  return interaction.reply({
    content: `Image lock ${status} neste canal.`,
  });
};
