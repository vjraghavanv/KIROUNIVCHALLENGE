# API Testing Power — Test Result

**Test name:** Retrieve post with id 1

## Request

- **URL:** https://jsonplaceholder.typicode.com/posts/1
- **HTTP method:** GET

## Assertions

| # | Assertion | Expected | Observed | Result |
|---|-----------|----------|----------|--------|
| 1 | Status code | 200 | 200 | PASS |
| 2 | Content type | application/json | application/json; charset=utf-8 | PASS |
| 3 | Required fields present | userId, id, title, body | all present | PASS |
| 4 | id value | 1 | 1 | PASS |
| 5 | Response time | < 500 ms | ~34.5 ms (0.034478 s) | PASS |

## Observed Response Body

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

## Summary

- **Status code:** 200
- **Content type:** application/json; charset=utf-8
- **Required fields:** userId, id, title, body (all present)
- **id value:** 1
- **Response time:** 0.034478 s (~34.5 ms)

## Final Verdict: PASS

All five assertions passed against the actual observed response from the GET request.

---

*Note: JSONPlaceholder does not publish a performance SLA. A common 500 ms threshold was applied for assertion #5. All other values were taken directly from the observed response.*
