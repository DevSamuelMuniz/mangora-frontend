export type FiscalEnvironment = "HOMOLOGATION" | "PRODUCTION";
export type TaxRegime = "SIMPLES_NACIONAL" | "SIMPLES_EXCESSO" | "REGULAR";
export type FiscalDocumentType = "NFE" | "NFCE";
export type FiscalDocumentStatus = "DRAFT" | "READY" | "PROCESSING" | "AUTHORIZED" | "REJECTED" | "CANCELLED" | "ERROR";

export type FiscalSettingsResponse = {
  company: { id: string; tradeName: string; legalName: string | null; document: string | null; postalCode: string | null; street: string | null; number: string | null; city: string | null; state: string | null };
  settings: {
    enabled: boolean; environment: FiscalEnvironment; taxRegime: TaxRegime;
    stateRegistration: string | null; municipalRegistration: string | null; cnae: string | null;
    nfeSeries: number; nfceSeries: number; nextNfeNumber: number; nextNfceNumber: number;
    cscId: string | null; certificateLabel: string | null; certificateExpiresAt: string | null; provider: string; providerConnected: boolean;
  };
};

export type FiscalReadiness = {
  readyToPrepare: boolean; readyToTransmit: boolean; errors: string[]; warnings: string[];
  products: { total: number; incomplete: number; incompleteIds: string[] };
};

export type FiscalDocument = {
  id: string; companyId: string; saleId: string | null; createdByName: string;
  type: FiscalDocumentType; status: FiscalDocumentStatus; environment: FiscalEnvironment;
  series: number; number: number | null; accessKey: string | null; protocol: string | null; providerReference: string | null;
  xmlUrl: string | null; danfeUrl: string | null; rejectionCode: string | null; rejectionMessage: string | null;
  total: number; createdAt: string; authorizedAt: string | null; cancelledAt: string | null;
  sale: { id: string; number: number; customerName: string; createdAt: string } | null;
  items: Array<{ id: string; sequence: number; name: string; sku: string; quantity: number; unitPrice: number; total: number; ncm: string; cfop: string }>;
  events: Array<{ id: string; type: string; description: string; createdAt: string }>;
};
