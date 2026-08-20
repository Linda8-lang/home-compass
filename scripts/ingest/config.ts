import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../..");

export const OUTPUT_DIR = path.join(REPO_ROOT, "src", "data", "generated");
export const LOG_DIR = path.join(REPO_ROOT, "logs");
export const LOG_FILE = path.join(LOG_DIR, "ingestion-errors.log");

// Toronto Police Service — Neighbourhood Crime Rates Open Data (ArcGIS FeatureServer).
// Verified live endpoint; supports standard Esri query params (where/outFields/f).
export const TPS_SAFETY_ENDPOINT =
  "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Neighbourhood_Crime_Rates_Open_Data/FeatureServer/0/query";

// City of Toronto Open Data (CKAN) — 2021 Census Neighbourhood Profiles, 158-model.
// Neighbourhood-level median shelter cost is the closest CKAN-published rent proxy;
// City of Toronto does not itself publish a market-rent-by-neighbourhood dataset.
export const CKAN_NEIGHBOURHOOD_PROFILES_XLSX =
  "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/6e19a90f-971c-46b3-852c-0c48c436d1fc/resource/19d4a806-7385-4889-acf2-256f1e079060/download/nbhd_2021_census_profile_full_158model.xlsx";

// CMHC's Housing Market Information Portal (HMIP) generates Rental Market Survey
// exports dynamically per geography/table selection and does not publish a stable
// static XLSX URL. To populate this fallback baseline:
//   1. Open the HMIP table for the target geography, e.g.
//      https://www03.cmhc-schl.gc.ca/hmip-pimh/en/TableMapChart/Table?TableId=2.1.31.3&GeographyId=2270&GeographyTypeId=3&DisplayAs=Table&GeograghyName=Toronto
//   2. Use the page's Excel export action and capture the resulting download URL
//      from the browser's network tab (it is session/selection-scoped).
//   3. Set it as the CMHC_XLSX_URL environment variable before running `ingest:cmhc`.
export const CMHC_XLSX_URL = process.env["CMHC_XLSX_URL"] ?? "";
