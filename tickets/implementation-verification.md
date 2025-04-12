# Implementation Verification Protocol

When an implementation requires verification or does not show visible changes, follow this protocol to provide clear information about the changes made and how to verify them.

## 1. Create a Verification Document

Create a new markdown file in `tickets/verifications/` with the following format:

```markdown
# Verification Guide: Ticket #[NUMBER] - [Brief Title]

**Implementation Date:** [Current Date]
**Implemented by:** VS Code AI Agent
**Files Modified:** 
- `[filename1]`
- `[filename2]`

## What Was Implemented

[Detailed explanation of what changes were made and why. Be specific about code changes, configuration updates, or other modifications.]

## Expected Behavior

[Clear description of what behavior should be observed when the implementation is working correctly.]

## Verification Steps

1. [Specific step-by-step instructions for verifying the implementation]
2. [Include exact actions to take, inputs to provide, or conditions to set up]
3. [Note expected results for each step]

## Environment Requirements

- **Devices:** [Specific devices where changes should be visible]
- **Browsers:** [Specific browsers where changes should be visible]
- **Settings:** [Any special settings or conditions needed]
- **Test Data:** [Any specific test data needed to see the effect]

## Background Changes

[Description of any "invisible" changes that occur in the background, such as performance improvements, code refactoring, security enhancements, etc.]

## Troubleshooting

[Common issues that might prevent the changes from being visible and how to address them]

## Screenshots/Videos

[If applicable, describe what screenshots or videos could be provided to demonstrate the changes]
```

## 2. For Failed Implementations

If the implementation was unsuccessful, create a review document in `documentation/implementation-reviews/` with this format:

```markdown
# Implementation Review: Ticket #[NUMBER] - [Brief Title]

**Review Date:** [Current Date]
**Implemented by:** VS Code AI Agent
**Implementation Status:** Unsuccessful

## Implementation Approach

[Detailed explanation of the approach taken and specific changes made]

## Issues Encountered

[Specific issues, errors, or challenges that prevented successful implementation]

## Root Cause Analysis

[Analysis of why the implementation didn't work as expected]

## Code Changes Made

### [filename1]
```[language]
// Key code changes with explanation
```

## Alternative Approaches

[Recommendations for alternative approaches that might be more successful]

## Lessons Learned

[Key takeaways and insights gained from this implementation attempt]

## Recommendations for Next Steps

[Specific recommendations for a revised ticket or new approach]
```

## 3. Directory Structure

Maintain these directories for verification and review documents:

```
tickets/
├── active/
├── closed/
├── verifications/      # For verification documents
└── backlog/

documentation/
├── implementations/
├── features/
└── implementation-reviews/  # For failed implementation reviews
```

## 4. Next Steps Process

Based on the verification or review:

1. **If verified successfully:**
   - Follow the standard ticket closure protocol
   - Include a link to the verification document in the implementation documentation

2. **If verification shows issues:**
   - Create a follow-up ticket (e.g., #[NUMBER].1) addressing the specific issues
   - Reference the verification document in the new ticket

3. **If implementation failed:**
   - Create a new ticket with an adjusted approach
   - Reference the implementation review in the new ticket
   - Move the original ticket to a new `tickets/unsuccessful/` directory with appropriate status
