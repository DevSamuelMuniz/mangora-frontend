import type { Instrumentation } from "next";

/** Captures uncaught render/route errors in host logs with a user-visible digest. */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const path = request.path.split("?", 1)[0];
  const details = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { name: "UnknownError", message: String(error), stack: undefined };
  const digest = error && typeof error === "object" && "digest" in error && typeof error.digest === "string"
    ? error.digest
    : undefined;
  console.error(JSON.stringify({
    event: "next_request_error",
    digest,
    ...details,
    method: request.method,
    path,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  }));
};
