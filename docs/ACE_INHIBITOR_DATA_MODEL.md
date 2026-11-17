# EAPF — ACE inhibitor module: data model and review workflow

Status: draft, not approved for clinical use
Module version: 0.1.0-draft
Last reviewed: not yet reviewed

## Scope

The first pharmacology module is the angiotensin-converting enzyme inhibitor (ACEi / иАПФ) class. The registry currently lists 17 internationally known INNs as a starting index. Listing a substance does not establish current marketing authorisation, supply, or availability in Estonia.

## Data entities

The reusable model is intended to support other drug classes and clinical topics:

- Drug: INN, brand/product presentations, ATC code, class, formulation, strength, route, pharmacokinetics.
- Indication: indication wording, population, jurisdiction, source, approval status.
- DoseRegimen: indication-specific starting/target/maximum dose, titration, frequency, route, population restrictions, source and review status.
- RenalAdjustment: eGFR/CrCl method and band, action, evidence/source, product-specific SmPC link.
- Contraindication / Warning: condition, severity, applicability, source, jurisdiction and date checked.
- Interaction: interacting substance/class, mechanism, clinical consequence, management, evidence and source.
- MonitoringParameter: test/measurement, baseline requirement, follow-up interval, trigger and action; every item needs a source.
- EvidenceClaim: one concise claim linked to one or more sources; evidence certainty and reviewer notes.
- Source: publisher, title, version/date, DOI/PMID/URL, jurisdiction, access date, copyright/licence note.
- ContentVersion / Review: immutable snapshot, reviewer, review date, status, change rationale.

## Mandatory review states

1. not_reviewed — imported or drafted; not suitable for clinical decision support.
2. source_checked — checked against a current primary source; still awaiting clinical approval.
3. expert_approved — reviewed and approved by a named qualified clinical reviewer for a defined jurisdiction and use.
4. archived — superseded; retained for audit/history.

Only expert_approved content may be considered for a future clinical decision-support rule. Even then, each rule needs independent validation and governance approval before release.

## Fields intentionally left blank

The current code registry deliberately leaves indication-specific dosing, renal dose adjustment, contraindications, interactions, monitoring actions and pregnancy guidance empty. These must be transcribed and checked against the current SmPC for the exact product/formulation and reconciled with current guidelines. Do not infer one molecule's product label from another molecule's label.

## Initial sources to review

- KDIGO 2024 CKD guideline: https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf
- ESC 2024 elevated blood pressure and hypertension guideline, DOI 10.1093/eurheartj/ehae178: https://academic.oup.com/eurheartj/article/45/38/3912/7741010
- Estonian Register of Medicinal Products (Ravimiregister): https://www.ravimiregister.ee/

Use Ravimiregister to verify current Estonian authorisation, product presentation and the latest Estonian SmPC/PIL. The Estonian register states that authorised product records include SmPC and patient leaflet information. Product availability must be checked per INN/product and date.

Copyright/licensing note: the ESC guideline page states that use of ESC guideline content in software tools, computational models or algorithms requires a formal licence agreement. Until permissions are clarified, EAPF may maintain bibliographic references and independently authored summaries, but must not copy or transform protected ESC guideline text/tables into decision rules.

## Safety boundaries for the first release

- No automatic prescribing, dose selection, or treatment changes.
- No patient identifiers or real patient data in this demo.
- The current patient form creates a local summary only; it is not a clinical analysis.
- A future rules engine must display the source, version, date checked, rule rationale and limitations for every finding.
- All clinical content requires expert review and local regulatory/privacy assessment before real-world use.