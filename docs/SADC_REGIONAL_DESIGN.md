# Tfumela SADC Regional Design

## Objective

Tfumela must be engineered as a SADC-ready platform, not a Botswana-only application.

SADC currently comprises 16 Member States: Angola, Botswana, Comoros, Democratic Republic of Congo, Eswatini, Lesotho, Madagascar, Malawi, Mauritius, Mozambique, Namibia, Seychelles, South Africa, Tanzania, Zambia and Zimbabwe. citeturn0search0

## Technical regional requirements

The platform must support country-specific configuration rather than country-specific code.

Each country profile should support:
- ISO country code
- international phone prefix
- country name and local display name
- language preferences
- supported service status
- country-specific transaction limits
- regulatory/compliance status
- permitted assets and networks
- future local payment/on-ramp/off-ramp partners
- country-specific notices and terms

## Country registry

| Country | ISO |
|---|---|
| Angola | AO |
| Botswana | BW |
| Comoros | KM |
| Democratic Republic of Congo | CD |
| Eswatini | SZ |
| Lesotho | LS |
| Madagascar | MG |
| Malawi | MW |
| Mauritius | MU |
| Mozambique | MZ |
| Namibia | NA |
| Seychelles | SC |
| South Africa | ZA |
| Tanzania | TZ |
| Zambia | ZM |
| Zimbabwe | ZW |

## Stablecoin architecture

USDT and USDC remain the only V1 customer transfer assets.

Country configuration must remain separate from blockchain asset/network configuration. This prevents country rules from being embedded in the smart contract.

## WhatsApp regional support

The WhatsApp layer must support international phone numbers and country prefixes. It must not assume Botswana numbers. Phone identifiers should be stored in canonical international format.

The conversation engine should support future localization without changing the transfer engine.

## Currency display

Blockchain settlement remains in USDT or USDC. Local fiat currencies are display/reference currencies only unless a future licensed on/off-ramp integration is introduced.

Examples include BWP, ZAR, SZL, LSL, NAD, MZN, ZMW, ZWL, MWK, MUR, SCR, AOA, TZS, MGA and KMF.

The backend must not present a fiat quote as a guaranteed conversion rate unless it comes from a defined rate source.

## Regional service availability

Every country must have an explicit service state: PLANNED, TESTNET, PILOT, LIVE, RESTRICTED, or DISABLED.

This allows Tfumela to expand country by country without rebuilding the application.

## Regulatory boundary

SADC-wide technical readiness is not the same as legal permission to provide financial or virtual-asset services in every country. Before public launch in a country, Tfumela must complete that country's legal/regulatory determination and implement any required licensing, registration, KYC/AML, consumer-protection, reporting, data, tax, or local-partner requirements. SADC is a regional integration body; national rules still apply. citeturn0search0turn0search10

KYC is deferred from the current engineering MVP, but the architecture must leave a clean place for a later compliance layer.

## Regional product goal

Long-term target: person in SADC country A -> Tfumela -> person in SADC country B, using supported stablecoins on BNB Smart Chain, subject to the legal and service-availability status of both countries.

The V1 testnet must already use country-neutral data models so regional expansion does not require a rewrite.
