import messageTemplateData from "../../data/message-templates.v0.1.json";
import type { MessageMode, MessageTemplate, NagIntensity } from "./schema";

export const messageTemplates: MessageTemplate[] =
  messageTemplateData.releaseTemplates as MessageTemplate[];

export const getTemplatesByMode = (mode: MessageMode): MessageTemplate[] =>
  messageTemplates.filter((template) => template.mode === mode);

export const getNagTemplatesByIntensity = (
  intensity: NagIntensity | "strong"
): MessageTemplate[] => {
  if (intensity === "strong") {
    throw new Error("Unsupported nag intensity: strong");
  }

  return messageTemplates.filter(
    (template) => template.mode === "nag" && template.intensity === intensity
  );
};

export const getTemplateById = (id: string): MessageTemplate | undefined =>
  messageTemplates.find((template) => template.id === id);
