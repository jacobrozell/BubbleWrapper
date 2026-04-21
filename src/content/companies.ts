/** Static company roster; index wraps via modulo in `companyAt`. */
export type CompanyDef = {
  id: string;
  name: string;
  flavorLine: string;
};

export const COMPANIES: CompanyDef[] = [
  {
    id: 'acme',
    name: 'Acme Logistics',
    flavorLine: "Quota met. They'll miss you.",
  },
  {
    id: 'zenith',
    name: 'Zenith Packaging',
    flavorLine: 'Shipment closed. KPIs weep.',
  },
  {
    id: 'bubbleworks',
    name: 'BubbleWorks Consulting',
    flavorLine: 'Engagement exceeded. Please bill accordingly.',
  },
  {
    id: 'inbox_zero',
    name: 'Inbox Zero LLC',
    flavorLine: 'All bubbles addressed. Unsubscribe anytime.',
  },
  {
    id: 'serenity',
    name: 'Serenity Synergy Group',
    flavorLine: 'Synergy achieved. Mindfulness archived.',
  },
];

export function companyAt(companyIndex: number): CompanyDef {
  if (COMPANIES.length === 0) {
    return {
      id: 'unknown',
      name: 'Unknown Client',
      flavorLine: 'Contract on file.',
    };
  }
  const i =
    ((companyIndex % COMPANIES.length) + COMPANIES.length) % COMPANIES.length;
  return COMPANIES[i]!;
}
