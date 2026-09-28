---
name: api-testing
description: Practical guidance for testing REST APIs, including HTTP methods, status codes, response validation, and API assertions.
---

# API Testing Skill

Use this skill when working with REST API testing.

## What to check

When testing an API, verify:

1. HTTP status code
2. Response content type
3. Required response fields
4. Expected field values
5. Response time when a performance limit is provided

## Common HTTP methods

- GET — retrieve data
- POST — create data
- PUT — replace data
- PATCH — partially update data
- DELETE — remove data

## Test assertions

For each API test, clearly identify:

- Request URL
- HTTP method
- Expected status code
- Expected response format
- Required fields
- Important field-value assertions
- Performance expectations, if specified

## Reporting

Report:

- Test name
- Request
- Assertions
- Expected result
- Observed result
- PASS or FAIL

Do not claim that an API test was executed unless the API request was actually performed and the response was observed.