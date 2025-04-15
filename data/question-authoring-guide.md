# Question Authoring Guide for Organic Chemistry Quiz

## Introduction

This guide explains how to properly format question data for the Organic Chemistry Quiz Game. It covers both the required JSON structure for questions and the accompanying CSV file format needed for generating molecular SVGs with RDKit.

## JSON File Format

The quiz engine expects a specific JSON structure. All questions must be nested within a parent object with a `"questions"` property.

### Required Structure

```json
{
  "questions": [
    {
      // Question 1 object
    },
    {
      // Question 2 object
    },
    // Additional questions...
  ]
}
```

### Question Object Fields

Each question object must include the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier for the question (e.g., "q6") |
| `questionText` | String | The displayed question prompt |
| `product` | Object | Details of the reaction product (see below) |
| `reagents` | Array | List of available reagent options (see below) |
| `correctReagents` | Array | List of reagent IDs that form the correct answer |
| `reactionType` | String | Classification of the reaction type |
| `correctFeedback` | String | Message displayed for correct answers |
| `incorrectFeedback` | String | Message displayed for incorrect answers |
| `chemistryNotes` | String | Educational notes about the reaction (supports HTML) |

### Product and Reagent Objects

Both the `product` object and each item in the `reagents` array must follow this structure:

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Chemical name of the molecule |
| `formula` | String | Chemical formula |
| `imagePath` | String | Path to the SVG image file (e.g., "assets/molecules/acetone.svg") |
| `textRepresentation` | String | Text fallback representation of the molecule |

For reagents, an additional `id` field is required, which must be unique and used in the `correctReagents` array.

### Example Question Object

```json
{
  "id": "q6",
  "questionText": "Select the reagents for this Aldol Condensation reaction:",
  "product": {
    "name": "4-Phenyl-3-buten-2-one",
    "formula": "C10H10O",
    "imagePath": "assets/molecules/4-phenyl-3-buten-2-one.svg",
    "textRepresentation": "C6H5-CH=CH-CO-CH3"
  },
  "reagents": [
    {
      "id": "acetone",
      "name": "Acetone",
      "formula": "C3H6O",
      "imagePath": "assets/molecules/acetone.svg",
      "textRepresentation": "CH3-CO-CH3"
    },
    {
      "id": "benzaldehyde",
      "name": "Benzaldehyde",
      "formula": "C7H6O",
      "imagePath": "assets/molecules/benzaldehyde.svg",
      "textRepresentation": "C6H5-CHO"
    },
    // Additional reagents...
  ],
  "correctReagents": ["benzaldehyde", "sodium-hydroxide"],
  "reactionType": "Aldol Condensation",
  "correctFeedback": "Correct! This is an aldol condensation where benzaldehyde reacts with acetone under basic conditions (NaOH) to form 4-phenyl-3-buten-2-one, also known as benzalacetone.",
  "incorrectFeedback": "Incorrect. The aldol condensation requires an aldehyde and a base to deprotonate the alpha carbon of the ketone. Try again with the correct combination.",
  "chemistryNotes": "<p>The <strong>Aldol Condensation</strong> is a powerful C-C bond-forming reaction:</p><ul><li>It occurs between two carbonyl compounds, at least one of which has an α-hydrogen</li><li>Base deprotonates the α-carbon to form an enolate</li><li>The enolate acts as a nucleophile and attacks the carbonyl carbon of the other molecule</li><li>Dehydration occurs to form an α,β-unsaturated carbonyl compound</li></ul>"
}
```

### Common Mistakes to Avoid

1. **Missing the parent object**: Placing questions directly in an array instead of inside a `"questions"` property
2. **Inconsistent IDs**: Using duplicate IDs or referencing non-existent reagent IDs
3. **HTML formatting**: Not properly escaping HTML in `chemistryNotes` field
4. **Image paths**: Incorrect paths to SVG files that don't match the actual file structure

## CSV File for Molecule SVGs

To facilitate generating SVG files with RDKit, provide a separate CSV file containing molecule information in the following format:

### CSV Format

The CSV should have two columns:
1. `name` - The molecule name (should match the name in the JSON file)
2. `smiles` - The SMILES notation representing the molecule structure

```
name,smiles
Acetone,CC(=O)C
Benzaldehyde,C1=CC=C(C=C1)C=O
4-Phenyl-3-buten-2-one,CC(=O)C=CC1=CC=CC=C1
Sodium Hydroxide,[Na+].[OH-]
```

### SMILES Notation

SMILES (Simplified Molecular Input Line Entry System) is a string notation that represents molecular structures. For example:
- Methane: `C`
- Ethanol: `CCO`
- Benzene: `c1ccccc1`

For more complex molecules, consider using a chemical structure drawing program that can export SMILES notation.

### Naming Conventions

- Use the same molecule names in both the JSON and CSV files
- Follow standard chemical nomenclature
- For file paths in the JSON, use lowercase with hyphens for spaces (e.g., "4-phenyl-3-buten-2-one.svg")

## RDKit SVG Generation

The CSV file will be used with RDKit to generate SVG representations of the molecules. The generated SVGs should be:

1. Placed in the `assets/molecules/` directory
2. Named according to the convention: lowercase name with hyphens replacing spaces (e.g., "4-phenyl-3-buten-2-one.svg")
3. Referenced correctly in the `imagePath` property in the JSON file

## Implementation Workflow

1. Create the question content with all required fields
2. List all unique molecules used in the questions
3. Generate the SMILES notation for each molecule
4. Create the CSV file with name-SMILES pairs
5. Process the CSV with RDKit to generate SVG files
6. Verify that all SVG files are correctly named and placed
7. Finalize the JSON file with correct references to SVG files
8. Validate the JSON structure before deploying

## Validation Checklist

Before submitting the questions:

- [ ] JSON has the correct parent `"questions"` property
- [ ] All required fields are present for each question
- [ ] Reagent IDs are unique across all questions
- [ ] `correctReagents` only reference valid reagent IDs
- [ ] All molecules have corresponding entries in the CSV file
- [ ] SMILES notations are valid and accurately represent the molecules
- [ ] SVG file paths are correctly formatted and referenced

By following this guide, you will ensure that your questions are correctly formatted for the Organic Chemistry Quiz Game and that all molecular structures can be properly visualized.
