import type { useT } from "@/i18n/provider";
import { PrintError, type PrintResult } from "./types";

type Translate = ReturnType<typeof useT>;

export function printErrorMessage(t: Translate, cause: unknown, fallback = "labels.printError") {
  return t(cause instanceof PrintError ? `labels.printingErrors.${cause.code}` : fallback);
}

export function printResultMessage(t: Translate, result: PrintResult) {
  if (result === "skipped") return "";
  if (result === "dialog-opened") return t("labels.browserOpened");
  if (result === "download-requested") return t("labels.downloadRequested");
  return t("labels.printSubmitted");
}
